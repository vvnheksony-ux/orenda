import type { AdminViewServerProps, VisibleEntities } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { createServiceClient } from '@/utils/supabase/server'

import OperationsDetail from './OperationsDetail'
import OperationsTable from './OperationsTable'
import { getOperationConfig, type OperationRecord } from './operationsConfig'

export const dynamic = 'force-dynamic'

export default async function OperationsAdminView(props: AdminViewServerProps) {
  const segments = Array.isArray(props.params?.segments) ? props.params.segments : []
  const table = segments[1]
  const mode = segments[2]
  const id = segments[3]
  const viewMode = mode === 'view' || mode === 'edit' ? mode : 'list'
  const config = getOperationConfig(table)
  const supabase = await createServiceClient()
  const templateProps = {
    ...props,
    visibleEntities: props.visibleEntities ?? getAllVisibleEntities(props),
  }

  if (viewMode !== 'list' && id) {
    const { data, error } = await supabase
      .schema('public')
      .from(config.slug)
      .select('*')
      .eq('id', id)
      .maybeSingle()

    return (
      <DefaultTemplate {...templateProps} className="operations-template">
        <OperationsDetail config={config} error={error?.message} mode={viewMode} record={(data || null) as OperationRecord | null} />
      </DefaultTemplate>
    )
  }

  const { data, error } = await supabase
    .schema('public')
    .from(config.slug)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const records = (data || []) as OperationRecord[]

  return (
    <DefaultTemplate {...templateProps} className="operations-template">
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-8 py-8">
        <header className="rounded-2xl">
          {/* <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#8a7556]">Operations</p> */}
          <h1 className="m-0 text-3xl font-bold text-[#2b2823]">{config.title}</h1>
          {/* <p className="mb-0 mt-2 text-sm text-[#716b60]">{config.description}</p> */}
        </header>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load {config.title.toLowerCase()}: {error.message}
          </div>
        ) : (
          <OperationsTable config={config} initialRecords={records} />
        )}
      </main>
    </DefaultTemplate>
  )
}

function getAllVisibleEntities(props: AdminViewServerProps): VisibleEntities {
  return {
    collections: props.payload.config.collections.map(({ slug }) => slug),
    globals: props.payload.config.globals.map(({ slug }) => slug),
  }
}
