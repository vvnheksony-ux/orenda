import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// POST /api/ai-chat/feedback
// body: { message_id: string, thumbs: 'up' | 'down' | null }
// Requires logged-in user — verifies the message belongs to a session owned by that user
export async function POST(req: NextRequest) {
  const anonClient = await createClient()
  const { data: { user } } = await anonClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const messageId: string | undefined = body?.message_id
  const thumbs: 'up' | 'down' | null = body?.thumbs ?? null

  if (!messageId) return NextResponse.json({ error: 'message_id required' }, { status: 400 })
  if (thumbs !== 'up' && thumbs !== 'down' && thumbs !== null) {
    return NextResponse.json({ error: 'thumbs must be "up", "down", or null' }, { status: 400 })
  }

  const db = await createServiceClient()

  // Verify message belongs to a session owned by this user
  const { data: msg } = await db
    .from('ai_chat_messages')
    .select('id, session_id, role')
    .eq('id', messageId)
    .single()

  if (!msg) return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  if (msg.role !== 'assistant') return NextResponse.json({ error: 'Can only rate assistant messages' }, { status: 400 })

  const { data: session } = await db
    .from('ai_chat_sessions')
    .select('id')
    .eq('id', msg.session_id)
    .eq('user_id', user.id)
    .single()

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { error } = await db
    .from('ai_chat_messages')
    .update({ thumbs })
    .eq('id', messageId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, thumbs })
}
