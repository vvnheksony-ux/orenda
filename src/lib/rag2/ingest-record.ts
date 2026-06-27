import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'
import { getCollectionConfig } from './format/index'
import { getRawPool } from '@/lib/db'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const LOCALES = ['en', 'km', 'zh'] as const
const DOCTORS_SUMMARY_ID = 'doctors-summary'

async function embedText(text: string, openai: OpenAI): Promise<number[]> {
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text })
  return res.data[0].embedding
}

export async function rebuildDoctorsSummary(openai: OpenAI): Promise<void> {
  const pool = getRawPool()
  const { rows } = await pool.query(`
    SELECT
      COALESCE(dl.name, endll.name)           AS name,
      COALESCE(dl.specialty, endll.specialty) AS specialty,
      doc.department_id
    FROM payload.doctors doc
    LEFT JOIN payload.doctors_locales dl    ON dl._parent_id = doc.id AND dl._locale = 'en'
    LEFT JOIN payload.doctors_locales endll ON endll._parent_id = doc.id AND endll._locale = 'en'
    WHERE doc._status = 'published'
    ORDER BY doc.id
  `)

  const count = rows.length
  const list = rows
    .map((r: any, i: number) => `${i + 1}. ${r.name ?? 'Unknown'}${r.specialty ? ` — ${r.specialty}` : ''}`)
    .join('\n')
  const content = count > 0
    ? `Orienda has ${count} doctor${count === 1 ? '' : 's'}:\n${list}`
    : 'Orienda currently has no published doctors.'

  const db = await createServiceClient()
  await db.from('ai_rag2_documents').delete().eq('source_id', DOCTORS_SUMMARY_ID)

  if (count === 0) return

  const embedding = await embedText(content, openai)
  await db.from('ai_rag2_documents').insert({
    source_id:         DOCTORS_SUMMARY_ID,
    source_collection: 'doctors',
    locale:            'en',
    content,
    metadata: {
      doc_type:          'doctors',
      source_collection: 'doctors',
      title:             'All Doctors Summary',
      locale:            'en',
      locale_fallback:   false,
      chunk_index:       0,
      total_chunks:      1,
      embed_model:       EMBEDDING_MODEL,
    },
    embedding,
  })
  console.log(`[rag2] rebuilt doctors summary: ${count} doctors`)
}

export async function deleteRecord(sourceId: string): Promise<void> {
  const db = await createServiceClient()
  const { error } = await db.from('ai_rag2_documents').delete().eq('source_id', sourceId)
  if (error) console.error('[rag2] delete error:', error)
}

export async function ingestRecord(
  openai: OpenAI,
  webhookCollection: string,
  docId: number,
): Promise<void> {
  const config = getCollectionConfig(webhookCollection)
  if (!config) {
    console.log(`[rag2] skipping unknown collection: ${webhookCollection}`)
    return
  }

  const sourceId = String(docId)

  // Clean slate before re-embedding
  await deleteRecord(sourceId)

  // Fetch en content first — used as fallback for missing locales
  const enRow = await config.fetchRow(docId, 'en')
  if (!enRow) {
    console.log(`[rag2] doc ${docId} not found or unpublished — skipped`)
    return
  }
  const enText = config.formatText(enRow).trim()
  if (!enText) {
    console.log(`[rag2] doc ${docId} produced empty en text — skipped`)
    return
  }

  const db = await createServiceClient()
  const rows: object[] = []

  for (const locale of LOCALES) {
    let text = enText
    let locRow: any = enRow
    if (locale !== 'en') {
      locRow = await config.fetchRow(docId, locale)
      const locText = locRow ? config.formatText(locRow).trim() : ''
      if (locText) text = locText
    }

    const isLocFallback = locale !== 'en' && text === enText
    const title = config.getTitle(locRow ?? enRow)

    const embedding = await embedText(text, openai)
    rows.push({
      source_id:         sourceId,
      source_collection: config.sourceCollection,
      locale,
      content:           text,
      metadata: {
        doc_type:          config.sourceCollection,
        source_collection: config.sourceCollection,
        title,
        locale,
        locale_fallback:   isLocFallback,
        chunk_index:       0,
        total_chunks:      1,
        embed_model:       EMBEDDING_MODEL,
        doc_id:            docId,
      },
      embedding,
    })
  }

  const { error } = await db.from('ai_rag2_documents').insert(rows)
  if (error) console.error('[rag2] insert error:', error)
  else console.log(`[rag2] embedded ${rows.length} locales for ${webhookCollection}/${docId}`)
}
