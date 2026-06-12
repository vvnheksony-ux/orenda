'use client'

import { Eye, Pencil, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'

import Pagination, { PAGE_SIZE } from '../shared/Pagination'
import { getOperationHref, statusColor, type OperationConfig, type OperationRecord } from './operationsConfig'

type OperationsTableProps = {
  config: OperationConfig
  initialRecords: OperationRecord[]
}

type AppointmentFilters = {
  doctor: string
  branch: string
  department: string
  preferredDate: string
  status: string
}

type PromotionPurchaseFilters = {
  promotion: string
  branch: string
  status: string
  source: string
}

type FilterOption = {
  label: string
  value: string
}

const emptyAppointmentFilters: AppointmentFilters = {
  doctor: '',
  branch: '',
  department: '',
  preferredDate: '',
  status: '',
}

const emptyPromotionPurchaseFilters: PromotionPurchaseFilters = {
  promotion: '',
  branch: '',
  status: '',
  source: '',
}

export default function OperationsTable({ config, initialRecords }: OperationsTableProps) {
  const router = useRouter()
  const [records, setRecords] = useState(initialRecords)
  const [search, setSearch] = useState('')
  const [appointmentFilters, setAppointmentFilters] = useState(emptyAppointmentFilters)
  const [promotionPurchaseFilters, setPromotionPurchaseFilters] = useState(emptyPromotionPurchaseFilters)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isAppointmentsTable = config.slug === 'appointments'
  const isPromotionPurchasesTable = config.slug === 'purchases'
  const hasAppointmentFilters = Object.values(appointmentFilters).some(Boolean)
  const hasPromotionPurchaseFilters = Object.values(promotionPurchaseFilters).some(Boolean)
  const hasOperationFilters = hasAppointmentFilters || hasPromotionPurchaseFilters

  const appointmentFilterOptions = useMemo(() => {
    if (!isAppointmentsTable) return null

    return {
      doctor: buildOptions(records, 'doctor_payload_id_resolved'),
      branch: buildOptions(records, 'branch_payload_id_resolved'),
      department: buildOptions(records, 'department_payload_id_resolved'),
      preferredDate: buildDateOptions(records, 'preferred_date'),
      status: buildOptions(records, 'status', formatLabel),
    }
  }, [records, isAppointmentsTable])

  const promotionPurchaseFilterOptions = useMemo(() => {
    if (!isPromotionPurchasesTable) return null

    return {
      promotion: buildOptions(records, 'promotion_title'),
      branch: buildOptions(records, 'branch_payload_id_resolved'),
      status: buildOptions(records, 'status', formatLabel),
      source: buildOptions(records, 'source', formatLabel),
    }
  }, [records, isPromotionPurchasesTable])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return records.filter((record) => {
      if (search && !config.columns.some((column) => {
        const value = record[column.key]
        return value != null && String(value).toLowerCase().includes(q)
      })) {
        return false
      }

      if (isAppointmentsTable) {
        return matchesFilter(record, 'doctor_payload_id_resolved', appointmentFilters.doctor)
          && matchesFilter(record, 'branch_payload_id_resolved', appointmentFilters.branch)
          && matchesFilter(record, 'department_payload_id_resolved', appointmentFilters.department)
          && matchesDateFilter(record, 'preferred_date', appointmentFilters.preferredDate)
          && matchesFilter(record, 'status', appointmentFilters.status)
      }

      if (isPromotionPurchasesTable) {
        return matchesFilter(record, 'promotion_title', promotionPurchaseFilters.promotion)
          && matchesFilter(record, 'branch_payload_id_resolved', promotionPurchaseFilters.branch)
          && matchesFilter(record, 'status', promotionPurchaseFilters.status)
          && matchesFilter(record, 'source', promotionPurchaseFilters.source)
      }

      return true
    })
  }, [records, search, config.columns, isAppointmentsTable, isPromotionPurchasesTable, appointmentFilters, promotionPurchaseFilters])

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

  const handleAppointmentFilter = (key: keyof AppointmentFilters, value: string) => {
    setAppointmentFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const clearAppointmentFilters = () => {
    setAppointmentFilters(emptyAppointmentFilters)
    setPage(1)
  }

  const handlePromotionPurchaseFilter = (key: keyof PromotionPurchaseFilters, value: string) => {
    setPromotionPurchaseFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const clearPromotionPurchaseFilters = () => {
    setPromotionPurchaseFilters(emptyPromotionPurchaseFilters)
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

  function openRecord(id: string) {
    router.push(getOperationHref(config.slug, 'view', id))
  }

  if (!filtered.length) {
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
        {isAppointmentsTable && appointmentFilterOptions ? (
          <AppointmentFilterRow
            filters={appointmentFilters}
            hasFilters={hasAppointmentFilters}
            onChange={handleAppointmentFilter}
            onClear={clearAppointmentFilters}
            options={appointmentFilterOptions}
          />
        ) : null}
        {isPromotionPurchasesTable && promotionPurchaseFilterOptions ? (
          <PromotionPurchaseFilterRow
            filters={promotionPurchaseFilters}
            hasFilters={hasPromotionPurchaseFilters}
            onChange={handlePromotionPurchaseFilter}
            onClear={clearPromotionPurchaseFilters}
            options={promotionPurchaseFilterOptions}
          />
        ) : null}
        {search || hasOperationFilters ? (
          <div className="rounded-xl border border-[#eee8dd] bg-white px-4 py-6 text-sm text-[#716b60]">
            No records match the current search or filters.
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

      {isAppointmentsTable && appointmentFilterOptions ? (
        <AppointmentFilterRow
          filters={appointmentFilters}
          hasFilters={hasAppointmentFilters}
          onChange={handleAppointmentFilter}
          onClear={clearAppointmentFilters}
          options={appointmentFilterOptions}
        />
      ) : null}

      {isPromotionPurchasesTable && promotionPurchaseFilterOptions ? (
        <PromotionPurchaseFilterRow
          filters={promotionPurchaseFilters}
          hasFilters={hasPromotionPurchaseFilters}
          onChange={handlePromotionPurchaseFilter}
          onClear={clearPromotionPurchaseFilters}
          options={promotionPurchaseFilterOptions}
        />
      ) : null}

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
              <tr
                className="cursor-pointer"
                key={record.id}
                onClick={() => openRecord(record.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openRecord(record.id)
                  }
                }}
                role="link"
                tabIndex={0}
              >
                {config.columns.map((column) => (
                  <td className={`cell-${column.key}`} key={column.key}>
                    <div className="orienda-list-table__cell-content">
                      {renderCell(record, column.key)}
                    </div>
                  </td>
                ))}
                <td className="orienda-list-table__actions-cell">
                  <div className="orienda-list-table__actions" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                    <Link
                      aria-label="View record details"
                      className="orienda-table-action orienda-table-action--view"
                      href={getOperationHref(config.slug, 'view', record.id)}
                      title="View details"
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

function PromotionPurchaseFilterRow({
  filters,
  hasFilters,
  onChange,
  onClear,
  options,
}: {
  filters: PromotionPurchaseFilters
  hasFilters: boolean
  onChange: (key: keyof PromotionPurchaseFilters, value: string) => void
  onClear: () => void
  options: Record<keyof PromotionPurchaseFilters, FilterOption[]>
}) {
  return (
    <div className=" flex flex-row gap-4 justify-start items-center mb-4">
      <FilterSelect label="Promotion" onChange={(value) => onChange('promotion', value)} options={options.promotion} value={filters.promotion} />
      <FilterSelect label="Branch" onChange={(value) => onChange('branch', value)} options={options.branch} value={filters.branch} />
      <FilterSelect label="Status" onChange={(value) => onChange('status', value)} options={options.status} value={filters.status} />
      <FilterSelect label="Source" onChange={(value) => onChange('source', value)} options={options.source} value={filters.source} />
      {hasFilters ? (
        <button
          className="h-10 rounded-lg border border-[#dedbd4] bg-white px-3 text-xs font-semibold text-[#716b60] transition hover:border-[#c29a4a] hover:text-[#8f6f31]"
          onClick={onClear}
          type="button"
        >
          Clear
        </button>
      ) : null}
    </div>
  )
}

function AppointmentFilterRow({
  filters,
  hasFilters,
  onChange,
  onClear,
  options,
}: {
  filters: AppointmentFilters
  hasFilters: boolean
  onChange: (key: keyof AppointmentFilters, value: string) => void
  onClear: () => void
  options: Record<keyof AppointmentFilters, FilterOption[]>
}) {
  return (
    <div className=" flex flex-row gap-4 justify-start items-center mb-4">
      <FilterSelect label="Doctor" onChange={(value) => onChange('doctor', value)} options={options.doctor} value={filters.doctor} />
      <FilterSelect label="Branch" onChange={(value) => onChange('branch', value)} options={options.branch} value={filters.branch} />
      <FilterSelect label="Department" onChange={(value) => onChange('department', value)} options={options.department} value={filters.department} />
      <FilterSelect label="Preferred Date" onChange={(value) => onChange('preferredDate', value)} options={options.preferredDate} value={filters.preferredDate} />
        <FilterSelect label="Status" onChange={(value) => onChange('status', value)} options={options.status} value={filters.status} />
        {hasFilters ? (
          <button
            className="h-10 rounded-lg border border-[#dedbd4] bg-white px-3 text-xs font-semibold text-[#716b60] transition hover:border-[#c29a4a] hover:text-[#8f6f31]"
            onClick={onClear}
            type="button"
          >
            Clear
          </button>
        ) : null}
    </div>
  )
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: FilterOption[]
  value: string
}) {
  return (
    <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-[#716b60]">
      {/* {label} */}
      <select
        className="h-10 w-full rounded-lg border border-[#dedbd4] bg-white px-3 text-sm font-normal text-[#393733] outline-none transition focus:border-[#c29a4a] focus:ring-3 focus:ring-[#c29a4a]/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function buildOptions(records: OperationRecord[], key: string, format: (value: string) => string = (value) => value): FilterOption[] {
  const options = new Map<string, string>()

  for (const record of records) {
    const value = record[key]
    if (value == null || value === '') continue

    const optionValue = String(value)
    options.set(optionValue, format(optionValue))
  }

  return Array.from(options, ([value, label]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label))
}

function buildDateOptions(records: OperationRecord[], key: string): FilterOption[] {
  const options = new Map<string, string>()

  for (const record of records) {
    const value = toDateFilterValue(record[key])
    if (!value) continue

    options.set(value, formatDate(value))
  }

  return Array.from(options, ([value, label]) => ({ label, value })).sort((a, b) => a.value.localeCompare(b.value))
}

function matchesFilter(record: OperationRecord, key: string, filter: string) {
  if (!filter) return true
  const value = record[key]
  return value != null && String(value) === filter
}

function matchesDateFilter(record: OperationRecord, key: string, filter: string) {
  if (!filter) return true
  return toDateFilterValue(record[key]) === filter
}

function toDateFilterValue(value: OperationRecord[string]) {
  if (typeof value !== 'string') return ''
  return value.slice(0, 10)
}

function renderCell(
  record: OperationRecord,
  key: string
) {
  const value = record[key]

  if (key === 'status') {
    const label = typeof value === 'string' ? formatLabel(value) : '-'
    const colorClass = typeof value === 'string' ? statusColor(value) : 'bg-[#ebe7e1] text-[#716b60]'
    return <span className={`rounded-full px-3 py-1 text-sm capitalize ${colorClass}`}>{label}</span>
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
