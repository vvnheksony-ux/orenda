import type { ReactNode } from 'react'
import { Edit, Eye, Globe, Plus, Search, Trash2 } from 'lucide-react'

export type AdminStatus = 'pending' | 'confirmed' | 'completed' | 'published' | 'draft' | 'active' | 'inactive' | 'update' | 'delete' | 'create'

export type AdminTableColumn<T> = {
  key: keyof T | string
  label: string
  kind?: 'text' | 'status' | 'actions'
  className?: string
  headerClassName?: string
  render?: (row: T, index: number) => ReactNode
}

export type AdminTableAction<T> = {
  label: string
  icon?: 'view' | 'edit' | 'delete' | 'publish'
  tone?: 'muted' | 'gold' | 'blue' | 'danger'
  render?: (row: T, index: number) => ReactNode
}

const statusStyles: Record<AdminStatus, string> = {
  pending: 'bg-[#fff1cf] text-[#c49124]',
  confirmed: 'bg-[#dff8ed] text-[#2ead73]',
  completed: 'bg-[#dcf7e9] text-[#31a86e]',
  published: 'bg-[#dcf7e9] text-[#31a86e]',
  draft: 'bg-[#efeeeb] text-[#6f6b64]',
  active: 'bg-[#dcf7e9] text-[#31a86e]',
  inactive: 'bg-[#efeeeb] text-[#8a8680]',
  update: 'bg-[#e3ebff] text-[#5c83d9]',
  delete: 'bg-[#ffe3e6] text-[#e56776]',
  create: 'bg-[#dcf7e9] text-[#31a86e]',
}

const actionToneStyles = {
  muted: 'text-[#7d7a74] hover:bg-[#f4f1ea]',
  gold: 'text-[#b38531] hover:bg-[#fbf5e9]',
  blue: 'text-[#1687e5] hover:bg-[#edf7ff]',
  danger: 'text-[#f04455] hover:bg-[#fff0f2]',
}

export default function AdminDataTable<T extends Record<string, string>>({
  title,
  subtitle,
  searchPlaceholder,
  primaryActionLabel,
  columns,
  rows,
  actions,
  footer,
  rowKey,
}: {
  title?: string
  subtitle?: string
  searchPlaceholder?: string
  primaryActionLabel?: string
  columns: AdminTableColumn<T>[]
  rows: T[]
  actions?: AdminTableAction<T>[]
  footer?: string
  rowKey?: keyof T | ((row: T, index: number) => string)
}) {
  return (
    <article>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h2 className="text-base font-bold text-[#2d2b28]">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-[#918b82]">{subtitle}</p>}
        </div>
      )}
      {(searchPlaceholder || primaryActionLabel) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {searchPlaceholder ? (
            <label className="relative block w-full sm:max-w-116">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8c8982]" />
              <input
                type="search"
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-xl border border-[#dedbd4] bg-white pl-11 pr-4 text-sm text-[#393733] shadow-sm outline-none transition placeholder:text-[#aaa6a0] focus:border-[#c29a4a] focus:ring-3 focus:ring-[#c29a4a]/15"
              />
            </label>
          ) : (
            <span />
          )}
          {primaryActionLabel && (
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#b98a3a] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#a57a31]">
              <Plus className="size-4" />
              {primaryActionLabel}
            </button>
          )}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(53,42,22,0.08)] ring-1 ring-[#f0ece4]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-155 border-collapse text-left text-sm">
            <thead className="bg-[#ebe8e1] text-xs font-bold text-[#817b72]">
              <tr>
                {columns.map((column) => (
                  <th key={String(column.key)} className={`px-5 py-4 ${column.headerClassName ?? ''}`}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efede8]">
              {rows.map((row, index) => (
                <tr key={getRowKey(row, index, rowKey)} className="text-[#393733]">
                  {columns.map((column) => (
                    <td key={String(column.key)} className={`px-5 py-4 ${column.className ?? ''}`}>
                      {renderCell(row, index, column, actions)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {footer && <button className="px-7 py-5 text-sm font-semibold text-[#b38531]">{footer} -&gt;</button>}
      </div>
    </article>
  )
}

function StatusBadge({ status }: { status: AdminStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status] ?? 'bg-[#efeeeb] text-[#6f6b64]'}`}>{status}</span>
}

function renderCell<T extends Record<string, string>>(row: T, index: number, column: AdminTableColumn<T>, actions?: AdminTableAction<T>[]) {
  if (column.render) return column.render(row, index)
  if (column.kind === 'actions') return <ActionButtons row={row} index={index} actions={actions} />

  const value = row[column.key]
  if (column.kind === 'status' || column.key === 'status' || column.key === 'action') {
    return <StatusBadge status={value as AdminStatus} />
  }

  return value
}

function ActionButtons<T extends Record<string, string>>({ row, index, actions }: { row: T; index: number; actions?: AdminTableAction<T>[] }) {
  if (!actions?.length) return null

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => {
        if (action.render) return <span key={action.label}>{action.render(row, index)}</span>

        const Icon = getActionIcon(action.icon)
        return Icon ? (
          <button key={action.label} aria-label={action.label} className={`grid size-8 place-items-center rounded-lg transition ${actionToneStyles[action.tone ?? 'muted']}`}>
            <Icon className="size-4" />
          </button>
        ) : (
          <button key={action.label} className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${actionToneStyles[action.tone ?? 'gold']}`}>
            {action.label}
          </button>
        )
      })}
    </div>
  )
}

function getActionIcon(icon: AdminTableAction<Record<string, string>>['icon']) {
  if (icon === 'view') return Eye
  if (icon === 'edit') return Edit
  if (icon === 'delete') return Trash2
  if (icon === 'publish') return Globe
  return undefined
}

function getRowKey<T extends Record<string, string>>(row: T, index: number, rowKey?: keyof T | ((row: T, index: number) => string)) {
  if (typeof rowKey === 'function') return rowKey(row, index)
  if (rowKey) return row[rowKey]
  return index
}
