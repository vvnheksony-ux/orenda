import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { sendTelegramHtmlMessage } from '@/lib/telegram'

function readTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function readOptionalString(value: unknown) {
  const text = readTrimmedString(value)
  return text || null
}

async function sendTelegram(data: Record<string, unknown>) {
  const lines = [
    '📩 <b>New Contact Inquiry</b>',
    '',
    data.subject ? `📋 <b>Type:</b> ${data.subject}` : null,
    `👤 <b>Name:</b> ${data.name ?? '-'}`,
    data.phone ? `📞 <b>Phone:</b> ${data.phone}` : null,
    data.email ? `📧 <b>Email:</b> ${data.email}` : null,
    data.message ? `💬 <b>Message:</b> ${data.message}` : null,
  ].filter(Boolean).join('\n')

  try {
    await sendTelegramHtmlMessage(lines)
  } catch (error) {
    console.error('Telegram notify failed:', error)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, unknown>

  const name = readTrimmedString(body.name)
  const email = readOptionalString(body.email)
  const phone = readOptionalString(body.phone)
  const message = readTrimmedString(body.message)

  if (!name || (!email && !phone)) {
    return NextResponse.json({ error: 'Name and contact info required' }, { status: 400 })
  }

  if (!message) {
    return NextResponse.json({ error: 'Inquiry message is required' }, { status: 400 })
  }

  const payload = {
    name,
    email,
    phone,
    message,
    subject: readOptionalString(body.subject),
    language: readOptionalString(body.language),
  }

  const serviceClient = await createServiceClient()
  const { error } = await serviceClient.from('inquiries').insert([payload])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sendTelegram(payload)

  return NextResponse.json({ ok: true }, { status: 201 })
}
