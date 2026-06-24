import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

type AiDocument = Record<string, unknown>

export async function GET(req: NextRequest) {
  const auth = await getPayloadAdmin(req)
  if (auth instanceof NextResponse) return auth

  const result = await auth.payload.db.drizzle.execute(sql`SELECT * FROM public.ai_orienda_documents ORDER BY id DESC`)
  const data = getRows<AiDocument>(result)

  return NextResponse.json({ documents: data })
}

export async function POST(req: NextRequest) {
  const auth = await getPayloadAdmin(req)
  if (auth instanceof NextResponse) return auth

  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Invalid upload payload.' }, { status: 400 })

  const file = formData.get('file')
  const title = getString(formData.get('title'))
  const status = getString(formData.get('status')) || 'draft'
  const manualContent = getString(formData.get('content'))
  const fileData = file instanceof File ? await getFileData(file) : null

  const now = new Date().toISOString()
  const documentTitle = title || fileData?.name || 'Untitled document'
  const insertData = {
    content: manualContent || fileData?.text || null,
    metadata: {
      authorEmail: auth.email,
      createdAt: now,
      fileName: fileData?.name || null,
      fileSize: fileData?.size || null,
      mimeType: fileData?.type || null,
      status,
      title: documentTitle,
      updatedAt: now,
    },
  }

  const result = await auth.payload.db.drizzle.execute(sql`
    INSERT INTO public.ai_orienda_documents (content, metadata)
    VALUES (${insertData.content}, ${JSON.stringify(insertData.metadata)}::jsonb)
    RETURNING *
  `)
  const data = getRows<AiDocument>(result)[0]

  return NextResponse.json({ document: data }, { status: 201 })
}

async function getPayloadAdmin(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const role = user && typeof user === 'object' && 'role' in user ? user.role : null

  if (role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return {
    email: user && typeof user === 'object' && 'email' in user && typeof user.email === 'string' ? user.email : 'admin@orienda.com',
    payload,
  }
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
