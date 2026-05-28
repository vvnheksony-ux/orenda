import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = await createServiceClient()
  const { error } = await supabase
    .schema('payload')
    .from('emergency_logs')
    .insert([body])
  
  if (error) {
    console.error('Error logging emergency to payload schema:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true }, { status: 201 })
}
