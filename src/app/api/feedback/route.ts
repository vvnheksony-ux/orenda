import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createServiceClient()

    const { error } = await supabase.from('feedback').insert({
      first_name:       body.first_name || null,
      last_name:        body.last_name || null,
      title:            body.title || null,
      email:            body.email || null,
      phone:            body.phone || null,
      nationality:      body.nationality || null,
      date_of_birth:    body.date_of_birth || null,
      role:             body.role || null,
      clinic_visited:   body.clinic_visited || null,
      feedback_type:    body.feedback_type || null,
      contact_required: body.contact_required ?? false,
      comment:          body.comment || null,
      locale:           body.locale || 'en',
    })

    if (error) {
      console.error('feedback insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('feedback route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
