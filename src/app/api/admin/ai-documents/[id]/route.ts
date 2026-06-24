import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

type AiDocument = Record<string, unknown>

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requirePayloadAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await context.params
  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Invalid update payload.' }, { status: 400 })

  const existingResult = await auth.payload.db.drizzle.execute(sql`SELECT * FROM public.ai_orienda_documents WHERE id = ${id} LIMIT 1`)
  const existing = getRows<AiDocument>(existingResult)[0]
  if (!existing) return NextResponse.json({ error: 'Document not found.' }, { status: 404 })

  const file = formData.get('file')
  const fileData = file instanceof File ? await getFileData(file) : null
  const title = getString(formData.get('title'))
  const status = getString(formData.get('status'))
  const manualContent = getString(formData.get('content'))
  const existingMetadata = existing.metadata && typeof existing.metadata === 'object' ? existing.metadata as Record<string, unknown> : {}
  const metadata = {
    ...existingMetadata,
    ...(fileData ? { fileName: fileData.name, fileSize: fileData.size, mimeType: fileData.type } : {}),
    ...(status ? { status } : {}),
    ...(title ? { title } : {}),
    updatedAt: new Date().toISOString(),
  }
  const updateData = {
    content: manualContent || fileData?.text || existing.content,
    metadata,
  }

  const result = await auth.payload.db.drizzle.execute(sql`
    UPDATE public.ai_orienda_documents
    SET content = ${updateData.content}, metadata = ${JSON.stringify(updateData.metadata)}::jsonb
    WHERE id = ${id}
    RETURNING *
  `)
  const data = getRows<AiDocument>(result)[0]

  return NextResponse.json({ document: data })
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const auth = await requirePayloadAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await context.params
  await auth.payload.db.drizzle.execute(sql`DELETE FROM public.ai_orienda_documents WHERE id = ${id}`)

  return NextResponse.json({ ok: true })
}

async function requirePayloadAdmin(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const role = user && typeof user === 'object' && 'role' in user ? user.role : null

  if (role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return { payload }
}

function getRows<T>(result: unknown) {
  if (Array.isArray(result)) return result as T[]
  if (result && typeof result === 'object' && 'rows' in result && Array.isArray(result.rows)) return result.rows as T[]
  return []
}

async function getFileData(file: File) {
  const text = file.type.startsWith('text/') || /\.(csv|json|md|txt)$/i.test(file.name) ? await file.text().catch(() => '') : ''
  return { name: file.name, size: file.size, text, type: file.type || 'application/octet-stream' }
}

function getString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}
