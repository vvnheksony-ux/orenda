'use client'

import type { Column, ListQuery, ListViewClientProps } from 'payload'
import type { StepNavItem } from '@payloadcms/ui'

import { DefaultListView, SetStepNav, useConfig, useListQuery, useTableColumns } from '@payloadcms/ui'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import Pagination, { PAGE_SIZE } from '../shared/Pagination'

type PayloadListDoc = {
  id: number | string
  _status?: unknown
  publishedAt?: unknown
  status?: unknown
  [key: string]: unknown
}

type PayloadListResponse = {
  docs?: PayloadListDoc[]
  totalDocs?: number
}

type OriendaListTableProps = {
  collectionSlug: string
  hasDeletePermission?: boolean
}

export function getStaticLabel(label: unknown): string | undefined {
  if (!label || typeof label === 'boolean') return undefined
  if (typeof label === 'string') return label
  if (typeof label === 'object' && label !== null) {
    return Object.values(label as Record<string, string>)[0]
  }
  return undefined
}

function OriendaListView(props: ListViewClientProps) {
  const { collectionSlug } = props
  const { config } = useConfig()
  const collection = config.collections?.find((c) => c.slug === collectionSlug)
  const groupLabel = getStaticLabel(collection?.admin?.group)

  const nav: StepNavItem[] = []
  if (groupLabel) {
    nav.push({ label: groupLabel })
  }
  nav.push({ label: getStaticLabel(collection?.labels?.plural) ?? collectionSlug })

  return (
    <>
      <DefaultListView
        {...props}
        enableRowSelections={false}
        Table={
          <OriendaListTable
            collectionSlug={props.collectionSlug}
            hasDeletePermission={props.hasDeletePermission}
          />
        }
      />
      <SetStepNav nav={nav} />
    </>
  )
}

