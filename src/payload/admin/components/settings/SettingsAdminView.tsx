import type { AdminViewServerProps, VisibleEntities } from 'payload'
import type { StepNavItem } from '@payloadcms/ui'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { SetStepNav } from '@payloadcms/ui'

import SettingsForm, { type SettingsUser } from './SettingsForm'

export default async function SettingsAdminView(props: AdminViewServerProps) {
  const { locale, permissions, req } = props.initPageResult ?? {}
  // props.user is a lightweight token user that may not include email/avatar.
  // Re-fetch the full record so the form shows the real email, name and photo.
  const authedUser = (req?.user ?? props.user) as (SettingsUser & { id?: number | string }) | null | undefined
  let user: SettingsUser | null = (authedUser as SettingsUser) ?? null
  if (authedUser?.id != null) {
    try {
      user = (await props.payload.findByID({
        collection: 'users',
        id: authedUser.id,
        depth: 1,
        overrideAccess: true,
      })) as unknown as SettingsUser
    } catch {
      // keep the token user as a fallback
    }
  }
  const nav: StepNavItem[] = [
    { label: 'System' },
    { label: 'Settings' },
  ]

  const templateProps = {
    ...props,
    locale: props.locale ?? locale,
    permissions: props.permissions ?? permissions,
    req,
    user: props.user,
    visibleEntities: props.visibleEntities ?? getAllVisibleEntities(props),
  }

  return (
    <DefaultTemplate {...templateProps} className="settings-template">
      <SetStepNav nav={nav} />
      <main className="min-h-screen bg-[#fbfaf8] px-6 py-6 md:px-10 lg:px-12">
        <header className="mb-8">
          <h1 className="m-0 text-[22px] font-bold text-[#2b2823]">Settings</h1>
          <p className="mb-0 mt-1 text-sm text-[#716b60]">System &gt; Settings</p>
        </header>

        <SettingsForm user={user ?? null} />
      </main>
    </DefaultTemplate>
  )
}

function getAllVisibleEntities(props: AdminViewServerProps): VisibleEntities {
  const user = props.user
  return {
    collections: props.payload.config.collections
      .filter(({ admin }) => {
        if (typeof admin?.hidden === 'function') return user ? !admin.hidden({ user: user as Parameters<typeof admin.hidden>[0]['user'] }) : false
        return !admin?.hidden
      })
      .map(({ slug }) => slug),
    globals: props.payload.config.globals
      .filter(({ admin }) => {
        if (typeof admin?.hidden === 'function') return user ? !admin.hidden({ user: user as Parameters<typeof admin.hidden>[0]['user'] }) : false
        return !admin?.hidden
      })
      .map(({ slug }) => slug),
  }
}
