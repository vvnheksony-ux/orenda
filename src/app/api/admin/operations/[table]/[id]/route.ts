import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

import { createServiceClient } from '@/utils/supabase/server'
import { requireTablePermission } from '@/payload/access/requireTablePermission'

const allowedTables = ['appointments', 'inquiries', 'purchases', 'patients', 'profiles', 'feedback', 'testimonials', 'contact_messages'] as const
const allowedStatusByTable: Record<(typeof allowedTables)[number], string[]> = {
  appointments: ['pending', 'confirmed', 'cancelled'],
  inquiries: ['unread', 'in-progress', 'resolved', 'closed'],
  purchases: ['pending', 'contacted', 'confirmed', 'cancelled'],
  patients: [],
  profiles: ['active', 'inactive', 'suspended'],
  feedback: ['pending', 'approved', 'rejected'],
  testimonials: [],
  contact_messages: ['pending', 'in-progress', 'resolved', 'closed'],
}
const editableFieldsByTable: Record<(typeof allowedTables)[number], string[]> = {
  appointments: [
    'patient_name',
    'patient_phone',
    'patient_email',
    'patient_id',
    'preferred_date',
    'preferred_time',
    'slot_start',
    'slot_end',
    'message',
    'language',
    'status',
    'source',
    'doctor_payload_id',
    'branch_payload_id',
    'department_payload_id',
  ],
  inquiries: ['name', 'phone', 'email', 'subject', 'message', 'language', 'status'],
  purchases: [
    'patient_name',
    'patient_phone',
    'patient_email',
    'promotion_id',
    'promotion_payload_id',
    'promotion_title',
    'branch_id',
    'branch_payload_id',
    'message',
    'language',
    'status',
    'source',
  ],
  profiles: [
    'name',
    'full_name',
    'display_name',
    'email',
    'phone',
    'role',
    'user_type',
    'status',
    'date_of_birth',
  ],
  patients: [
    'display_name',
    'photo_url',
    'email_user',
    'phone',
    'user_type',
    'gender',
    'language',
    'onesignal_player_id',
    'date_of_birth',
  ],
  feedback: [
    'first_name',
    'last_name',
    'title',
    'email',
    'phone',
    'nationality',
    'date_of_birth',
    'role',
    'clinic_visited',
    'feedback_type',
    'contact_required',
    'comment',
    'locale',
    'status',
  ],
  testimonials: [
    'content',
    'author',
    'locale',
  ],
  contact_messages: [
    'name',
    'email',
    'phone',
    'message',
    'locale',
    'status',
    'branch_payload_id',
  ],
}

type RouteContext = {
  params: Promise<{
    table: string
    id: string
  }>
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { table, id } = await context.params
  const permError = await requireTablePermission({ req, user, payload } as any, table, 'update')
  if (permError) return permError

  if (!isAllowedTable(table)) return NextResponse.json({ error: 'Unknown operations table.' }, { status: 404 })

  const body = (await req.json().catch(() => null)) as { data?: Record<string, unknown>; status?: unknown } | null
  const updateData = getUpdateData(table, body)
  if (!updateData) {
    return NextResponse.json({ error: 'Invalid update payload.' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // When an appointment is being confirmed, read its prior status + patient
  // first, so we can push a notification once — only on the change to confirmed.
  const willConfirmAppointment = table === 'appointments' && updateData.status === 'confirmed'
  let appt: { status: string | null; user_id: string | null; preferred_date: string | null } | null = null
  if (willConfirmAppointment) {
    const { data } = await supabase
      .schema('public')
      .from('appointments')
      .select('status, user_id, preferred_date')
      .eq('id', id)
      .single()
    appt = (data as unknown as { status: string | null; user_id: string | null; preferred_date: string | null } | null) ?? null
  }

  const { error } = await supabase.schema('public').from(getDatabaseTable(table)).update(updateData).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify the patient who booked, once, when their appointment is confirmed.
  if (willConfirmAppointment && appt?.user_id && appt.status !== 'confirmed') {
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    // Deep-link to this specific appointment so the page auto-opens its detail modal.
    const url = base ? `${base}/appointments?id=${id}` : null
    const when = appt.preferred_date ? ` for ${appt.preferred_date}` : ''
    const { error: notifyError } = await supabase.schema('public').from('notifications').insert({
      audience: 'patient',
      category: 'appointment',
      feature: 'appointments',
      source_type: 'appointment',
      source_id: id,
      title: '✅ Appointment Confirmed',
      body: `Your appointment${when} has been confirmed. Tap to view the details.`,
      data: { collection: 'appointments', appointment_id: id, url },
      user_id: [appt.user_id],
    })
    if (notifyError) console.error('appointment confirm notify failed:', notifyError.message)
  }

  return NextResponse.json({ ok: true })
}

function getUpdateData(table: (typeof allowedTables)[number], body: { data?: Record<string, unknown>; status?: unknown } | null) {
  if (typeof body?.status === 'string') {
    if (!allowedStatusByTable[table].includes(body.status)) return null
    return { status: body.status }
  }

  if (!body?.data || typeof body.data !== 'object') return null

  const editableFields = editableFieldsByTable[table]
  const updateData: Record<string, string | number | boolean | null> = {}

  for (const [key, value] of Object.entries(body.data)) {
    if (!editableFields.includes(key)) continue
    if (key === 'status' && (typeof value !== 'string' || !allowedStatusByTable[table].includes(value))) return null
    updateData[key] = normalizeFieldValue(key, value)
  }

  return Object.keys(updateData).length ? updateData : null
}

function normalizeFieldValue(key: string, value: unknown) {
  if (key === 'patient_id' && value === '') return '00000000'
  if (value === '') return null
  if (key === 'contact_required') {
    if (value === true || value === 'true') return true
    if (value === false || value === 'false') return false
    return null
  }
  if (typeof value !== 'string') return null
  if (key.endsWith('_payload_id') || key === 'promotion_id' || key === 'branch_id') {
    const num = Number(value)
    return Number.isFinite(num) ? num : null
  }
  return value
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { table, id } = await context.params
  const permError = await requireTablePermission({ req, user, payload } as any, table, 'delete')
  if (permError) return permError

  if (!isAllowedTable(table)) return NextResponse.json({ error: 'Unknown operations table.' }, { status: 404 })

  const supabase = await createServiceClient()
  const { error } = await supabase.schema('public').from(getDatabaseTable(table)).delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

function isAllowedTable(value: string): value is (typeof allowedTables)[number] {
  return allowedTables.includes(value as (typeof allowedTables)[number])
}

function getDatabaseTable(table: (typeof allowedTables)[number]) {
  return table === 'patients' ? 'profiles' : table
}
