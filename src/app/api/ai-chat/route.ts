import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'

const WEBHOOK = 'https://n8n.new-wave.io/webhook/orienda_ai_agent'
const TIMEOUT_MS = 60000

function timeFromIso(value: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export async function GET() {
  const anonClient = await createClient()
  const { data: { user } } = await anonClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await createServiceClient()
    const { data: sessions, error: sessionsError } = await db
      .from('ai_chat_sessions')
      .select('id, session_key, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(30)

    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 })
    }

    const sessionRows = sessions ?? []
    const sessionIds = sessionRows.map((session) => session.id)

    if (sessionIds.length === 0) {
      return NextResponse.json({ docs: [] })
    }

    const { data: messages, error: messagesError } = await db
      .from('ai_chat_messages')
      .select('id, session_id, role, content, created_at')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: true })

    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }

    const grouped = new Map<string, Array<{ id: string; role: 'user' | 'ai'; content: string; timestamp: string }>>()

    for (const row of messages ?? []) {
      const current = grouped.get(row.session_id) ?? []
      current.push({
        id: row.id,
        role: row.role === 'assistant' ? 'ai' : 'user',
        content: row.content ?? '',
        timestamp: timeFromIso(row.created_at),
      })
      grouped.set(row.session_id, current)
    }

    const docs = sessionRows.map((session) => {
      const sessionMessages = grouped.get(session.id) ?? []
      const preview = sessionMessages.find((message) => message.role === 'user')?.content ?? sessionMessages[0]?.content ?? ''

      return {
        dbId: session.id,
        id: session.session_key ?? session.id,
        date: session.updated_at ?? session.created_at,
        preview,
        messages: sessionMessages,
      }
    })

    return NextResponse.json({ docs })
  } catch (err: any) {
    console.error('ai-chat history error:', err)
    return NextResponse.json({ error: 'Failed to load chat history' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const anonClient = await createClient()
  const { data: { user } } = await anonClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await req.json()
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
  }

  try {
    const db = await createServiceClient()
    const { error: msgError } = await db.from('ai_chat_messages').delete().eq('session_id', sessionId)
    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 })
    }

    const { error: sessionError } = await db
      .from('ai_chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id)

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('ai-chat delete error:', err)
    return NextResponse.json({ error: 'Failed to delete chat history' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { message, session_key, locale, user_id } = await req.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  // Persist to DB for any session (guests have a session_key but no user_id)
  console.log('[ai-chat] session_key:', session_key, 'user_id:', user_id)
  let sessionId: string | null = null
  if (session_key) {
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
      // Send the DB-generated session id (ai_chat_sessions.id) so the webhook's
      // memory keys on the same id we persist. Fall back to the client key only
      // if the row could not be created.
      body: JSON.stringify({ message, sessionId: sessionId ?? session_key, userId: user_id }),
      signal: controller.signal,
    })
    // n8n can return an empty or non-JSON body — read as text and parse defensively
    const rawText = await upstream.text()
    let raw: any = null
    if (rawText && rawText.trim()) {
      try { raw = JSON.parse(rawText) } catch { /* leave raw null on non-JSON body */ }
    }
    const data = Array.isArray(raw) ? raw[0] : raw
    reply = data?.output ?? data?.message ?? data?.response ?? data?.text ?? null

    // Degrade gracefully instead of throwing a 502 when the AI service sends nothing
    if (!reply || !reply.trim()) {
      reply = "Sorry, I couldn't get a response right now. Please try again in a moment."
    }

    // Save assistant response
    if (sessionId && reply) {
      try {
        const db = await createServiceClient()
        await db.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: reply })
      } catch (e) { console.error('[ai-chat] assistant msg insert error:', e) }
    }

    return NextResponse.json({ output: reply }, { status: 200 })
  } catch (err: any) {
    // Webhook unreachable, timed out, or sent an unusable body — degrade gracefully
    // so the chat widget shows a friendly message instead of a hard error.
    console.error('ai-chat webhook error:', err?.name || err)
    const friendly = err?.name === 'AbortError'
      ? 'Sorry, the assistant is taking too long to respond. Please try again.'
      : "Sorry, I couldn't get a response right now. Please try again in a moment."
    return NextResponse.json({ output: friendly }, { status: 200 })
  } finally {
    clearTimeout(timer)
  }
}
