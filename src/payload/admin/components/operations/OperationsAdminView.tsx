import type { AdminViewServerProps, Payload, VisibleEntities } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { createServiceClient } from '@/utils/supabase/server'

import OperationsDetail from './OperationsDetail'
import OperationsTable from './OperationsTable'
import { getOperationConfig, parseOperationSegments, type OperationConfig, type OperationRecord } from './operationsConfig'

export const dynamic = 'force-dynamic'

export default async function OperationsAdminView(props: AdminViewServerProps) {
  const segments = Array.isArray(props.params?.segments) ? props.params.segments : []
  const { id, mode: viewMode, table } = parseOperationSegments(segments)
  const config = getOperationConfig(table)
  const supabase = await createServiceClient()
  const { locale, permissions, req, user } = props.initPageResult ?? {}
  const templateProps = {
    ...props,
    locale: props.locale ?? locale,
    permissions: props.permissions ?? permissions,
    req: props.req ?? req,
    user: props.user ?? user,
    visibleEntities: props.visibleEntities ?? getAllVisibleEntities(props),
  }

  const payload = props.payload ?? (req as { payload?: Payload } | undefined)?.payload

  if (viewMode !== 'list' && id) {
    const { data, error } = await supabase
      .schema('public')
      .from(config.slug)
      .select('*')
      .eq('id', id)
      .maybeSingle()

    const record = (data || null) as OperationRecord | null
    const enriched = record ? await enrichRecord(payload, config, record, locale || 'en') : null

    return (
      <DefaultTemplate {...templateProps} className="operations-template">
        <OperationsDetail config={config} error={error?.message} mode={viewMode} record={enriched} />
      </DefaultTemplate>
    )
  }

  const { data, error } = await supabase
    .schema('public')
    .from(config.slug)
    .select('*')
    .order('created_at', { ascending: false })

  const records = (data || []) as OperationRecord[]
  const enriched = await enrichRecords(payload, config, records, locale || 'en')

  return (
    <DefaultTemplate {...templateProps} className="operations-template">
      <main className="mx-auto flex w-full flex-col gap-6 px-19">
        <header className="rounded-2xl">
          {/* <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#8a7556]">Operations</p> */}
          <h1 className="m-0 text-[20px] font-bold text-[#2b2823]">{config.title}</h1>
          {/* <p className="mb-0 mt-2 text-sm text-[#716b60]">{config.description}</p> */}
        </header>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load {config.title.toLowerCase()}: {error.message}
          </div>
        ) : (
          <OperationsTable config={config} initialRecords={enriched} />
        )}
      </main>
    </DefaultTemplate>
  )
}

async function enrichRecords(
  payload: Payload | undefined,
  config: OperationConfig,
  records: OperationRecord[],
  locale: string,
): Promise<OperationRecord[]> {
  if (!payload || !config.referenceResolvers?.length || !records.length) return records

  const resolved = await resolveReferences(payload, config, records, locale)

  return records.map((record) => {
    const enriched = { ...record }
    for (const resolver of config.referenceResolvers!) {
      const id = record[resolver.recordField]
      if (id != null) {
        const name = resolved[resolver.collection]?.[String(id)]
        if (name) {
          enriched[`${resolver.recordField}_resolved`] = name
        }
      }
    }
    return enriched
  })
}

async function enrichRecord(
  payload: Payload | undefined,
  config: OperationConfig,
  record: OperationRecord,
  locale: string,
): Promise<OperationRecord | null> {
  if (!record) return null
  const enriched = await enrichRecords(payload, config, [record], locale)
  return enriched[0] || record
}

async function resolveReferences(
  payload: Payload,
  config: OperationConfig,
  records: OperationRecord[],
  locale: string,
): Promise<Record<string, Record<string, string>>> {
  const idsByCollection = new Map<string, Set<string>>()

  for (const resolver of config.referenceResolvers!) {
    if (!idsByCollection.has(resolver.collection)) {
      idsByCollection.set(resolver.collection, new Set())
    }
    const ids = idsByCollection.get(resolver.collection)!
    for (const record of records) {
      const value = record[resolver.recordField]
      if (value != null) {
        ids.add(String(value))
      }
    }
  }

  const result: Record<string, Record<string, string>> = {}

  for (const [collection, idSet] of idsByCollection) {
    const ids = Array.from(idSet)
    if (!ids.length) continue

    try {
      const { docs } = await payload.find({
        collection,
        where: { id: { in: ids } },
        locale,
        limit: ids.length,
        depth: 0,
      })

      const resolver = config.referenceResolvers!.find((r) => r.collection === collection)
      const titleField = resolver?.titleField || 'title'
      const map: Record<string, string> = {}

      for (const doc of docs) {
        map[doc.id] = doc[titleField] ?? doc.id
      }

      result[collection] = map
    } catch {
      result[collection] = {}
    }
  }

  return result
}

function isHidden(hidden: boolean | ((args: { user: unknown }) => boolean) | undefined, user: unknown): boolean {
  if (typeof hidden === 'function') {
    try {
      return hidden({ user })
    } catch {
      return true
    }
  }
  return !!hidden
}

function getAllVisibleEntities(props: AdminViewServerProps): VisibleEntities {
  const user = props.initPageResult?.user ?? props.user
  return {
    collections: props.payload.config.collections
      .filter(({ admin }) => !isHidden(admin?.hidden, user))
      .map(({ slug }) => slug),
    globals: props.payload.config.globals
      .filter(({ admin }) => !isHidden(admin?.hidden, user))
      .map(({ slug }) => slug),
  }
}
