'use client'

import { Eye, Pencil, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'

import type { CombinedUser } from '@/lib/admin/users'
import UserDeleteButton from './UserDeleteButton'

type UsersListViewContentProps = {
  users: CombinedUser[]
  error?: string | null
}

export default function UsersListViewContent({ users, error }: UsersListViewContentProps) {
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [localUsers, setLocalUsers] = useState(users)

  const filtered = useMemo(() => {
    if (!search) return localUsers
    const q = search.toLowerCase()
    return localUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.contact.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q) ||
        u.source.toLowerCase().includes(q),
    )
  }, [localUsers, search])

  return (
    <>
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <label className="relative block w-full mt-2">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8c8982]" />
        <input
          className="w-full rounded-sm border-none pl-11 pr-4 text-md h-18 text-[#393733] outline-none transition placeholder:text-[#aaa6a0] bg-gray-100"
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
        <div className="orienda-list-table-wrap">
          <table className="orienda-list-table">
            <thead>
              <tr>
                <th style={{ padding: 0, margin: 0, textAlign: 'left' }}>Name</th>
                <th style={{ padding: 0, margin: 0, textAlign: 'left' }}>Email / Phone</th>
                <th style={{ padding: 0, margin: 0, textAlign: 'left' }}>Role</th>
                <th style={{ padding: 0, margin: 0, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 0, margin: 0, textAlign: 'left' }}>Source</th>
                <th style={{ padding: 0, margin: 0, textAlign: 'left' }}>Last Login</th>
                <th style={{ padding: 0, margin: 0, textAlign: 'left' }}>Date of Birth</th>
                <th style={{ padding: 0, margin: 0, textAlign: 'left' }}>Created</th>
                <th className="orienda-list-table__actions-heading" style={{ padding: 0, margin: 0, textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const isPayload = user.source === 'Payload'
                const isSupabase = user.source?.toLowerCase().includes('profiles')
                const opSlug = 'profiles'
                const viewHref = isPayload ? `/admin/collections/users/${user.id}` : (isSupabase ? `/admin/operations/${opSlug}/view/${user.id}` : null)
                const editHref = isPayload ? `/admin/collections/users/${user.id}` : (isSupabase ? `/admin/operations/${opSlug}/edit/${user.id}` : null)

                return (
                  <tr data-id={user.id} key={`${user.source}-${user.id}`}>
                    <td>{user.name}</td>
                    <td>{user.contact}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                    <td>{user.source}</td>
                    <td>{user.lastLogin}</td>
                    <td>{user.dateOfBirth}</td>
                    <td>{user.created}</td>
                    <td className="orienda-list-table__actions-cell">
                      <div className="orienda-list-table__actions">
                        {viewHref ? (
                          <>
                            <Link aria-label="View user" className="orienda-table-action orienda-table-action--view" href={viewHref}>
                              <Eye size={15} />
                            </Link>
                            {editHref && (
                              <Link aria-label="Edit user" className="orienda-table-action orienda-table-action--edit" href={editHref}>
                                <Pencil size={15} />
                              </Link>
                            )}
                            {user.role?.toLowerCase() !== 'admin' && <UserDeleteButton user={user} />}
                          </>
                        ) : (
                          <span className="text-sm text-[#8a8172]">Read only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
