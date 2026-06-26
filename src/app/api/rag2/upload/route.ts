import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'
import { chunkText } from '@/lib/rag2/chunk-text'

export const runtime = 'nodejs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const EMBEDDING_MODEL = 'text-embedding-3-small'
const MAX_FILE_BYTES = 10 * 1024 * 1024

async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const result = await pdfParse(buffer)
    return result.text
  }
  return buffer.toString('utf-8')
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts })
  return res.data.map(d => d.embedding)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uploadSecret = process.env.RAG2_UPLOAD_SECRET ?? ''
  if (!uploadSecret || req.headers.get('X-Upload-Secret') !== uploadSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const docType = (formData.get('doc_type') as string | null)?.trim() ?? ''

  if (!file || !docType) {
    return NextResponse.json({ error: 'file and doc_type required' }, { status: 400 })
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const db = await createServiceClient()

  // Upload to Supabase Storage bucket 'ai-docs'
  const uploadPath = `${docType}/${crypto.randomUUID()}/${file.name}`
  const { error: storageErr } = await db.storage
    .from('ai-docs')
    .upload(uploadPath, buffer, { contentType: file.type || 'application/octet-stream', upsert: false })

  if (storageErr) {
    console.error('[rag2/upload] storage error:', storageErr)
    return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const fileUrl = `${supabaseUrl}/storage/v1/object/ai-docs/${uploadPath}`

  const { data: uploadRecord, error: insertErr } = await db
    .from('ai_rag2_uploads')
    .insert({ filename: file.name, url: fileUrl, doc_type: docType, size_bytes: file.size, status: 'pending' })
    .select('id')
    .single()

  if (insertErr || !uploadRecord) {
    console.error('[rag2/upload] upload record insert error:', insertErr)
    return NextResponse.json({ error: 'Failed to save upload record' }, { status: 500 })
  }

  const uploadId: string = uploadRecord.id

  let text: string
  try {
    text = await extractText(buffer, file.name)
  } catch (err: any) {
    await db.from('ai_rag2_uploads').update({ status: 'error', error: err.message }).eq('id', uploadId)
    return NextResponse.json({ error: 'Text extraction failed' }, { status: 500 })
  }

  const chunks = chunkText(text)
  if (chunks.length === 0) {
    await db.from('ai_rag2_uploads').update({ status: 'error', error: 'No text extracted' }).eq('id', uploadId)
    return NextResponse.json({ error: 'No text content found in file' }, { status: 400 })
  }

  // Delete previous embeddings for this doc_type (replace old upload)
  const { data: oldUploads } = await db
    .from('ai_rag2_uploads')
    .select('id')
    .eq('doc_type', docType)
    .neq('id', uploadId)
  if (oldUploads?.length) {
    const oldIds = oldUploads.map((u: any) => u.id)
    await db.from('ai_rag2_documents').delete().in('source_id', oldIds)
    await db.from('ai_rag2_uploads').delete().in('id', oldIds)
  }

  // Embed in batches of 50
  const embeddingRows: object[] = []
  for (let i = 0; i < chunks.length; i += 50) {
    const batch = chunks.slice(i, i + 50)
    const embeddings = await embedBatch(batch)
    for (let j = 0; j < batch.length; j++) {
      embeddingRows.push({
        source_id:         uploadId,
        source_collection: docType,
        locale:            'en',
        content:           batch[j],
        metadata:          { doc_type: docType, filename: file.name, chunk_index: i + j },
        embedding:         embeddings[j],
      })
    }
  }

  const { error: embedErr } = await db.from('ai_rag2_documents').insert(embeddingRows)
  if (embedErr) {
    await db.from('ai_rag2_uploads').update({ status: 'error', error: embedErr.message }).eq('id', uploadId)
    console.error('[rag2/upload] embed insert error:', embedErr)
    return NextResponse.json({ error: 'Embedding insert failed' }, { status: 500 })
  }

  await db.from('ai_rag2_uploads').update({ status: 'embedded' }).eq('id', uploadId)
  console.log(`[rag2/upload] ${file.name} → ${chunks.length} chunks → ${docType}`)
  return NextResponse.json({ uploadId, chunks: chunks.length })
}
