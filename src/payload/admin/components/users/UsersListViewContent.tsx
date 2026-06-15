'use client'

import { Eye, Pencil, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import type { CombinedUser } from '@/lib/admin/users'
import UserDeleteButton from './UserDeleteButton'

type UsersListViewContentProps = {
  users: CombinedUser[]
  error?: string | null
}

export default function UsersListViewContent({ users, error }: UsersListViewContentProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.contact.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q) ||
        u.source.toLowerCase().includes(q),
    )
  }, [users, search])

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
                const viewHref = `/admin/collections/users/${user.id}`

                return (
                  <tr
                    className="cursor-pointer"
                    data-id={user.id}
                    key={`${user.source}-${user.id}`}
                    onClick={() => router.push(viewHref)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        router.push(viewHref)
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    <td>{user.name}</td>
                    <td>{user.contact}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                    <td>{user.source}</td>
                    <td>{user.lastLogin}</td>
                    <td>{user.dateOfBirth}</td>
                    <td>{user.created}</td>
                    <td className="orienda-list-table__actions-cell">
                      <div className="orienda-list-table__actions" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                        <Link aria-label="View user" className="orienda-table-action orienda-table-action--view" href={viewHref}>
                          <Eye size={15} />
                        </Link>
                        <Link aria-label="Edit user" className="orienda-table-action orienda-table-action--edit" href={viewHref}>
                          <Pencil size={15} />
                        </Link>
                        {user.role?.toLowerCase() !== 'admin' && <UserDeleteButton user={user} />}
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
