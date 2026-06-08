import type { PayloadRequest, ServerProps } from 'payload'
import { PREFERENCE_KEYS } from 'payload/shared'
import { EntityType, groupNavItems, type NavGroupType } from '@payloadcms/ui/shared'
import { cache } from 'react'

import OriendaPayloadNavClient from './OriendaPayloadNavClient'

type OriendaPayloadNavProps = {
  req?: PayloadRequest
} & ServerProps

type NavPreferences = {
  groups?: Record<string, { open?: boolean }>
}

const getNavPrefs = cache(async (req?: PayloadRequest): Promise<NavPreferences | null> => {
  if (!req?.user?.collection) return null

  const result = await req.payload.find({
    collection: 'payload-preferences',
    depth: 0,
    limit: 1,
    pagination: false,
    req,
    where: {
      and: [
        { key: { equals: PREFERENCE_KEYS.NAV } },
        { 'user.relationTo': { equals: req.user.collection } },
        { 'user.value': { equals: req.user.id } },
      ],
    },
  })

  return (result.docs[0]?.value as NavPreferences | undefined) ?? null
})

export default async function OriendaPayloadNav(props: OriendaPayloadNavProps) {
  const { i18n, payload, permissions, user, visibleEntities } = props

  if (!payload?.config) return null

  const collections = payload.config.collections.filter(({ slug }) =>
    visibleEntities?.collections?.includes(slug)
  )

  const groups: NavGroupType[] =
    permissions && visibleEntities
      ? groupNavItems(
          collections.map((collection) => ({
            type: EntityType.collection,
            entity: collection,
          })),
          permissions,
          i18n
        )
      : []

  const navPreferences = await getNavPrefs(props.req)

  return <OriendaPayloadNavClient groups={groups} navPreferences={navPreferences} user={user} />
}
