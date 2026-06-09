import AdminDataTable from '@/payload/admin/components/dashboard/AdminDataTable'
import { AdminPageFrame } from '@/components/admin/AdminManagementPage'
import { getCombinedUsers } from '@/lib/admin/users'
import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const payload = await getPayload({ config })
  const { users, error } = await getCombinedUsers(payload)

  return (
    <AdminPageFrame
      title="Users"
      breadcrumb="Access Control > Users"
      searchPlaceholder="Search users..."
      primaryActionLabel="Add User"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}
      <AdminDataTable
        rows={users}
        rowKey={(user) => `${user.source}-${user.id}`}
        columns={[
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
            render: (user) => user.href ? (
              <Link className="text-sm font-semibold text-[#b38531] transition hover:text-[#8a6321]" href={user.href}>
                Edit
              </Link>
            ) : (
              <span className="text-sm text-[#8a8172]">Read only</span>
            ),
          },
        ]}
      />
      {!users.length && <div className="mt-5 rounded-xl border border-[#eee8dd] bg-white px-4 py-6 text-sm text-[#716b60]">No users found.</div>}
    </AdminPageFrame>
  )
}
