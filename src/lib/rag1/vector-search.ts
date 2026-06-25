import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'
import type { DocType } from './detect-intent'

const EMBEDDING_MODEL = 'text-embedding-ada-002'

export interface SearchResult {
  id: number
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export async function embedQuery(text: string, openai: OpenAI): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  })
  return res.data[0].embedding
}

async function searchDocType(
  embedding: number[],
  docType: DocType,
  topK: number,
): Promise<SearchResult[]> {
  const db = await createServiceClient()
  const { data, error } = await db.rpc('match_ai_orienda_documents', {
    query_embedding: embedding,
    match_count: topK,
    filter: { doc_type: docType },
  })
  if (error || !data) return []
  return data as SearchResult[]
}

export async function parallelSearch(
  embedding: number[],
  targets: Array<{ type: DocType; topK: number }>,
): Promise<SearchResult[]> {
  const results = await Promise.all(
    targets.map(({ type, topK }) => searchDocType(embedding, type, topK))
  )
  const seen = new Set<number>()
  return results
    .flat()
    .filter(r => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 15)
}
