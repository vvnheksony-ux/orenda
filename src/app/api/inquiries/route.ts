import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

function readTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function readOptionalString(value: unknown) {
  const text = readTrimmedString(value)
  return text || null
}

async function sendTelegram(data: Record<string, unknown>) {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!token || !chatId) return

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
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: 'HTML' }),
    })
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
