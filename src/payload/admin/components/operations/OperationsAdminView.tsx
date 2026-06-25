import type { AdminViewServerProps, Payload, VisibleEntities } from 'payload'
import type { StepNavItem } from '@payloadcms/ui'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { SetStepNav } from '@payloadcms/ui'
import { getPermissionAccess } from '@zealamic/payload-plugin-rbac'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/utils/supabase/server'
import { operationsTableFeatureMap } from '@/payload/access/featureMap'

import OperationsDetail from './OperationsDetail'
import OperationsTable from './OperationsTable'
import { getOperationConfig, getOperationHref, getOperationTableName, isOperationTableSlug, parseOperationSegments, type OperationConfig, type OperationRecord, type PayloadCollectionSlug, type ReferenceOptionMap } from './operationsConfig'

export const dynamic = 'force-dynamic'

type AdminLocale = 'en' | 'km' | 'zh'

async function checkTablePermission(
  payload: Payload,
  user: Record<string, unknown> | null | undefined,
  table: string,
): Promise<boolean> {
  if (!user) return false
  if (user.isSuperAdmin === true) return true
  const featureCode = operationsTableFeatureMap[table]
  if (!featureCode) return false
  const check = getPermissionAccess({ featureCode, actionCode: 'read', mode: 'none' })
  const result = await check({ req: { user, payload } } as { req: { user: typeof user; payload: Payload } })
  return result === true
}

export default async function OperationsAdminView(props: AdminViewServerProps) {
  const { locale, permissions, req } = props.initPageResult ?? {}
  const routeParams = props.params as { segments?: string[]; table?: string } | undefined
  const resolvedPath = resolveOperationPath(req?.url)
  const segments = Array.isArray(routeParams?.segments)
    ? routeParams.segments
    : resolvedPath.split('/').filter(Boolean)
  const explicitTable = typeof routeParams?.table === 'string' ? routeParams.table : undefined
  const { id, mode: viewMode, table: parsedTable } = parseOperationSegments(segments)
  const table = explicitTable ?? parsedTable
  if (!isOperationTableSlug(table)) {
    notFound()
  }
  const config = getOperationConfig(table)
  const supabase = await createServiceClient()
  const authedUser = (req?.user ?? props.user) as ({ id?: number | string } & Record<string, unknown>) | null | undefined
  const user = await resolveFullAdminUser(props.payload, authedUser)
  const templateProps = {
    ...props,
    locale: props.locale ?? locale,
    permissions: props.permissions ?? permissions,
    req,
    user: user ?? props.user,
    visibleEntities: props.visibleEntities ?? getAllVisibleEntities(props),
  }

  const payload = props.payload ?? (req as { payload?: Payload } | undefined)?.payload
  const localeCode = normalizeLocale(locale)

  if (payload && !(await checkTablePermission(payload, user, table))) {
    const nav: StepNavItem[] = [
      { label: config.group },
      { label: config.title },
    ]
    return (
      <DefaultTemplate {...templateProps} className="operations-template">
        <SetStepNav nav={nav} />
        <main className="mx-auto flex w-full flex-col gap-6 px-19">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            You do not have permission to view {config.title.toLowerCase()}.
          </div>
        </main>
      </DefaultTemplate>
    )
  }

  const listUrl = config.listHref ?? getOperationHref(config.slug)

  if (viewMode === 'create') {
    const referenceOptions = await fetchReferenceOptions(payload, config, localeCode)
    const createNav: StepNavItem[] = [
      { label: config.group },
      { label: config.singularTitle, url: listUrl },
      { label: 'Create' },
    ]
    return (
      <DefaultTemplate {...templateProps} className="operations-template">
        <SetStepNav nav={createNav} />
        <OperationsDetail config={config} mode="create" referenceOptions={referenceOptions} />
      </DefaultTemplate>
    )
  }

  if (viewMode !== 'list' && id) {
    const { data, error } = await supabase
      .schema('public')
      .from(getOperationTableName(config))
      .select('*')
      .eq('id', id)
      .maybeSingle()

    const record = (data || null) as OperationRecord | null
    const enriched = record ? await enrichRecord(payload, config, record, localeCode) : null
    const referenceOptions = await fetchReferenceOptions(payload, config, localeCode)
    const shortId = id.slice(0, 8)
    const detailNav: StepNavItem[] = [
      { label: config.group },
      { label: config.singularTitle, url: listUrl },
      { label: `#${shortId}`, url: getOperationHref(config.slug, 'view', id) },
      ...(viewMode === 'edit' ? [{ label: 'Edit' } as StepNavItem] : []),
    ]

    return (
      <DefaultTemplate {...templateProps} className="operations-template">
        <SetStepNav nav={detailNav} />
        <OperationsDetail config={config} error={error?.message} mode={viewMode} record={enriched} referenceOptions={referenceOptions} />
      </DefaultTemplate>
    )
  }

  const { data, error } = await supabase
    .schema('public')
    .from(getOperationTableName(config))
    .select('*')
    .order('created_at', { ascending: false })

  const records = (data || []) as OperationRecord[]
  const enriched = await enrichRecords(payload, config, records, localeCode)
  const listNav: StepNavItem[] = [
    { label: config.group },
    { label: config.title },
  ]

  return (
    <DefaultTemplate {...templateProps} className="operations-template">
      <SetStepNav nav={listNav} />
      <main className="mx-auto flex w-full flex-col gap-6 px-19">
        <header className="flex items-center justify-between rounded-2xl">
          <h1 className="m-0 text-[20px] font-bold text-[#2b2823]">{config.title}</h1>
          {config.slug === 'appointments' || config.slug === 'purchases' || config.slug === 'inquiries' ? (
            <a
              className="inline-flex items-center gap-2 rounded-xl bg-[#b89148] px-5 py-2 text-sm font-bold text-white no-underline transition-colors hover:bg-[#a37d3e]"
              href={getOperationHref(config.slug, 'create')}
            >
              Create New
            </a>
          ) : null}
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

async function resolveFullAdminUser(
  payload: Payload,
  user: ({ id?: number | string } & Record<string, unknown>) | null | undefined,
): Promise<Record<string, unknown> | null> {
  if (!user?.id) return (user as Record<string, unknown> | null | undefined) ?? null

  try {
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 1,
      overrideAccess: true,
    })

    return fullUser as unknown as Record<string, unknown>
  } catch {
    return user
  }
}

