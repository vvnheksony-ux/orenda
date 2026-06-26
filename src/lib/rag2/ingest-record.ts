import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'
import { getCollectionConfig } from './format/index'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const LOCALES = ['en', 'km', 'zh'] as const

async function embedText(text: string, openai: OpenAI): Promise<number[]> {
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text })
  return res.data[0].embedding
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
