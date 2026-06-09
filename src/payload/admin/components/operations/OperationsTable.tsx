'use client'

import { Eye, Pencil, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'

import Pagination, { PAGE_SIZE } from '../shared/Pagination'
import { getOperationHref, type OperationConfig, type OperationRecord } from './operationsConfig'

type OperationsTableProps = {
  config: OperationConfig
  initialRecords: OperationRecord[]
}

export default function OperationsTable({ config, initialRecords }: OperationsTableProps) {
  const [records, setRecords] = useState(initialRecords)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    if (!search) return records
    const q = search.toLowerCase()
    return records.filter((r) =>
      config.columns.some((c) => {
        const v = r[c.key]
        return v != null && String(v).toLowerCase().includes(q)
      })
    )
  }, [records, search, config.columns])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  function deleteRecord(id: string) {
    if (!window.confirm('Delete this public record?')) return

    setError(null)
    startTransition(async () => {
      const response = await fetch(`/api/admin/operations/${config.slug}/${id}`, {
        credentials: 'include',
        method: 'DELETE',
      })

      if (!response.ok) {
        setError(await getErrorMessage(response))
        return
      }

      setRecords((current) => current.filter((record) => record.id !== id))
    })
  }

  if (!filtered.length) {
    return (
      <section className="flex flex-col gap-3">
        {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        <label className="relative block w-full sm:max-w-116">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8c8982]" />
          <input
            className="h-11 w-full rounded-xl border border-[#dedbd4] bg-white pl-11 pr-4 text-sm text-[#393733] shadow-sm outline-none transition placeholder:text-[#aaa6a0] focus:border-[#c29a4a] focus:ring-3 focus:ring-[#c29a4a]/15"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={`Search ${config.title.toLowerCase()}...`}
            type="search"
            value={search}
          />
        </label>
        {search ? (
          <div className="rounded-xl border border-[#eee8dd] bg-white px-4 py-6 text-sm text-[#716b60]">
            No records match &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <div className="rounded-xl border border-[#eee8dd] bg-white px-4 py-6 text-sm text-[#716b60]">No records found.</div>
        )}
      </section>
    )
  }

  return (
    <section className="flex flex-col mt-0 pb-10">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <label className="relative block w-full mt-4 mb-5">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8c8982]" />
        <input
          className="w-full rounded-sm border-none pl-11 pr-4 text-md h-18 text-[#393733] outline-none transition placeholder:text-[#aaa6a0] bg-gray-100"
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={`Search ${config.title.toLowerCase()}...`}
          type="search"
          value={search}
        />
      </label>

      <div className="orienda-list-table-wrap">
        <table className="orienda-list-table">
          <thead>
            <tr>
              {config.columns.map((column) => (
                <th key={column.key} style={{ padding: 0 }}>
                  {column.label}
                </th>
              ))}
              <th className="orienda-list-table__actions-heading" style={{ padding: 0 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((record) => (
              <tr key={record.id}>
                {config.columns.map((column) => (
                  <td className={`cell-${column.key}`} key={column.key}>
                    <div className="orienda-list-table__cell-content">
                      {renderCell(record, column.key)}
                    </div>
                  </td>
                ))}
                <td className="orienda-list-table__actions-cell">
                  <div className="orienda-list-table__actions">
                    <Link
                      aria-label="View record"
                      className="orienda-table-action orienda-table-action--view"
                      href={getOperationHref(config.slug, 'view', record.id)}
                    >
                      <Eye aria-hidden size={15} />
                    </Link>
                    <Link
                      aria-label="Edit record"
                      className="orienda-table-action orienda-table-action--edit"
                      href={getOperationHref(config.slug, 'edit', record.id)}
                    >
                      <Pencil aria-hidden size={15} />
                    </Link>
                    <button
                      aria-label="Delete record"
                      className="orienda-table-action orienda-table-action--delete"
                      disabled={isPending}
                      onClick={() => deleteRecord(record.id)}
                      type="button"
                    >
                      <Trash2 aria-hidden size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalRecords={records.length}
          onPageChange={setPage}
        />
      </div>
    </section>
  )
}

function renderCell(
  record: OperationRecord,
  key: string
) {
  const value = record[key]

  if (key === 'status') {
    return <span className="rounded-full bg-[#ebe7e1] px-3 py-1 text-sm capitalize text-[#716b60]">{typeof value === 'string' ? formatLabel(value) : '-'}</span>
  }

  if (key === 'created_at' || key.endsWith('_date')) {
    return formatDate(value)
  }

  return value == null || value === '' ? '-' : String(value)
}

function formatDate(value: OperationRecord[string]) {
  if (typeof value !== 'string') return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined,
  }).format(date)
}

function formatLabel(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

async function getErrorMessage(response: Response) {
  const data = (await response.json().catch(() => null)) as { error?: string } | null
  return data?.error || 'Operation failed.'
}
