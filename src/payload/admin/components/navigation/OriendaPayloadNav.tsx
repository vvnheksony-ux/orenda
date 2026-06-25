import type { Payload, PayloadRequest, ServerProps, TypedUser } from 'payload'
import { PREFERENCE_KEYS } from 'payload/shared'
import { EntityType, groupNavItems, type EntityToGroup, type NavGroupType } from '@payloadcms/ui/shared'
import { cache } from 'react'
import { getPermissionAccess } from '@zealamic/payload-plugin-rbac'
import { collectionFeatureMap, operationsTableFeatureMap } from '@/payload/access/featureMap'

import OriendaPayloadNavClient from './OriendaPayloadNavClient'

type OriendaPayloadNavProps = {
  req?: PayloadRequest
} & ServerProps

type NavPreferences = {
  groups?: Record<string, { open?: boolean }>
}

type OperationLink = {
  label: string
  path: string
  table: string
}

const allOperationLinks: readonly OperationLink[] = [
  { label: 'Appointments', path: '/operations/appointments', table: 'appointments' },
  { label: 'Inquiries', path: '/operations/inquiries', table: 'inquiries' },
  { label: 'Promotion Purchases', path: '/operations/purchases', table: 'purchases' },
  { label: 'Feedback', path: '/operations/feedback', table: 'feedback' },
]

const accessControlLinkEntries: readonly OperationLink[] = [
  { label: 'Patients', path: '/operations/patients', table: 'patients' },
]

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

function buildRbacReq(
  propsUser: TypedUser | undefined,
  payload: Payload | undefined,
): PayloadRequest | undefined {
  if (!propsUser || !payload) return undefined
  return { user: propsUser, payload } as PayloadRequest
}

function createPermissionChecker(rbacReq: PayloadRequest | undefined, user: TypedUser | undefined) {
  const userRec = user as unknown as Record<string, unknown> | null
  const isSuperAdmin = userRec?.isSuperAdmin === true
  const cache = new Map<string, boolean>()

  return async (featureCode: string, actionCode: string = 'read'): Promise<boolean> => {
    if (!user) return false
    if (isSuperAdmin) return true
    if (!rbacReq) return false
    const key = `${featureCode}:${actionCode}`
    if (cache.has(key)) return cache.get(key)!
    const check = getPermissionAccess({ featureCode, actionCode, mode: 'none' })
    const result = await check({ req: rbacReq } as { req: PayloadRequest })
    const allowed = result === true
    cache.set(key, allowed)
    return allowed
  }
}

export default async function OriendaPayloadNav(props: OriendaPayloadNavProps) {
  const { i18n, payload, permissions, user, visibleEntities } = props

  if (!payload?.config) return null

  const userRec = user as unknown as Record<string, unknown> | null
  const isSuperAdmin = userRec?.isSuperAdmin === true

  // Build a safe request object for RBAC checks. Payload may render Nav without
  // providing `req` (e.g. on some admin views), so we fall back to constructing
  // a minimal request from the user and payload we do have.
  const rbacReq = props.req ?? buildRbacReq(user, payload)

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

  // Safety-net: filter collections by RBAC matrix read permission
  // even if Payload permissions object is stale or incomplete.
  const checkPermission = createPermissionChecker(rbacReq, user)
  const collectionEntities = groups.flatMap((g) => g.entities.filter((e) => e.type === EntityType.collection))
  const featureCodesToCheck = [...new Set(
    collectionEntities.map((e) => collectionFeatureMap[e.slug]).filter((fc): fc is string => !!fc),
  )]
  const permissionResults = await Promise.all(
    featureCodesToCheck.map(async (fc) => ({
      feature: fc,
      allowed: isSuperAdmin || (await checkPermission(fc, 'read')),
    })),
  )
  const allowedFeatures = new Set(permissionResults.filter((r) => r.allowed).map((r) => r.feature))

  const filteredGroups = groups.map((group) => ({
    ...group,
    entities: group.entities.filter((entity) => {
      if (entity.type !== EntityType.collection) return true
      const featureCode = collectionFeatureMap[entity.slug]
      if (!featureCode) return true
      return allowedFeatures.has(featureCode)
    }),
  }))

  const operationAccessEntries = await Promise.all(
    [...allOperationLinks, ...accessControlLinkEntries].map(async (link) => ({
      link,
      allowed: isSuperAdmin || (await checkPermission(operationsTableFeatureMap[link.table] || link.table)),
    })),
  )

  const filteredOperationLinks = operationAccessEntries.filter(({ link, allowed }) => allowed && allOperationLinks.includes(link)).map(({ link }) => link)
  const filteredAccessControlLinks = operationAccessEntries.filter(({ link, allowed }) => allowed && accessControlLinkEntries.includes(link)).map(({ link }) => link)

  const navPreferences = await getNavPrefs(props.req)

  return (
    <OriendaPayloadNavClient
      groups={filteredGroups}
      navPreferences={navPreferences}
      user={user}
      operationLinks={filteredOperationLinks}
      accessControlLinks={filteredAccessControlLinks}
    />
  )
}
