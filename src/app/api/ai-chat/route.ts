import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK = 'https://n8n.new-wave.io/webhook/orienda_ai_agent'
const TIMEOUT_MS = 25000

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const upstream = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    })
    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.status })
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return NextResponse.json({ error: 'AI service timed out' }, { status: 504 })
    }
    console.error('ai-chat webhook error:', err)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}
