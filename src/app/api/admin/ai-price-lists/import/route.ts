import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const EMBEDDING_MODEL = 'text-embedding-3-small'

async function getPayloadAdmin(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const role = user && typeof user === 'object' && 'role' in user ? user.role : null
  if (role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return { payload }
}

function toNum(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

function toStr(val: unknown): string | null {
  if (val === null || val === undefined) return null
  const s = String(val).trim()
  return s || null
}

function formatPrice(row: Record<string, unknown>): string {
  return [
    `Service: ${row.service_name_en || ''}`,
    row.service_name_km ? `Khmer: ${row.service_name_km}` : '',
    row.price_khmer != null ? `Khmer Price: $${row.price_khmer}` : '',
    row.price_foreign != null ? `Foreign Price: $${row.price_foreign}` : '',
    row.price_emergency_khmer != null ? `Emergency Khmer: $${row.price_emergency_khmer}` : '',
    row.price_emergency_foreign != null ? `Emergency Foreign: $${row.price_emergency_foreign}` : '',
    row.department ? `Department: ${row.department}` : '',
  ].filter(Boolean).join(' | ')
}

export async function POST(req: NextRequest) {
  const auth = await getPayloadAdmin(req)
  if (auth instanceof NextResponse) return auth

  const formData = await req.formData().catch(() => null)
  const file = formData?.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require('xlsx')
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  // Convert to array of arrays, skip header row (row 0)
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  // Rows start from index 1 (index 0 = header)
  const dataRows = rows.slice(1).filter((r: unknown[]) => r[0] != null && String(r[0]).trim() !== '')

  if (dataRows.length === 0) return NextResponse.json({ error: 'No data rows found in file' }, { status: 400 })

  const db = await createServiceClient()

  // Delete all existing price_lists + their embeddings
  const { data: existing } = await db.from('price_lists').select('id')
  if (existing?.length) {
    const ids = existing.map((r: { id: string }) => r.id)
    await db.from('ai_rag2_documents').delete().in('source_id', ids).eq('source_collection', 'price')
    await db.from('price_lists').delete().in('id', ids)
  }

  // Build insert rows
  const insertRows = dataRows.map((r: unknown[]) => ({
    service_name_en: toStr(r[0]),
    service_name_km:  toStr(r[1]),
    price_khmer:              toNum(r[2]),
    price_foreign:            toNum(r[3]),
    price_emergency_khmer:    toNum(r[4]),
    price_emergency_foreign:  toNum(r[5]),
    department:               toStr(r[6]),
  }))

  const { data: inserted, error: insertErr } = await db
    .from('price_lists')
    .insert(insertRows)
    .select()

  if (insertErr || !inserted) return NextResponse.json({ error: insertErr?.message || 'Insert failed' }, { status: 500 })

  // Embed all rows in batches of 50
  const texts = inserted.map(r => formatPrice(r as Record<string, unknown>))
  const embedRows: object[] = []

  for (let i = 0; i < texts.length; i += 50) {
    const batch = texts.slice(i, i + 50)
    const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: batch })
    for (let j = 0; j < batch.length; j++) {
      embedRows.push({
        source_id:         inserted[i + j].id,
        source_collection: 'price',
        locale:            'en',
        content:           batch[j],
        metadata:          { doc_type: 'price', service: inserted[i + j].service_name_en },
        embedding:         res.data[j].embedding,
      })
    }
  }

  const { error: embedErr } = await db.from('ai_rag2_documents').insert(embedRows)
  if (embedErr) console.error('[price-lists/import] embed error:', embedErr)

  return NextResponse.json({ imported: inserted.length })
}
