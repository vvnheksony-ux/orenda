import type { AdminViewServerProps } from 'payload'

import Link from 'next/link'

import { getCombinedUsers } from '@/lib/admin/users'

export const dynamic = 'force-dynamic'

export default async function UsersListView(props: AdminViewServerProps) {
  const { users, error } = await getCombinedUsers(props.payload)

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-8 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="m-0 text-3xl font-bold text-[#2b2823]">Users</h1>
        <p className="m-0 text-sm text-[#716b60]">
          Payload admin users and public profile users in one place.
        </p>
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
              <th>Name</th>
              <th>Email / Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Source</th>
              <th>Last Login</th>
              <th>Date of Birth</th>
              <th>Created</th>
              <th className="orienda-list-table__actions-heading">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
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
                  {user.href ? (
                    <Link className="orienda-table-action orienda-table-action--edit" href={user.href}>
                      Edit
                    </Link>
                  ) : (
                    <span className="text-sm text-[#8a8172]">Read only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!users.length && <div className="orienda-list-empty">No users found.</div>}
    </main>
  )
}
