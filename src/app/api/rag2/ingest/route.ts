import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { verifyWebhookSignature } from '@/lib/rag2/verify-webhook'
import { ingestRecord, deleteRecord } from '@/lib/rag2/ingest-record'

export const runtime = 'nodejs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()
  const signature = req.headers.get('X-Payload-Signature')
  const secret = process.env.WEBHOOK_SECRET ?? ''

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    console.warn('[rag2/ingest] invalid signature')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: { event: string; collection: string; docId: number; timestamp: string }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event, collection, docId } = payload
  console.log(`[rag2/ingest] ${event} ${collection}/${docId}`)

  try {
    if (event === 'published') {
      await ingestRecord(openai, collection, docId)
    } else if (event === 'deleted') {
      await deleteRecord(String(docId))
    }
  } catch (err: any) {
    console.error('[rag2/ingest] error:', err?.message ?? err)
    return NextResponse.json({ error: 'Ingest failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
