import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.contact_info && !body.name && !body.phone) {
    return NextResponse.json({ error: 'Contact info required' }, { status: 400 })
  }

  // Attach user_id if logged in (optional)
  const anonClient = await createClient()
  const { data: { user } } = await anonClient.auth.getUser()
  if (user) body.user_id = user.id

  const serviceClient = await createServiceClient()
  const { error } = await serviceClient.from('emergency_logs').insert([body])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
