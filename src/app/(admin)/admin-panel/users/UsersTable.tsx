'use client'

import { Search } from 'lucide-react'
import AdminDataTable from '@/payload/admin/components/dashboard/AdminDataTable'
import { useMemo, useState } from 'react'
import type { CombinedUser } from '@/lib/admin/users'
import Link from 'next/link'

type UsersTableProps = {
  users: CombinedUser[]
  error?: string | null
}

export default function UsersTable({ users, error }: UsersTableProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.contact.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q),
    )
  }, [users, search])

  const columns: {
    key: keyof CombinedUser | string
    label: string
    kind?: 'status'
    render?: (user: CombinedUser) => React.ReactNode
  }[] = [
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Email / Phone' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status', kind: 'status' },
    { key: 'source', label: 'Source' },
    { key: 'lastLogin', label: 'Last Login' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'created', label: 'Created' },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: CombinedUser) =>
        user.href ? (
          <Link className="text-sm font-semibold text-[#b38531] transition hover:text-[#8a6321]" href={user.href}>
            Edit
          </Link>
        ) : (
          <span className="text-sm text-[#8a8172]">Read only</span>
        ),
    },
  ]

  return (
    <>
      {error && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <label className="relative mb-5 block w-full sm:max-w-116">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8c8982]" />
        <input
          className="h-11 w-full rounded-xl border border-[#dedbd4] bg-white pl-11 pr-4 text-sm text-[#393733] shadow-sm outline-none transition placeholder:text-[#aaa6a0] focus:border-[#c29a4a] focus:ring-3 focus:ring-[#c29a4a]/15"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          type="search"
          value={search}
        />
      </label>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#eee8dd] bg-white px-4 py-6 text-sm text-[#716b60]">
          {search ? `No users match "${search}".` : 'No users found.'}
        </div>
      ) : (
        <AdminDataTable
          rows={filtered}
          rowKey={(user: CombinedUser) => `${user.source}-${user.id}`}
          columns={columns}
        />
      )}
    </>
  )
}
