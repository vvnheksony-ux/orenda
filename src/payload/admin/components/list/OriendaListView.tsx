'use client'

import type { Column, ListViewClientProps } from 'payload'
import type { StepNavItem } from '@payloadcms/ui'

import { DefaultListView, SetStepNav, useConfig, useListQuery, useTableColumns } from '@payloadcms/ui'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

const ADMIN_TABLE_PAGE_SIZE = 10

type PayloadListDoc = {
  id: number | string
  _status?: unknown
  publishedAt?: unknown
  status?: unknown
  [key: string]: unknown
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
  const docs = (data?.docs || []) as PayloadListDoc[]
  const activeColumns = getVisibleColumns(columns || [])

  useEffect(() => {
    if (query?.limit === ADMIN_TABLE_PAGE_SIZE) return

    void refineListData({ limit: ADMIN_TABLE_PAGE_SIZE, page: 1 }, false)
  }, [query?.limit, refineListData])

  async function deleteDoc(doc: PayloadListDoc) {
    if (!hasDeletePermission) return
    if (!window.confirm('Delete this record?')) return

    const response = await fetch(`/payload-api/${collectionSlug}/${doc.id}`, {
      credentials: 'include',
      method: 'DELETE',
    })

    if (response.ok) {
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
                        {renderCleanCell(column, doc, rowIndex, docs)}
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
