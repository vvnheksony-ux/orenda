import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.name || (!body.email && !body.phone)) {
      return NextResponse.json({ error: 'Name and contact info required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('contact_messages').insert({
      name:      body.name,
      email:     body.email    || null,
      phone:     body.phone    || null,
      message:   body.message  || null,
      branch_payload_id: body.branch_id ? Number(body.branch_id) : null,
      locale:    body.locale   || 'en',
    })

    if (error) {
      console.error('contact insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err: any) {
    console.error('contact route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
