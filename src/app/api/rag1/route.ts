import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'
import { detectLanguage } from '@/lib/rag1/detect-language'
import { detectIntent } from '@/lib/rag1/detect-intent'
import { fetchHistory, formatHistory } from '@/lib/rag1/fetch-history'
import { embedQuery, parallelSearch } from '@/lib/rag1/vector-search'
import { buildMessages } from '@/lib/rag1/build-prompt'
import { validateInput, isGreeting, greetingReply } from '@/lib/rag1/validate-input'

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { message, session_key, locale, user_id } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  // Detect language early — needed for validation replies
  const language = detectLanguage(message)

  // Validate + spam check
  const validation = validateInput(message, language)
  if (!validation.valid) {
    return NextResponse.json({ output: validation.reply }, { status: 200 })
  }

  // Upsert session + save user message
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
      if (sessErr) console.error('[rag1] session upsert error:', sessErr)
      sessionId = data?.id ?? null

      if (sessionId) {
        const { error: msgErr } = await db
          .from('ai_chat_messages')
          .insert({ session_id: sessionId, role: 'user', content: message.trim() })
        if (msgErr) console.error('[rag1] user msg insert error:', msgErr)
      }
    } catch (e) {
      console.error('[rag1] session/msg insert error:', e)
    }
  }

  // Greeting short-circuit — skip OpenAI entirely
  if (isGreeting(message, language)) {
    const reply = greetingReply(language)
    if (sessionId) {
      try {
        const db = await createServiceClient()
        await db.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: reply })
      } catch (e) { console.error('[rag1] greeting save error:', e) }
    }
    return NextResponse.json({ output: reply }, { status: 200 })
  }

  // RAG pipeline
  let reply: string
  try {
    const [history, intent, embedding] = await Promise.all([
      sessionId ? fetchHistory(sessionId) : Promise.resolve([]),
      Promise.resolve(detectIntent(message)),
      embedQuery(message, getOpenAI()),
    ])
    const chunks = await parallelSearch(embedding, intent)
    const msgs = buildMessages(message, language, formatHistory(history), chunks)

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: msgs,
      temperature: 0.3,
      max_tokens: 800,
    })

    reply = completion.choices[0]?.message?.content?.trim()
      ?? "Sorry, I couldn't get a response right now. Please try again in a moment."
  } catch (err: any) {
    console.error('[rag1] RAG error:', err?.message || err)
    reply = "Sorry, I couldn't get a response right now. Please try again in a moment."
  }

  // Save assistant response
  if (sessionId && reply) {
    try {
      const db = await createServiceClient()
      await db.from('ai_chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: reply,
      })
    } catch (e) {
      console.error('[rag1] assistant msg insert error:', e)
    }
  }

  return NextResponse.json({ output: reply }, { status: 200 })
}
