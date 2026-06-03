import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  // Anon client — only used to read the optional session cookie
  const anonClient = await createClient()
  const { data: { user } } = await anonClient.auth.getUser()

  const body = await req.json()

  // Stamp with user_id when a session exists
  if (user?.id) {
    body.user_id = user.id
  }

  // Service role client — bypasses RLS so unauthenticated submissions work
  const serviceClient = await createServiceClient()
  const { error } = await serviceClient
    .from('appointments')
    .insert([body])

  if (error) {
    console.error('Error saving appointment:', error.message, error.details, error.hint)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
