import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'
import { chunkText } from '@/lib/rag2/chunk-text'

export const runtime = 'nodejs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const EMBEDDING_MODEL = 'text-embedding-3-small'
const MAX_FILE_BYTES = 10 * 1024 * 1024

async function getPayloadAdmin(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const role = user && typeof user === 'object' && 'role' in user ? user.role : null
  if (role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return { payload }
}

async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const result = await pdfParse(buffer)
    return result.text
  }
  if (ext === 'docx' || ext === 'doc') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }
  return buffer.toString('utf-8')
}

export async function GET(req: NextRequest) {
  const auth = await getPayloadAdmin(req)
  if (auth instanceof NextResponse) return auth
  const db = await createServiceClient()
  const { data, error } = await db.from('ai_rag2_uploads').select('*').eq('doc_type', 'other').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ uploads: data })
}

export async function POST(req: NextRequest) {
  const auth = await getPayloadAdmin(req)
  if (auth instanceof NextResponse) return auth

  const formData = await req.formData().catch(() => null)
  const file = formData?.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: 'File exceeds 10MB' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const db = await createServiceClient()

  const uploadPath = `other/${crypto.randomUUID()}/${file.name}`
  const { error: storageErr } = await db.storage
    .from('ai-docs')
    .upload(uploadPath, buffer, { contentType: file.type || 'application/octet-stream', upsert: false })

  if (storageErr) return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })

  const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/ai-docs/${uploadPath}`

  const { data: uploadRecord, error: insertErr } = await db
    .from('ai_rag2_uploads')
    .insert({ filename: file.name, url: fileUrl, doc_type: 'other', size_bytes: file.size, status: 'pending' })
    .select('id')
    .single()

  if (insertErr || !uploadRecord) return NextResponse.json({ error: 'Failed to save upload record' }, { status: 500 })

  const uploadId: string = uploadRecord.id

  let text: string
  try {
    text = await extractText(buffer, file.name)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    await db.from('ai_rag2_uploads').update({ status: 'error', error: msg }).eq('id', uploadId)
    return NextResponse.json({ error: 'Text extraction failed' }, { status: 500 })
  }

  const chunks = chunkText(text)
  if (chunks.length === 0) {
    await db.from('ai_rag2_uploads').update({ status: 'error', error: 'No text found' }).eq('id', uploadId)
    return NextResponse.json({ error: 'No text content found' }, { status: 400 })
  }

  const rows: object[] = []
  for (let i = 0; i < chunks.length; i += 50) {
    const batch = chunks.slice(i, i + 50)
    const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: batch })
    for (let j = 0; j < batch.length; j++) {
      rows.push({
        source_id: uploadId,
        source_collection: 'other',
        locale: 'en',
        content: batch[j],
        metadata: { doc_type: 'other', filename: file.name, chunk_index: i + j },
        embedding: res.data[j].embedding,
      })
    }
  }

  const { error: embedErr } = await db.from('ai_rag2_documents').insert(rows)
  if (embedErr) {
    await db.from('ai_rag2_uploads').update({ status: 'error', error: embedErr.message }).eq('id', uploadId)
    return NextResponse.json({ error: 'Embedding failed' }, { status: 500 })
  }

  await db.from('ai_rag2_uploads').update({ status: 'embedded' }).eq('id', uploadId)
  return NextResponse.json({ uploadId, chunks: chunks.length })
}
