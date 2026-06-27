import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'

const EMBEDDING_MODEL = 'text-embedding-3-small'

export interface Rag2SearchResult {
  id: number
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export type SearchTarget = { collection: string; topK: number }

export async function embedQuery(text: string, openai: OpenAI): Promise<number[]> {
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text })
  return res.data[0].embedding
}

async function searchOne(
  embedding: number[],
  collection: string,
  locale: string,
  topK: number,
): Promise<Rag2SearchResult[]> {
  const db = await createServiceClient()
  const { data, error } = await db.rpc('match_ai_rag2_documents', {
    query_embedding: embedding,
    match_count: topK,
    filter: { source_collection: collection, locale },
  })
  if (error || !data) return []
  return data as Rag2SearchResult[]
}

export async function parallelSearch(
  embedding: number[],
  targets: SearchTarget[],
  locale: string,
): Promise<Rag2SearchResult[]> {
  const all: Rag2SearchResult[] = []

  await Promise.all(
    targets.map(async ({ collection, topK }) => {
      const results = await searchOne(embedding, collection, locale, topK)
      if (results.length < 3 && locale !== 'en') {
        const enResults = await searchOne(embedding, collection, 'en', topK - results.length)
        const seen = new Set(results.map(r => r.id))
        for (const r of enResults) {
          if (!seen.has(r.id)) { results.push(r); seen.add(r.id) }
        }
      }
      all.push(...results)
    })
  )

  const seen = new Set<number>()
  return all
    .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 15)
}
