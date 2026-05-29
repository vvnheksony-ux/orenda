import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  
  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse Body and Insert
  const body = await req.json()
  
  // Optionally, enforce the user_id matches the authenticated user
  // body.user_id = user.id

  const { error } = await supabase
    .from('appointments')
    .insert([body])
  
  if (error) {
    console.error('Error saving appointment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ ok: true }, { status: 201 })
}