function resolveOperationPath(url: string | undefined): string {
  if (!url) return ''

  try {
    const pathname = new URL(url, 'http://localhost').pathname
    const operationsIndex = pathname.indexOf('/operations/')

    return operationsIndex >= 0 ? pathname.slice(operationsIndex) : pathname
  } catch {
    return ''
  }
}

async function enrichRecords(
  payload: Payload | undefined,
  config: OperationConfig,
  records: OperationRecord[],
  locale: AdminLocale,
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
  locale: AdminLocale,
): Promise<OperationRecord | null> {
  if (!record) return null
  const enriched = await enrichRecords(payload, config, [record], locale)
  return enriched[0] || record
}

async function resolveReferences(
  payload: Payload,
  config: OperationConfig,
  records: OperationRecord[],
  locale: AdminLocale,
): Promise<Record<string, Record<string, string>>> {
  const idsByCollection = new Map<PayloadCollectionSlug, Set<string>>()

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
        map[String(doc.id)] = getDocStringValue(doc, titleField) || String(doc.id)
      }

      result[collection] = map
    } catch {
      result[collection] = {}
    }
  }

  return result
}

async function fetchReferenceOptions(
  payload: Payload | undefined,
  config: OperationConfig,
  locale: AdminLocale,
): Promise<ReferenceOptionMap> {
  if (!payload || !config.referenceResolvers?.length) return {}

  const options: ReferenceOptionMap = {}

  for (const resolver of config.referenceResolvers) {
    try {
      const { docs } = await payload.find({
        collection: resolver.collection,
        depth: 0,
        limit: 1000,
        locale,
      })
      options[resolver.recordField] = docs
        .map((doc) => ({ id: String(doc.id), name: getDocStringValue(doc, resolver.titleField) || String(doc.id) }))
        .sort((a, b) => a.name.localeCompare(b.name))
    } catch {
      options[resolver.recordField] = []
    }
  }

  return options
}

function normalizeLocale(value: unknown): AdminLocale {
  return value === 'km' || value === 'zh' ? value : 'en'
}

function getDocStringValue(doc: unknown, key: string): string | undefined {
  const value = (doc as Record<string, unknown>)[key]
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
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
