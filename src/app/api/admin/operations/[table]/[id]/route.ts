import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

import { createServiceClient } from '@/utils/supabase/server'

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
  const authError = await requirePayloadAdmin(req)
  if (authError) return authError

  const { table, id } = await context.params
  if (!isAllowedTable(table)) return NextResponse.json({ error: 'Unknown operations table.' }, { status: 404 })

  const body = (await req.json().catch(() => null)) as { data?: Record<string, unknown>; status?: unknown } | null
  const updateData = getUpdateData(table, body)
  if (!updateData) {
    return NextResponse.json({ error: 'Invalid update payload.' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { error } = await supabase.schema('public').from(getDatabaseTable(table)).update(updateData).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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
  const authError = await requirePayloadAdmin(req)
  if (authError) return authError

  const { table, id } = await context.params
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

async function requirePayloadAdmin(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const role = user && typeof user === 'object' && 'role' in user ? user.role : null

  if (role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
