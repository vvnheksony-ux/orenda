import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import config from '@payload-config'
import { getPayload } from 'payload'

export const runtime = 'nodejs'

// Delete sessions (+ their messages via cascade) older than N days
const DEFAULT_DAYS = 30

async function requireAdmin(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const role = user && typeof user === 'object' && 'role' in user ? user.role : null
  return role === 'admin'
}

export async function POST(req: NextRequest) {
  const isAdmin = await requireAdmin(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const days: number = typeof body.days === 'number' ? body.days : DEFAULT_DAYS

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const db = await createServiceClient()

  // Get session IDs to delete
  const { data: sessions, error: fetchErr } = await db
    .from('ai_chat_sessions')
    .select('id')
    .lt('created_at', cutoff.toISOString())

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  if (!sessions?.length) return NextResponse.json({ deleted: 0, message: 'No old sessions found' })

  const ids = sessions.map((s: any) => s.id)

  // Delete messages first, then sessions
  await db.from('ai_chat_messages').delete().in('session_id', ids)
  const { error: delErr } = await db.from('ai_chat_sessions').delete().in('id', ids)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  return NextResponse.json({ deleted: ids.length, older_than_days: days })
}
