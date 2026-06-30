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
const VALID_DOC_TYPES = ['about', 'contact', 'policy', 'brand'] as const
const VALID_LOCALES = ['en', 'km', 'zh'] as const

async function getPayloadAdmin(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const role = user && typeof user === 'object' && 'role' in user ? user.role : null
  if (role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return { payload }
}

export async function GET(req: NextRequest) {
  const auth = await getPayloadAdmin(req)
  if (auth instanceof NextResponse) return auth
  const db = await createServiceClient()
  const { data, error } = await db.from('ai_static_docs').select('*').order('doc_type').order('locale')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ docs: data })
}

export async function PUT(req: NextRequest) {
  const auth = await getPayloadAdmin(req)
  if (auth instanceof NextResponse) return auth
  const body = await req.json().catch(() => null)

  const docType = body?.doc_type
  const locale = body?.locale ?? 'en'
  const content = body?.content ?? ''

  if (!VALID_DOC_TYPES.includes(docType)) return NextResponse.json({ error: 'Invalid doc_type' }, { status: 400 })
  if (!VALID_LOCALES.includes(locale)) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })

  const db = await createServiceClient()

  const { data, error } = await db
    .from('ai_static_docs')
    .upsert({ doc_type: docType, locale, content, updated_at: new Date().toISOString() }, { onConflict: 'doc_type,locale' })
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: error?.message || 'Upsert failed' }, { status: 500 })

  // Always delete existing embeddings first (handles clear-and-save correctly)
  await db.from('ai_rag2_documents').delete().eq('source_id', String(data.id)).eq('source_collection', docType).eq('locale', locale)

  let embedded = false
  if (content.trim()) {
    try {
      const res = await getOpenAI().embeddings.create({ model: EMBEDDING_MODEL, input: content })
      await db.from('ai_rag2_documents').insert({
        source_id: String(data.id),
        source_collection: docType,
        locale,
        content,
        metadata: {
          doc_type:          docType,
          source_collection: docType,
          title:             docType.charAt(0).toUpperCase() + docType.slice(1),
          locale,
          locale_fallback:   false,
          chunk_index:       0,
          total_chunks:      1,
          embed_model:       EMBEDDING_MODEL,
        },
        embedding: res.data[0].embedding,
      })
      embedded = true
    } catch (e) {
      console.error('[ai-static-docs] embed error:', e)
    }
  }

  return NextResponse.json({ doc: data, embedded })
}
