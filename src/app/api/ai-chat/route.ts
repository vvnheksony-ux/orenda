import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'

const WEBHOOK = 'https://n8n.new-wave.io/webhook/orienda_ai_agent'
const TIMEOUT_MS = 25000

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
