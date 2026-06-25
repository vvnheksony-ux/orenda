import type { AdminViewServerProps } from 'payload'
import type { StepNavItem } from '@payloadcms/ui'

import { SetStepNav } from '@payloadcms/ui'
import { getPermissionAccess } from '@zealamic/payload-plugin-rbac'
import { getCombinedUsers } from '@/lib/admin/users'
import UsersHeader from './UsersHeader'
import UsersListViewContent from './UsersListViewContent'

export const dynamic = 'force-dynamic'

export default async function UsersListView(props: AdminViewServerProps) {
  const user = props.user as Record<string, unknown> | null | undefined
  const isSuperAdmin = user && typeof user === 'object' && 'isSuperAdmin' in user && user.isSuperAdmin === true

  let hasAccess = isSuperAdmin
  if (!hasAccess && user && props.payload) {
    const check = getPermissionAccess({ featureCode: 'users', actionCode: 'read', mode: 'none' })
    const result = await check({ req: { user, payload: props.payload } } as any)
    hasAccess = result === true
  }

  const nav: StepNavItem[] = [
    { label: 'Access Control' },
    { label: 'Users' },
  ]

  if (!hasAccess) {
    return (
      <>
        <SetStepNav nav={nav} />
        <main className="mx-auto flex w-full flex-col gap-6 px-18">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            You do not have permission to view users.
          </div>
        </main>
      </>
    )
  }

  const { users, error } = await getCombinedUsers(props.payload)

  return (
    <>
      <SetStepNav nav={nav} />
      <main className="mx-auto flex w-full flex-col gap-6 px-18">
        <UsersHeader />
        <UsersListViewContent error={error} users={users} />
      </main>
    </>
  )
}
