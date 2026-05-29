import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  const client = await createClient()

  // Verify Authentication
  const { data: { user }, error: authError } = await client.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const serviceClient = await createServiceClient()
  const { error } = await serviceClient.from('emergency_logs').insert([body])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
