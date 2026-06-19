import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'
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

async function sendTelegram(body: Record<string, unknown>) {
  const lines = [
    '🛍️ <b>New Promotion Purchase</b>',
    '',
    `👤 <b>Patient:</b> ${body.patient_name ?? '-'}`,
    body.patient_phone ? `📞 <b>Phone:</b> ${body.patient_phone}` : null,
    body.patient_email ? `📧 <b>Email:</b> ${body.patient_email}` : null,
    body.promotion_title ? `🎫 <b>Promotion:</b> ${body.promotion_title}` : null,
    body.promotion_payload_id ? `🆔 <b>Promo ID:</b> ${body.promotion_payload_id}` : null,
    body.message ? `💬 <b>Note:</b> ${body.message}` : null,
    body.language ? `🌐 <b>Language:</b> ${body.language}` : null,
  ].filter(Boolean).join('\n')

  try {
    await sendTelegramHtmlMessage(lines)
  } catch (error) {
    console.error('Telegram notify failed:', error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const anonClient = await createClient()
    const { data: { user } } = await anonClient.auth.getUser()

    const body = await req.json() as Record<string, unknown>
    const patientName = readTrimmedString(body.patient_name)
    const patientPhone = readOptionalString(body.patient_phone)
    const patientEmail = readOptionalString(body.patient_email)
    const promotionPayloadId = readOptionalInteger(body.promotion_payload_id)

    // Validate required fields
    if (!patientName) {
      return NextResponse.json({ error: 'Patient name is required.' }, { status: 400 })
    }
    if (!patientPhone && !patientEmail) {
      return NextResponse.json({ error: 'Phone or email is required.' }, { status: 400 })
    }
    if (!promotionPayloadId) {
      return NextResponse.json({ error: 'Promotion reference is required.' }, { status: 400 })
    }

    const payload: Record<string, unknown> = {
      patient_name:          patientName,
      patient_phone:         patientPhone,
      patient_email:         patientEmail,
      promotion_payload_id:  promotionPayloadId,
      promotion_title:       readOptionalString(body.promotion_title),
      branch_payload_id:     readOptionalInteger(body.branch_payload_id),
      message:               readOptionalString(body.message),
      language:              readTrimmedString(body.language) || 'en',
      status:                'pending',
      source:                'website',
    }

    if (user?.id) payload.user_id = user.id

    const serviceClient = await createServiceClient()
    const { error } = await serviceClient.from('purchases').insert([payload])

    if (error) {
      console.error('Purchase insert error:', error.message)
      return NextResponse.json({ error: 'Failed to submit purchase. Please try again.' }, { status: 500 })
    }

    await sendTelegram(payload)

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('Purchase unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
