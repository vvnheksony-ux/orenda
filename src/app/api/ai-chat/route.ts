import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

const WEBHOOK = 'https://n8n.new-wave.io/webhook/orienda_ai_agent'
const TIMEOUT_MS = 25000

export async function POST(req: NextRequest) {
  const { message, session_key, locale, user_id } = await req.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  // Only persist to DB for authenticated users
  console.log('[ai-chat] session_key:', session_key, 'user_id:', user_id)
  let sessionId: string | null = null
  if (session_key && user_id) {
    try {
      const db = await createServiceClient()
      const { data, error: sessErr } = await db
        .from('ai_chat_sessions')
        .upsert(
          { session_key, locale: locale ?? 'en', user_id: user_id ?? null },
          { onConflict: 'session_key', ignoreDuplicates: false }
        )
        .select('id')
        .single()
      if (sessErr) console.error('[ai-chat] session upsert error:', sessErr)
      sessionId = data?.id ?? null

      if (sessionId) {
        const { error: msgErr } = await db.from('ai_chat_messages').insert({ session_id: sessionId, role: 'user', content: message.trim() })
        if (msgErr) console.error('[ai-chat] user msg insert error:', msgErr)
      }
    } catch (e) { console.error('[ai-chat] session/msg insert error:', e) }
  }

  // Forward to n8n
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let reply: string | null = null

  try {
    const upstream = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    })
    const raw = await upstream.json()
    const data = Array.isArray(raw) ? raw[0] : raw
    reply = data?.output ?? data?.message ?? data?.response ?? data?.text ?? JSON.stringify(data)

    // Save assistant response
    if (sessionId && reply) {
      try {
        const db = await createServiceClient()
        await db.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: reply })
      } catch (e) { console.error('[ai-chat] assistant msg insert error:', e) }
    }

    return NextResponse.json(Array.isArray(raw) ? raw : data, { status: upstream.status })
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return NextResponse.json({ error: 'AI service timed out' }, { status: 504 })
    }
    console.error('ai-chat webhook error:', err)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}
