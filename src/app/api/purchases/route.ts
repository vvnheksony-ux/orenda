import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/utils/supabase/server'

async function sendTelegram(body: Record<string, any>) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!token || !chatId) return

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
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: 'HTML' }),
    })
  } catch (e) {
    console.error('Telegram notify failed:', e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const anonClient = await createClient()
    const { data: { user } } = await anonClient.auth.getUser()

    const body = await req.json()

    // Validate required fields
    if (!body.patient_name) {
      return NextResponse.json({ error: 'Patient name is required.' }, { status: 400 })
    }
    if (!body.patient_phone && !body.patient_email) {
      return NextResponse.json({ error: 'Phone or email is required.' }, { status: 400 })
    }

    const payload: Record<string, any> = {
      patient_name:          body.patient_name,
      patient_phone:         body.patient_phone         || null,
      patient_email:         body.patient_email         || null,
      promotion_id:          null,                                   // UUID — mobile app only
      promotion_payload_id:  body.promotion_payload_id  || null,  // Payload integer ID (web)
      promotion_title:       body.promotion_title        || null,
      branch_payload_id:     body.branch_payload_id     || null,
      message:               body.message               || null,
      language:              body.language              || 'en',
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
  } catch (err: any) {
    console.error('Purchase unexpected error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
