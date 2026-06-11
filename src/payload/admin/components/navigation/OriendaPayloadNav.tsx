import type { PayloadRequest, ServerProps } from 'payload'
import { PREFERENCE_KEYS } from 'payload/shared'
import { EntityType, groupNavItems, type EntityToGroup, type NavGroupType } from '@payloadcms/ui/shared'
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

  // When visibleEntities is available (e.g. on dashboard/collection routes), filter by it.
  // When not available (e.g. custom admin views like /operations/*), show all non-hidden entities.
  // groupNavItems handles permission-based filtering internally.
  const collections =
    visibleEntities?.collections?.length
      ? payload.config.collections.filter(({ slug }) => visibleEntities.collections.includes(slug))
      : payload.config.collections.filter(({ admin }) => !admin?.hidden)

  const globals =
    visibleEntities?.globals?.length
      ? payload.config.globals.filter(({ slug }) => visibleEntities.globals.includes(slug))
      : payload.config.globals.filter(({ admin }) => !admin?.hidden)

  const groups: NavGroupType[] = permissions
    ? groupNavItems(
        [
          ...collections.map(
            (collection): EntityToGroup => ({
              type: EntityType.collection,
              entity: collection,
            }),
          ),
          ...globals.map(
            (global): EntityToGroup => ({
              type: EntityType.global,
              entity: global,
            }),
          ),
        ],
        permissions,
        i18n,
      )
    : []

  const navPreferences = await getNavPrefs(props.req)

  return <OriendaPayloadNavClient groups={groups} navPreferences={navPreferences} user={user} />
}
