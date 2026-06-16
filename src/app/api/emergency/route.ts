import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'

function readTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, unknown>
  const contactInfo = readTrimmedString(body.contact_info)
  const message = readTrimmedString(body.message)

  if (!contactInfo) {
    return NextResponse.json({ error: 'Contact info required' }, { status: 400 })
  }

  if (!message) {
    return NextResponse.json({ error: 'Emergency description required' }, { status: 400 })
  }

  // Attach user_id if logged in (optional)
  const anonClient = await createClient()
  const { data: { user } } = await anonClient.auth.getUser()
  const payload: Record<string, string> & { user_id?: string } = { contact_info: contactInfo, message }
  if (user) payload.user_id = user.id

  const serviceClient = await createServiceClient()
  const { error } = await serviceClient.from('emergency_logs').insert([payload])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
