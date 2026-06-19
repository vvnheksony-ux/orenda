import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

type TelegramUpdate = {
  message?: {
    text?: string
    chat?: { id?: number | string; type?: string }
    from?: { username?: string; first_name?: string; last_name?: string }
  }
}

function hasValidSecret(req: NextRequest) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()
  if (!expected) return true
  return req.headers.get('x-telegram-bot-api-secret-token') === expected
}

export async function GET() {
  return NextResponse.json({ ok: true, route: '/api/telegram/webhook' })
}

export async function POST(req: NextRequest) {
  if (!hasValidSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as TelegramUpdate | null
  const message = body?.message
  const chatId = message?.chat?.id

  if (!chatId || message?.chat?.type !== 'private') {
    return NextResponse.json({ ok: true })
  }

  const text = (message.text ?? '').trim().toLowerCase()
  const isStart = text.startsWith('/start')
  const isStop = text.startsWith('/stop')

  if (!isStart && !isStop) {
    return NextResponse.json({ ok: true })
  }

  const supabase = await createServiceClient()
  const payload = {
    chat_id: String(chatId),
    username: message.from?.username ?? null,
    first_name: message.from?.first_name ?? null,
    last_name: message.from?.last_name ?? null,
    is_active: isStop ? false : true,
    last_started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('telegram_subscribers')
    .upsert(payload, { onConflict: 'chat_id' })

  if (error) {
    console.error('telegram webhook upsert failed:', error)
    return NextResponse.json({ error: 'Could not save Telegram subscriber.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
