import type { AdminViewServerProps } from 'payload'

import { getCombinedUsers } from '@/lib/admin/users'
import UsersListViewContent from './UsersListViewContent'

export const dynamic = 'force-dynamic'

export default async function UsersListView(props: AdminViewServerProps) {
  const { users, error } = await getCombinedUsers(props.payload)

  return (
    <main className="mx-auto flex w-full flex-col gap-6 px-18">
      <header className="flex flex-col gap-2">
        <h1 className="m-0 text-[20px] font-bold text-[#2b2823]">Users</h1>
      </header>

      <UsersListViewContent error={error} users={users} />
    </main>
  )
}
