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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { message, session_key, locale, user_id } = body

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
    if (sessionId) {
      try {
        const db = await createServiceClient()
        await db.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: reply })
      } catch (e) { console.error('[rag2] greeting save error:', e) }
    }
    return NextResponse.json({ output: reply }, { status: 200 })
  }

  let reply: string
  try {
    const intent = detectRag2Intent(message)
    const searchLocale = language === 'km' ? 'km' : language === 'zh' ? 'zh' : 'en'
    const [history, embedding] = await Promise.all([
      sessionId ? fetchHistory(sessionId) : Promise.resolve([]),
      embedQuery(message, openai),
    ])
    const chunks = await parallelSearch(embedding, intent, searchLocale)
    const msgs = buildMessages(message, language, formatHistory(history), chunks)

    const completion = await openai.chat.completions.create({
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

  if (sessionId && reply) {
    try {
      const db = await createServiceClient()
      await db.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: reply })
    } catch (e) { console.error('[rag2] assistant msg insert error:', e) }
  }

  return NextResponse.json({ output: reply }, { status: 200 })
}
