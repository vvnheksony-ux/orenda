import { AdminPageFrame } from '@/components/admin/AdminManagementPage'
import { getCombinedUsers } from '@/lib/admin/users'
import config from '@payload-config'
import { getPayload } from 'payload'

import UsersTable from './UsersTable'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const payload = await getPayload({ config })
  const { users, error } = await getCombinedUsers(payload)

  return (
    <AdminPageFrame
      title="Users"
      breadcrumb="Access Control > Users"
      primaryActionLabel="Add User"
    >
      <UsersTable users={users} error={error} />
    </AdminPageFrame>
  )
}
