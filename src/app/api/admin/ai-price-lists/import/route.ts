import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}
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

type PriceRow = {
  service_name_km: string | null
  service_name_en: string | null
  price_khmer: number | null
  price_foreign: number | null
  price_emergency_khmer: number | null
  price_emergency_foreign: number | null
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
  // Column layout: A=row#(skip) B=km_name C=en_name D=price_kh E=price_fo F=emerg_kh G=emerg_fo
  const dataRows = rows.slice(1).filter((r: unknown[]) => {
    const en = r[2]; const km = r[1]
    return (en != null && String(en).trim() !== '') || (km != null && String(km).trim() !== '')
  })

  if (dataRows.length === 0) return NextResponse.json({ error: 'No data rows found in file' }, { status: 400 })

  const db = await createServiceClient()
  const replace = req.nextUrl.searchParams.get('replace') === 'true'

  // Build payload rows — A(r[0])=row# skip, B=km, C=en, D=price_kh, E=price_fo, F=emerg_kh, G=emerg_fo
  const payloadRows: PriceRow[] = dataRows.map((r: unknown[]) => ({
    service_name_km:         toStr(r[1]),
    service_name_en:         toStr(r[2]),
    price_khmer:             toNum(r[3]),
    price_foreign:           toNum(r[4]),
    price_emergency_khmer:   toNum(r[5]),
    price_emergency_foreign: toNum(r[6]),
  }))

  const allChanged: Record<string, unknown>[] = []

  if (replace) {
    // Delete everything first, then bulk insert
    const { data: existing } = await db.from('price_lists').select('id')
    if (existing?.length) {
      const ids = existing.map((r: { id: string }) => r.id)
      await db.from('ai_rag2_documents').delete().in('source_id', ids).eq('source_collection', 'price')
      await db.from('price_lists').delete().in('id', ids)
    }
    const { data: inserted, error: insertErr } = await db.from('price_lists').insert(payloadRows).select()
    if (insertErr || !inserted) return NextResponse.json({ error: insertErr?.message || 'Insert failed' }, { status: 500 })
    allChanged.push(...(inserted as Record<string, unknown>[]))
  } else {
    // Append mode: upsert by service_name_en (case-insensitive) — update existing, insert new
    const { data: existing } = await db.from('price_lists').select('id, service_name_en')
    const existingMap = new Map<string, string>(
      (existing ?? []).map((r: { id: string; service_name_en: string | null }) =>
        [String(r.service_name_en ?? '').toLowerCase().trim(), r.id]
      )
    )

    const toInsert: PriceRow[] = []
    const toUpdate: { id: string; row: PriceRow }[] = []

    for (const row of payloadRows) {
      const key = String(row.service_name_en ?? '').toLowerCase().trim()
      const existingId = key ? existingMap.get(key) : null
      if (existingId) {
        toUpdate.push({ id: existingId, row })
      } else {
        toInsert.push(row)
      }
    }

    if (toInsert.length) {
      const { data: inserted, error: insertErr } = await db.from('price_lists').insert(toInsert).select()
      if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
      allChanged.push(...(inserted as Record<string, unknown>[]))
    }

    for (const { id, row } of toUpdate) {
      await db.from('ai_rag2_documents').delete().eq('source_id', id).eq('source_collection', 'price')
      const { data: updated } = await db.from('price_lists').update(row).eq('id', id).select().single()
      if (updated) allChanged.push(updated as Record<string, unknown>)
    }
  }

  if (!allChanged.length) return NextResponse.json({ imported: 0, updated: 0, skipped: 0 })

  // Embed all changed rows in batches of 50
  const texts = allChanged.map(r => formatPrice(r))
  const embedRows: object[] = []

  for (let i = 0; i < texts.length; i += 50) {
    const batch = texts.slice(i, i + 50)
    const res = await getOpenAI().embeddings.create({ model: EMBEDDING_MODEL, input: batch })
    for (let j = 0; j < batch.length; j++) {
      const row = allChanged[i + j]
      embedRows.push({
        source_id:         row.id,
        source_collection: 'price',
        locale:            'en',
        content:           batch[j],
        metadata: {
          doc_type:                'price',
          source_collection:       'price',
          title:                   row.service_name_en ?? null,
          locale:                  'en',
          locale_fallback:         false,
          chunk_index:             0,
          total_chunks:            1,
          embed_model:             EMBEDDING_MODEL,
          service_en:              row.service_name_en ?? null,
          service_km:              row.service_name_km ?? null,
          department:              row.department ?? null,
          price_khmer:             row.price_khmer ?? null,
          price_foreign:           row.price_foreign ?? null,
          price_emergency_khmer:   row.price_emergency_khmer ?? null,
          price_emergency_foreign: row.price_emergency_foreign ?? null,
        },
        embedding: res.data[j].embedding,
      })
    }
  }

  const { error: embedErr } = await db.from('ai_rag2_documents').insert(embedRows)
  if (embedErr) console.error('[price-lists/import] embed error:', embedErr)

  return NextResponse.json({ total: allChanged.length })
}
