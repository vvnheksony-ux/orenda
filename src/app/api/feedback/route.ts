import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

function readTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function readOptionalString(value: unknown) {
  const text = readTrimmedString(value)
  return text || null
}

function readBoolean(value: unknown) {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return false
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>
    const comment = readTrimmedString(body.comment)
    const feedbackType = readTrimmedString(body.feedback_type)
    const contactRequired = readBoolean(body.contact_required)
    const email = readOptionalString(body.email)
    const phone = readOptionalString(body.phone)

    if (!feedbackType) {
      return NextResponse.json({ error: 'Feedback type is required.' }, { status: 400 })
    }

    if (!comment) {
      return NextResponse.json({ error: 'Feedback comment is required.' }, { status: 400 })
    }

    if (contactRequired && !email && !phone) {
      return NextResponse.json({ error: 'Email or phone is required when contact is requested.' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { error } = await supabase.from('feedback').insert({
      first_name:       readOptionalString(body.first_name),
      last_name:        readOptionalString(body.last_name),
      title:            readOptionalString(body.title),
      email,
      phone,
      nationality:      readOptionalString(body.nationality),
      date_of_birth:    readOptionalString(body.date_of_birth),
      role:             readOptionalString(body.role),
      clinic_visited:   readOptionalString(body.clinic_visited),
      feedback_type:    feedbackType,
      contact_required: contactRequired,
      comment,
      locale:           readTrimmedString(body.locale) || 'en',
    })

    if (error) {
      console.error('feedback insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('feedback route error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 })
  }
}
