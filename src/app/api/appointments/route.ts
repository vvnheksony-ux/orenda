import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'

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
    department_id: readOptionalString(body.department_id),
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
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!token || !chatId) return
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
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: 'HTML' }),
    })
    if (!res.ok) {
      const errBody = await res.text()
      console.error('Telegram notify failed:', res.status, errBody)
    }
  } catch (e) {
    console.error('Telegram notify failed:', e)
  }
}

export async function GET() {
  const anonClient = await createClient()
  const { data: { user } } = await anonClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = await createServiceClient()
  const { data, error } = await serviceClient
    .from('appointments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ docs: data ?? [] })
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

  // Service role client — bypasses RLS so unauthenticated submissions work
  const serviceClient = await createServiceClient()
  const { error } = await serviceClient
    .from('appointments')
    .insert([appointmentInsertBody(body, user.id)])

  if (error) {
    console.error('Error saving appointment:', error.message, error.details, error.hint)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await sendTelegram(body)

  return NextResponse.json({ ok: true }, { status: 201 })
}
