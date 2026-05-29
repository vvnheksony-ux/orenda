import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  
  // Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { error } = await supabase.from('inquiries').insert([body])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.json({ ok: true }, { status: 201 })
}
