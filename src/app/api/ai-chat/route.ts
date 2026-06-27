import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'

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
      .select('id, session_id, role, content, created_at, thumbs')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: true })

    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }

    const grouped = new Map<string, Array<{ id: string; role: 'user' | 'ai'; content: string; timestamp: string; thumbs: string | null }>>()

    for (const row of messages ?? []) {
      const current = grouped.get(row.session_id) ?? []
      current.push({
        id: row.id,
        role: row.role === 'assistant' ? 'ai' : 'user',
        content: row.content ?? '',
        timestamp: timeFromIso(row.created_at),
        thumbs: row.thumbs ?? null,
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
  const body = await req.json()
  const { message, session_key, locale, user_id } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  const wantsStream =
    req.nextUrl.searchParams.get('stream') === 'true' ||
    req.headers.get('accept')?.includes('text/event-stream')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const rag2Base = new URL('/api/rag2', req.nextUrl.origin).toString()

    // Streaming path — pipe response from /api/rag2 directly through
    // rag2 may return SSE (normal query) OR JSON (greeting shortcut) — pass content-type through
    if (wantsStream) {
      const upstream = await fetch(`${rag2Base}?stream=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ message, session_key, locale, user_id }),
        signal: controller.signal,
      })
      clearTimeout(timer)
      const upstreamContentType = upstream.headers.get('content-type') ?? 'application/json'
      const responseHeaders: Record<string, string> = { 'Content-Type': upstreamContentType }
      if (upstreamContentType.includes('text/event-stream')) {
        responseHeaders['Cache-Control'] = 'no-cache'
        responseHeaders['Connection'] = 'keep-alive'
        responseHeaders['X-Accel-Buffering'] = 'no'
      }
      return new Response(upstream.body, { headers: responseHeaders })
    }

    // Non-streaming path
    const upstream = await fetch(rag2Base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_key, locale, user_id }),
      signal: controller.signal,
    })
    const data = await upstream.json().catch(() => null)
    return NextResponse.json(
      { output: data?.output ?? "Sorry, I couldn't get a response right now. Please try again." },
      { status: 200 },
    )
  } catch (err: any) {
    console.error('ai-chat error:', err?.name || err)
    const friendly = err?.name === 'AbortError'
      ? 'Sorry, the assistant is taking too long to respond. Please try again.'
      : "Sorry, I couldn't get a response right now. Please try again in a moment."
    return NextResponse.json({ output: friendly }, { status: 200 })
  } finally {
    clearTimeout(timer)
  }
}
