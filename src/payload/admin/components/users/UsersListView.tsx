import type { AdminViewServerProps } from 'payload'

import Link from 'next/link'
import { Eye, Pencil } from 'lucide-react'

import { getCombinedUsers } from '@/lib/admin/users'
import UserDeleteButton from './UserDeleteButton'

export const dynamic = 'force-dynamic'

export default async function UsersListView(props: AdminViewServerProps) {
  const { users, error } = await getCombinedUsers(props.payload)

  return (
    <main className="mx-auto flex w-full flex-col gap-6 px-20 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="m-0 text-3xl font-bold text-[#2b2823]">Users</h1>
      </header>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="orienda-list-table-wrap">
        <table className="orienda-list-table">
          <thead>
            <tr>
              <th style={{ padding: 0, margin: 0, textAlign: 'left'}}>Name</th>
              <th style={{ padding: 0, margin: 0, textAlign: 'left'}}>Email / Phone</th>
              <th style={{ padding: 0, margin: 0, textAlign: 'left'}}>Role</th>
              <th style={{ padding: 0, margin: 0, textAlign: 'left'}}>Status</th>
              <th style={{ padding: 0, margin: 0, textAlign: 'left'}}>Source</th>
              <th style={{ padding: 0, margin: 0, textAlign: 'left'}}>Last Login</th>
              <th style={{ padding: 0, margin: 0, textAlign: 'left'}}>Date of Birth</th>
              <th style={{ padding: 0, margin: 0, textAlign: 'left'}}>Created</th>
              <th className="orienda-list-table__actions-heading" style={{ padding: 0, margin: 0, textAlign: 'left'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isPayload = user.source === 'Payload'
              // More robust check for Supabase profiles
              const isSupabase = user.source?.toLowerCase().includes('profiles')
              
              // The slug used in your operations config
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

      {!users.length && <div className="orienda-list-empty">No users found.</div>}
    </main>
  )
}
