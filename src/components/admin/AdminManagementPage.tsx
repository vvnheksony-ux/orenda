import AdminHeader from './AdminHeader'
import { Plus, Search } from 'lucide-react'
import AdminDataTable, { type AdminStatus, type AdminTableAction, type AdminTableColumn } from './AdminDataTable'
import AdminContentCardGrid, { type AdminContentCardAction, type AdminContentCardItem } from './AdminContentCardGrid'

type BaseRow = Record<string, string>

type TableConfig<T extends BaseRow> = {
  columns: AdminTableColumn<T>[]
  rows: T[]
  actions?: AdminTableAction<T>[]
  rowKey?: keyof T | ((row: T, index: number) => string)
}

type CardConfig<T extends AdminContentCardItem> = {
  items: T[]
  actions?: AdminContentCardAction<T>[]
  rowKey?: keyof T | ((item: T, index: number) => string)
}

export function AdminTablePage<T extends BaseRow>({
  title,
  breadcrumb,
  searchPlaceholder,
  primaryActionLabel,
  table,
}: {
  title: string
  breadcrumb: string
  searchPlaceholder: string
  primaryActionLabel: string
  table: TableConfig<T>
}) {
  return (
    <AdminPageFrame title={title} breadcrumb={breadcrumb} searchPlaceholder={searchPlaceholder} primaryActionLabel={primaryActionLabel}>
      <AdminDataTable columns={table.columns} rows={table.rows} actions={table.actions} rowKey={table.rowKey} />
    </AdminPageFrame>
  )
}

export function AdminCardPage<T extends AdminContentCardItem>({
  title,
  breadcrumb,
  searchPlaceholder,
  primaryActionLabel,
  cards,
}: {
  title: string
  breadcrumb: string
  searchPlaceholder: string
  primaryActionLabel: string
  cards: CardConfig<T>
}) {
  return (
    <AdminPageFrame title={title} breadcrumb={breadcrumb} searchPlaceholder={searchPlaceholder} primaryActionLabel={primaryActionLabel}>
      <AdminContentCardGrid
        items={cards.items}
        actions={cards.actions}
        rowKey={cards.rowKey}
        getTitle={(item) => item.title}
        getDescription={(item) => item.description}
        getStatus={(item) => item.status as AdminStatus}
        getMeta={(item) => (
          <>
            {item.author && <p>By: {item.author}</p>}
            {item.updated && <p>{item.updated}</p>}
          </>
        )}
      />
    </AdminPageFrame>
  )
}

export function AdminPageFrame({
  title,
  breadcrumb,
  searchPlaceholder,
  primaryActionLabel,
  children,
}: {
  title: string
  breadcrumb: string
  searchPlaceholder?: string
  primaryActionLabel?: string
  children: React.ReactNode
}) {
  return (
    <div className="px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pt-0">
      <AdminHeader title={title} breadcrumb={breadcrumb} />
      {(searchPlaceholder || primaryActionLabel) && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="mt-7">{children}</div>
    </div>
  )
}
