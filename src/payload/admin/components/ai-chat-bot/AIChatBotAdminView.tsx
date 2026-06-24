import type { AdminViewServerProps, VisibleEntities } from 'payload'
import type { StepNavItem } from '@payloadcms/ui'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { SetStepNav } from '@payloadcms/ui'
import { sql } from '@payloadcms/db-postgres'

import AIChatBotDocuments from './AIChatBotDocuments'

export const dynamic = 'force-dynamic'

export type AITrainingDocument = {
  id: string | number
  title?: string | null
  name?: string | null
  file_name?: string | null
  filename?: string | null
  file_url?: string | null
  url?: string | null
  content?: string | null
  description?: string | null
  status?: string | null
  file_size?: number | string | null
  size?: number | string | null
  mime_type?: string | null
  author?: string | null
  author_email?: string | null
  created_at?: string | null
  updated_at?: string | null
  last_edited_at?: string | null
  metadata?: Record<string, unknown> | null
  [key: string]: unknown
}

export default async function AIChatBotAdminView(props: AdminViewServerProps) {
  const { locale, permissions, req } = props.initPageResult ?? {}
  const templateProps = {
    ...props,
    locale: props.locale ?? locale,
    permissions: props.permissions ?? permissions,
    req,
    user: props.user,
    visibleEntities: props.visibleEntities ?? getAllVisibleEntities(props),
  }

  const result = await props.payload.db.drizzle.execute(sql`SELECT * FROM public.ai_orienda_documents ORDER BY id DESC`)
  const data = getRows<AITrainingDocument>(result)

  const nav: StepNavItem[] = [
    { label: 'Content' },
    { label: 'AI Chat Bot' },
  ]

  return (
    <DefaultTemplate {...templateProps} className="operations-template">
      <SetStepNav nav={nav} />
      <main className="mx-auto flex w-full flex-col gap-6 px-6 py-6 md:px-10 lg:px-19">
        <header>
          <h1 className="m-0 text-[20px] font-bold text-[#2b2823]">AI Chat Bot</h1>
          <p className="mb-0 mt-1 text-sm text-[#716b60]">Content &gt; AI Chat Bot</p>
        </header>

        <AIChatBotDocuments initialDocuments={data} />
      </main>
    </DefaultTemplate>
  )
}

function getRows<T>(result: unknown) {
  if (Array.isArray(result)) return result as T[]
  if (result && typeof result === 'object' && 'rows' in result && Array.isArray(result.rows)) return result.rows as T[]
  return []
}

function getAllVisibleEntities(props: AdminViewServerProps): VisibleEntities {
  const user = props.user
  return {
    collections: props.payload.config.collections
      .filter(({ admin }) => {
        if (typeof admin?.hidden === 'function') return user ? !admin.hidden({ user: user as Parameters<typeof admin.hidden>[0]['user'] }) : false
        return !admin?.hidden
      })
      .map(({ slug }) => slug),
    globals: props.payload.config.globals
      .filter(({ admin }) => {
        if (typeof admin?.hidden === 'function') return user ? !admin.hidden({ user: user as Parameters<typeof admin.hidden>[0]['user'] }) : false
        return !admin?.hidden
      })
      .map(({ slug }) => slug),
  }
}
