import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'
import { getRawPool } from '@/lib/db'
import { sendTelegramHtmlMessage } from '@/lib/telegram'

function readTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function readOptionalString(value: unknown) {
  const text = readTrimmedString(value)
  return text || null
}

function readOptionalInteger(value: unknown) {
  if (value === undefined || value === null || value === '') return null
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(num) && num > 0 ? num : null
}

function appointmentSourceLabel(body: Record<string, unknown>) {
  const value = body.book_from ?? body.booking_source ?? body.source ?? body.appointment_source
  if (!value) return null

  const normalized = String(value).trim().toLowerCase().replace(/[_-]+/g, ' ')

  if (normalized.includes('mobile') || normalized.includes('app')) return 'Mobile app'
  if (normalized.includes('web') || normalized.includes('site')) return 'Website'

  return String(value)
}

function appointmentInsertBody(body: Record<string, unknown>, userId: string) {
  return {
    user_id: userId,
    patient_name: readTrimmedString(body.patient_name),
    patient_phone: readTrimmedString(body.patient_phone),
    patient_email: readOptionalString(body.patient_email),
    doctor_payload_id: readOptionalInteger(body.doctor_payload_id),
    department_payload_id: readOptionalInteger(body.department_payload_id),
    branch_payload_id: readOptionalInteger(body.branch_payload_id),
    preferred_date: readTrimmedString(body.preferred_date),
    preferred_time: readTrimmedString(body.preferred_time),
    message: readOptionalString(body.message),
    language: readTrimmedString(body.language) || 'en',
    status: 'pending',
    source: readTrimmedString(body.source ?? body.book_from ?? body.booking_source ?? body.appointment_source) || 'website',
  }
}

function missingRequiredFields(body: Record<string, unknown>) {
  const required = [
    'patient_name',
    'patient_phone',
    'preferred_date',
    'preferred_time',
  ]

  return required.filter((field) => {
    const value = body[field]
    return value === null || value === undefined || String(value).trim() === ''
  })
}

async function sendTelegram(body: Record<string, unknown>) {
  const sourceLabel = appointmentSourceLabel(body)

  const lines = [
    '🏥 <b>New Appointment Request</b>',
    '',
    `👤 <b>Patient:</b> ${body.patient_name ?? '-'}`,
    `📞 <b>Phone:</b> ${body.patient_phone ?? '-'}`,
    sourceLabel ? `📲 <b>Booked from:</b> ${sourceLabel}` : null,
    body.patient_email ? `📧 <b>Email:</b> ${body.patient_email}` : null,
    body.department_id ? `🏬 <b>Department:</b> ${body.department_id}` : null,
    body.department_payload_id ? `🧩 <b>Department ID:</b> ${body.department_payload_id}` : null,
    body.preferred_date ? `📅 <b>Date:</b> ${body.preferred_date}` : '📅 <b>Date:</b> Earliest available',
    body.preferred_time ? `🕐 <b>Time:</b> ${body.preferred_time}` : null,
    body.message ? `💬 <b>Note:</b> ${body.message}` : null,
  ].filter(Boolean).join('\n')

  try {
    await sendTelegramHtmlMessage(lines)
  } catch (e) {
    console.error('Telegram notify failed:', e)
  }
}

export async function GET(req: NextRequest) {
  const anonClient = await createClient()
  const { data: { user } } = await anonClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const locale = new URL(req.url).searchParams.get('locale') || 'en'

  try {
    const pool = getRawPool()
    // Join the Payload reference tables to return human-readable names
    // (doctor / department / branch) alongside the appointment.
    const { rows } = await pool.query(
      `select
         a.id, a.patient_name, a.patient_phone, a.patient_email,
         a.preferred_date, a.preferred_time, a.message, a.status,
         a.source, a.created_at,
         a.doctor_payload_id, a.department_payload_id, a.branch_payload_id,
         coalesce(dl.name, den.name)   as doctor_name,
         coalesce(depl.name, depen.name) as department_name,
         coalesce(bl.name, ben.name)   as branch_name
       from public.appointments a
       left join payload.doctors_locales dl     on dl._parent_id = a.doctor_payload_id and dl._locale = $2
       left join payload.doctors_locales den    on den._parent_id = a.doctor_payload_id and den._locale = 'en'
       left join payload.departments_locales depl  on depl._parent_id = a.department_payload_id and depl._locale = $2
       left join payload.departments_locales depen on depen._parent_id = a.department_payload_id and depen._locale = 'en'
       left join payload.branches_locales bl    on bl._parent_id = a.branch_payload_id and bl._locale = $2
       left join payload.branches_locales ben   on ben._parent_id = a.branch_payload_id and ben._locale = 'en'
       where a.user_id::text = $1
       order by a.created_at desc
       limit 50`,
      [user.id, locale],
    )
    return NextResponse.json({ docs: rows })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Anon client — only used to read the optional session cookie
  const anonClient = await createClient()
  const { data: { user } } = await anonClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required. Please sign in to book an appointment.' }, { status: 401 })
  }

  const body = await req.json() as Record<string, unknown>

  const missing = missingRequiredFields(body)
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    )
  }

  for (const field of ['doctor_payload_id', 'department_payload_id', 'branch_payload_id'] as const) {
    if (body[field] !== undefined && body[field] !== null && body[field] !== '' && readOptionalInteger(body[field]) === null) {
      return NextResponse.json({ error: `Invalid ${field}` }, { status: 400 })
    }
  }

  const insertBody = appointmentInsertBody(body, user.id)

  // Service role client — bypasses RLS so submissions work
  const serviceClient = await createServiceClient()

  // Availability guard (only when a specific doctor is chosen), via the
  // get_doctor_availability RPC:
  //   1. daily limit — a doctor accepts at most 3 bookings/day, then is locked
  //   2. no double-booking the same time slot
  if (insertBody.doctor_payload_id && insertBody.preferred_date) {
    try {
      const { data } = await serviceClient.rpc('get_doctor_availability', {
        p_doctor: insertBody.doctor_payload_id,
        p_date: insertBody.preferred_date,
      })
      const row = Array.isArray(data) ? data[0] : data
      const booked: string[] = Array.isArray(row?.booked) ? row.booked : []
      if (row?.is_full) {
        return NextResponse.json(
          { error: 'This doctor is fully booked on this date (max 3 per day). Please choose another date or doctor.' },
          { status: 409 },
        )
      }
      if (insertBody.preferred_time && booked.includes(insertBody.preferred_time)) {
        return NextResponse.json(
          { error: 'This time slot is already booked for this doctor. Please choose another time or doctor.' },
          { status: 409 },
        )
      }
    } catch (e) {
      console.error('appointment availability check failed:', (e as Error).message)
      // Don't block a booking if the check itself errors.
    }
  }

  const { error } = await serviceClient
    .from('appointments')
    .insert([insertBody])

  if (error) {
    console.error('Error saving appointment:', error.message, error.details, error.hint)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await sendTelegram(body)

  return NextResponse.json({ ok: true }, { status: 201 })
}