function OriendaListTable({ collectionSlug, hasDeletePermission }: OriendaListTableProps) {
  const { data, query, refineListData } = useListQuery()
  const { columns } = useTableColumns()
  const [allDocs, setAllDocs] = useState<PayloadListDoc[]>(() => (data?.docs || []) as PayloadListDoc[])
  const [page, setPage] = useState(1)
  const activeColumns = getVisibleColumns(columns || [])
  const collectionQuery = useMemo(() => getCollectionQuery(query), [query])
  const querySignature = useMemo(() => JSON.stringify(collectionQuery), [collectionQuery])
  const totalRecords = allDocs.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const docs = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return allDocs.slice(start, start + PAGE_SIZE)
  }, [allDocs, safePage])

  useEffect(() => {
    let cancelled = false

    async function loadAllDocs() {
      const params = new URLSearchParams()
      appendQueryParam(params, 'limit', String(Math.max(data?.totalDocs || PAGE_SIZE, PAGE_SIZE)))
      appendQueryParam(params, 'page', '1')
      appendQueryParam(params, 'depth', '0')
      appendObjectParams(params, collectionQuery)

      const response = await fetch(`/payload-api/${collectionSlug}?${params.toString()}`, {
        credentials: 'include',
      }).catch(() => null)

      if (!response?.ok) return

      const json = (await response.json()) as PayloadListResponse
      if (!cancelled) {
        setAllDocs(json.docs || [])
        setPage(1)
      }
    }

    void loadAllDocs()

    return () => {
      cancelled = true
    }
  }, [collectionSlug, collectionQuery, data?.totalDocs, querySignature])

  async function deleteDoc(doc: PayloadListDoc) {
    if (!hasDeletePermission) return
    if (!window.confirm('Delete this record?')) return

    const response = await fetch(`/payload-api/${collectionSlug}/${doc.id}`, {
      credentials: 'include',
      method: 'DELETE',
    })

    if (response.ok) {
      setAllDocs((current) => current.filter((item) => item.id !== doc.id))
      await refineListData(query)
    }
  }

  if (!docs.length) {
    return <div className="orienda-list-empty">No records found.</div>
  }

  return (
    <div className="orienda-list-table-wrap">
      <div className="orienda-list-table-scroll">
        <table className="orienda-list-table">
          <thead>
            <tr>
              {activeColumns.map((column, colIndex) => (
                <th key={column.accessor ?? `th-${colIndex}`} style={{ padding: 0 }}>{column.Heading}</th>
              ))}
              <th className="orienda-list-table__actions-heading" style={{ padding: 0 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc, rowIndex) => {
              const docURL = `/admin/collections/${collectionSlug}/${doc.id}`

              return (
                <tr data-id={doc.id} key={doc.id ?? `row-${rowIndex}`}>
                  {activeColumns.map((column, colIndex) => (
                    <td className={`cell-${column.accessor.replace(/\./g, '__')}`} key={column.accessor ?? `td-${rowIndex}-${colIndex}`}>
                      <div className="orienda-list-table__cell-content">
                        {renderCleanCell(column, doc, rowIndex, allDocs)}
                      </div>
                    </td>
                  ))}
                  <td className="orienda-list-table__actions-cell">
                    <div className="orienda-list-table__actions">
                      <Link aria-label="View record" className="orienda-table-action orienda-table-action--view" href={docURL}>
                        <Eye aria-hidden size={15} />
                        {/* <span>View</span> */}
                      </Link>
                      <Link aria-label="Edit record" className="orienda-table-action orienda-table-action--edit" href={docURL}>
                        <Pencil aria-hidden size={15} />
                        {/* <span>Edit</span> */}
                      </Link>
                      <button
                        aria-label="Delete record"
                        className="orienda-table-action orienda-table-action--delete"
                        disabled={!hasDeletePermission}
                        onClick={() => void deleteDoc(doc)}
                        type="button"
                      >
                        <Trash2 aria-hidden size={15} />
                        {/* <span>Delete</span> */}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={safePage}
        onPageChange={setPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
      />
    </div>
  )
}

function getVisibleColumns(columns: Column[]) {
  return columns.filter((column) => {
    if (!column.active) return false
    if (column.accessor === 'select' || column.accessor === '_select') return false
    return true
  })
}

function renderCleanCell(column: Column, doc: PayloadListDoc, rowIndex: number, docs: PayloadListDoc[]) {
  if (column.accessor === '_status') {
    return <CleanPublicationStatus doc={doc} />
  }

  if (column.accessor === 'status' && (doc.status === 'draft' || doc.status === 'published')) {
    return <CleanPublicationStatus doc={doc} />
  }

  const originalIndex = docs.findIndex((item) => item.id === doc.id)
  if (originalIndex >= 0 && column.renderedCells[originalIndex]) {
    return column.renderedCells[originalIndex]
  }

  return formatCellValue(getNestedValue(doc, column.accessor))
}

function CleanPublicationStatus({ doc }: { doc: PayloadListDoc }) {
  const isPublished = doc._status === 'published' || doc.status === 'published' || Boolean(doc.publishedAt)

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
      {isPublished ? 'Published' : 'Draft'}
    </span>
  )
}

function getCollectionQuery(query: ListQuery) {
  const rest = { ...query }
  delete rest.limit
  delete rest.page
  return rest
}

function appendObjectParams(params: URLSearchParams, value: Record<string, unknown>) {
  Object.entries(value).forEach(([key, item]) => appendQueryParam(params, key, item))
}

function appendQueryParam(params: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null || value === '') return

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendQueryParam(params, `${key}[${index}]`, item))
    return
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) => {
      appendQueryParam(params, `${key}[${childKey}]`, childValue)
    })
    return
  }

  params.set(key, String(value))
}

function getNestedValue(doc: PayloadListDoc, accessor: string) {
  return accessor.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[key]
  }, doc)
}

function formatCellValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '-'
  if (typeof value === 'string') return formatMaybeDate(value)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(formatCellValue).join(', ')
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return String(record.title || record.name || record.email || record.id || '-')
  }
  return String(value)
}

function formatMaybeDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined,
  }).format(date)
}

export default OriendaListView
