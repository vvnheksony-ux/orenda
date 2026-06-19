import { createServiceClient } from '@/utils/supabase/server'

function collectEnvChatIds() {
  const values = [process.env.TELEGRAM_ADMIN_CHAT_IDS ?? '', process.env.TELEGRAM_ADMIN_CHAT_ID ?? '']

  return values
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean)
}

async function collectChatIds() {
  const chatIds = new Set(collectEnvChatIds())

  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('telegram_subscribers')
      .select('chat_id')
      .eq('is_active', true)

    if (error) {
      console.error('Telegram subscriber lookup failed:', error.message)
    } else {
      for (const row of data ?? []) {
        if (row.chat_id) chatIds.add(String(row.chat_id).trim())
      }
    }
  } catch (error) {
    console.error('Telegram subscriber lookup failed:', error)
  }

  return Array.from(chatIds)
}

export async function sendTelegramHtmlMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = await collectChatIds()

  if (!token || chatIds.length === 0) return

  await Promise.all(
    chatIds.map(async (chatId) => {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`chat ${chatId}: ${res.status} ${errBody}`)
      }
    })
  )
}
