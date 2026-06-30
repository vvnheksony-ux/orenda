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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getPayloadAdmin(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const db = await createServiceClient()
  const update: Record<string, unknown> = {}
  if (body.service_name_en !== undefined) update.service_name_en = body.service_name_en?.trim() || null
  if (body.service_name_km !== undefined) update.service_name_km = body.service_name_km?.trim() || null
  if (body.price_khmer !== undefined) update.price_khmer = body.price_khmer !== '' && body.price_khmer != null ? Number(body.price_khmer) : null
  if (body.price_foreign !== undefined) update.price_foreign = body.price_foreign !== '' && body.price_foreign != null ? Number(body.price_foreign) : null
  if (body.price_emergency_khmer !== undefined) update.price_emergency_khmer = body.price_emergency_khmer !== '' && body.price_emergency_khmer != null ? Number(body.price_emergency_khmer) : null
  if (body.price_emergency_foreign !== undefined) update.price_emergency_foreign = body.price_emergency_foreign !== '' && body.price_emergency_foreign != null ? Number(body.price_emergency_foreign) : null
  if (body.department !== undefined) update.department = body.department?.trim() || null

  const { data, error } = await db.from('price_lists').update(update).eq('id', id).select().single()
  if (error || !data) return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 })

  // Re-embed
  try {
    await db.from('ai_rag2_documents').delete().eq('source_id', id).eq('source_collection', 'price')
    const text = formatPrice(data as Record<string, unknown>)
    const res = await getOpenAI().embeddings.create({ model: EMBEDDING_MODEL, input: text })
    await db.from('ai_rag2_documents').insert({
      source_id: id,
      source_collection: 'price',
      locale: 'en',
      content: text,
      metadata: {
        doc_type:                'price',
        source_collection:       'price',
        title:                   data.service_name_en ?? null,
        locale:                  'en',
        locale_fallback:         false,
        chunk_index:             0,
        total_chunks:            1,
        embed_model:             EMBEDDING_MODEL,
        service_en:              data.service_name_en ?? null,
        service_km:              data.service_name_km ?? null,
        department:              data.department ?? null,
        price_khmer:             data.price_khmer ?? null,
        price_foreign:           data.price_foreign ?? null,
        price_emergency_khmer:   data.price_emergency_khmer ?? null,
        price_emergency_foreign: data.price_emergency_foreign ?? null,
      },
      embedding: res.data[0].embedding,
    })
  } catch (e) {
    console.error('[ai-price-lists/patch] embed error:', e)
  }

  return NextResponse.json({ price: data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getPayloadAdmin(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params

  const db = await createServiceClient()
  await db.from('ai_rag2_documents').delete().eq('source_id', id).eq('source_collection', 'price')
  const { error } = await db.from('price_lists').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
