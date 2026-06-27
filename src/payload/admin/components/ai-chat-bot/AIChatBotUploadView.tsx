import type { AdminViewServerProps, VisibleEntities } from 'payload'
import type { StepNavItem } from '@payloadcms/ui'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { SetStepNav } from '@payloadcms/ui'
import { sql } from '@payloadcms/db-postgres'
import AIChatBotUpload from './AIChatBotUpload'

export const dynamic = 'force-dynamic'

export type UploadRecord = {
  id: string
  filename: string | null
  title: string | null
  description: string | null
  url: string | null
  doc_type: string | null
  size_bytes: number | null
  status: string | null
  error: string | null
  created_at: string | null
}

export default async function AIChatBotUploadView(props: AdminViewServerProps) {
  const { locale, permissions, req } = props.initPageResult ?? {}
  const templateProps = {
    ...props,
    locale: props.locale ?? locale,
    permissions: props.permissions ?? permissions,
    req,
    user: props.user,
    visibleEntities: getAllVisibleEntities(props),
  }

  const result = await props.payload.db.drizzle.execute(sql`
    SELECT * FROM public.ai_rag2_uploads WHERE doc_type = 'other' ORDER BY created_at DESC
  `)
  const uploads = getRows<UploadRecord>(result)

  const nav: StepNavItem[] = [{ label: 'Upload File' }]

  return (
    <DefaultTemplate {...templateProps} className="operations-template">
      <SetStepNav nav={nav} />
      <main className="mx-auto flex w-full flex-col gap-6 px-6 py-6 md:px-10 lg:px-19">
        <header>
          <h1 className="m-0 text-[20px] font-bold text-[#2b2823]">Upload File</h1>
          <p className="mb-0 mt-1 text-sm text-[#716b60]">PDF, DOCX, DOC, TXT, MD — for miscellaneous content</p>
        </header>
        <AIChatBotUpload initialUploads={uploads} />
      </main>
    </DefaultTemplate>
  )
}

function getRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[]
  if (result && typeof result === 'object' && 'rows' in result && Array.isArray((result as { rows: unknown[] }).rows)) return (result as { rows: T[] }).rows
  return []
}

function getAllVisibleEntities(props: AdminViewServerProps): VisibleEntities {
  const user = props.user
  return {
    collections: props.payload.config.collections.filter(({ admin }) => {
      if (typeof admin?.hidden === 'function') return user ? !admin.hidden({ user: user as Parameters<typeof admin.hidden>[0]['user'] }) : false
      return !admin?.hidden
    }).map(({ slug }) => slug),
    globals: props.payload.config.globals.filter(({ admin }) => {
      if (typeof admin?.hidden === 'function') return user ? !admin.hidden({ user: user as Parameters<typeof admin.hidden>[0]['user'] }) : false
      return !admin?.hidden
    }).map(({ slug }) => slug),
  }
}
