import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramHtmlMessage } from '@/lib/telegram'

export const runtime = 'nodejs'

async function sendTelegram(data: Record<string, unknown>) {
  const lines = [
    '📬 <b>New Contact Message</b>',
    '',
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>
    const name = readTrimmedString(body.name)
    const email = readOptionalString(body.email)
    const phone = readOptionalString(body.phone)
    const branchPayloadId = readOptionalInteger(body.branch_id)

    if (!name || (!email && !phone)) {
      return NextResponse.json({ error: 'Name and contact info required' }, { status: 400 })
    }

    if (body.branch_id !== undefined && body.branch_id !== null && body.branch_id !== '' && branchPayloadId === null) {
      return NextResponse.json({ error: 'Invalid branch selection.' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const message = readOptionalString(body.message)

    const { error } = await supabase.from('contact_messages').insert({
      name,
      email,
      phone,
      message,
      branch_payload_id: branchPayloadId,
      locale: readTrimmedString(body.locale) || 'en',
    })

    if (error) {
      console.error('contact insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await sendTelegram({ name, email, phone, message })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('contact route error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 })
  }
}
