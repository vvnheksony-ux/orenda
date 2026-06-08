'use client'

import { Eye, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'

import type { OperationConfig, OperationRecord } from './operationsConfig'

type OperationsTableProps = {
  config: OperationConfig
  initialRecords: OperationRecord[]
}

export default function OperationsTable({ config, initialRecords }: OperationsTableProps) {
  const [records, setRecords] = useState(initialRecords)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function updateStatus(id: string, status: string) {
    setError(null)
    startTransition(async () => {
      const response = await fetch(`/api/admin/operations/${config.slug}/${id}`, {
        body: JSON.stringify({ status }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })

      if (!response.ok) {
        setError(await getErrorMessage(response))
        return
      }

      setRecords((current) =>
        current.map((record) => (record.id === id ? { ...record, status } : record))
      )
    })
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

  if (!records.length) {
    return <div className="rounded-xl border border-[#e7dfd5] bg-white p-6 text-sm text-[#716b60]">No records found.</div>
  }

  return (
    <section className="flex flex-col gap-3">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="orienda-list-table-wrap">
        <table className="orienda-list-table">
          <thead>
            <tr>
              {config.columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                {config.columns.map((column) => (
                  <td key={column.key}>{renderCell(record, column.key, config.statusOptions, updateStatus, isPending)}</td>
                ))}
                <td>
                  <div className="flex items-center gap-2">
                    <Link className="orienda-table-action orienda-table-action--view" href={`/admin/operations/${config.slug}/view/${record.id}`}>
                      <Eye size={15} />
                    </Link>
                    <Link className="orienda-table-action orienda-table-action--edit" href={`/admin/operations/${config.slug}/edit/${record.id}`}>
                      <Pencil size={15} />
                    </Link>
                    <button
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
      </div>
    </section>
  )
}

function renderCell(
  record: OperationRecord,
  key: string,
  statusOptions: string[],
  updateStatus: (id: string, status: string) => void,
  disabled: boolean
) {
  const value = record[key]

  if (key === 'status') {
    return (
      <select
        className="rounded-lg border border-[#e7dfd5] bg-white px-3 py-2 text-sm text-[#403c35]"
        disabled={disabled}
        onChange={(event) => updateStatus(record.id, event.target.value)}
        value={typeof value === 'string' ? value : ''}
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    )
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
