import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'
import { detectLanguage } from '@/lib/rag1/detect-language'
import { fetchHistory, formatHistory } from '@/lib/rag1/fetch-history'
import { buildMessages } from '@/lib/rag1/build-prompt'
import { validateInput, isGreeting, greetingReply } from '@/lib/rag1/validate-input'
import { detectRag2Intent } from '@/lib/rag2/detect-intent'
import { embedQuery, parallelSearch } from '@/lib/rag2/vector-search'

export const runtime = 'nodejs'

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

async function saveAssistantMessage(sessionId: string, content: string): Promise<string | null> {
  try {
    const db = await createServiceClient()
    const { data } = await db
      .from('ai_chat_messages')
      .insert({ session_id: sessionId, role: 'assistant', content })
      .select('id')
      .single()
    return data?.id ?? null
  } catch (e) {
    console.error('[rag2] assistant msg insert error:', e)
    return null
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { message, session_key, locale, user_id } = body

  // stream=true in query param or Accept: text/event-stream header enables SSE streaming
  const wantsStream =
    req.nextUrl.searchParams.get('stream') === 'true' ||
    req.headers.get('accept')?.includes('text/event-stream')

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  const language = detectLanguage(message)

  const validation = validateInput(message, language)
  if (!validation.valid) {
    return NextResponse.json({ output: validation.reply }, { status: 200 })
  }

  let sessionId: string | null = null
  if (session_key) {
    try {
      const db = await createServiceClient()
      const { data, error: sessErr } = await db
        .from('ai_chat_sessions')
        .upsert(
          { session_key, locale: locale ?? 'en', user_id: user_id ?? null },
          { onConflict: 'session_key', ignoreDuplicates: false },
        )
        .select('id')
        .single()
      if (sessErr) console.error('[rag2] session upsert error:', sessErr)
      sessionId = data?.id ?? null
      if (sessionId) {
        await db.from('ai_chat_messages').insert({ session_id: sessionId, role: 'user', content: message.trim() })
      }
    } catch (e) {
      console.error('[rag2] session/msg insert error:', e)
    }
  }

  if (isGreeting(message, language)) {
    const reply = greetingReply(language)
    const messageId = sessionId ? await saveAssistantMessage(sessionId, reply) : null
    return NextResponse.json({ output: reply, ...(messageId ? { message_id: messageId } : {}) }, { status: 200 })
  }

  // Build context (shared between streaming and non-streaming)
  const intent = detectRag2Intent(message)
  const searchLocale = language === 'km' ? 'km' : language === 'zh' ? 'zh' : 'en'
  const [history, embedding] = await Promise.all([
    sessionId ? fetchHistory(sessionId) : Promise.resolve([]),
    embedQuery(message, getOpenAI()),
  ])
  const chunks = await parallelSearch(embedding, intent, searchLocale)
  const msgs = buildMessages(message, language, formatHistory(history), chunks)

  // ── Streaming path ────────────────────────────────────────────────────────
  if (wantsStream) {
    const encoder = new TextEncoder()
    const sid = sessionId

    const stream = new ReadableStream({
      async start(controller) {
        let fullReply = ''
        try {
          const completion = await getOpenAI().chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: msgs,
            temperature: 0.3,
            max_tokens: 800,
            stream: true,
          })
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              fullReply += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          if (sid && fullReply) {
            const msgId = await saveAssistantMessage(sid, fullReply)
            if (msgId) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message_id: msgId })}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err: any) {
          console.error('[rag2] stream error:', err?.message ?? err)
          const fallback = "Sorry, I couldn't get a response right now. Please try again."
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallback })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
          if (sid) await saveAssistantMessage(sid, fallback)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  }

  // ── Non-streaming path (n8n / default) ───────────────────────────────────
  let reply: string
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: msgs,
      temperature: 0.3,
      max_tokens: 800,
    })
    reply = completion.choices[0]?.message?.content?.trim()
      ?? "Sorry, I couldn't get a response right now. Please try again in a moment."
  } catch (err: any) {
    console.error('[rag2] RAG error:', err?.message ?? err)
    reply = "Sorry, I couldn't get a response right now. Please try again in a moment."
  }

  const messageId = sessionId && reply ? await saveAssistantMessage(sessionId, reply) : null

  return NextResponse.json({ output: reply, ...(messageId ? { message_id: messageId } : {}) }, { status: 200 })
}
