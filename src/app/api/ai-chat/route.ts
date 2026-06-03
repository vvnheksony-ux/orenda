import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK = 'https://n8n.new-wave.io/webhook/orienda_ai_agent'

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  const upstream = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
