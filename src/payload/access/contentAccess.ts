import type { Access, AccessArgs, Where } from 'payload'
import { getPermissionAccess } from '@zealamic/payload-plugin-rbac'
import { CONTENT_STATUS } from '../constants'
import { createRBACAccess } from './rbacAccess'

function publishedOnlyWhere(now: string): Where {
  return {
    and: [
      { status: { equals: CONTENT_STATUS.PUBLISHED } },
      {
        or: [
          { publishedAt: { exists: false } },
          { publishedAt: { less_than_equal: now } },
        ],
      },
    ],
  } as Where
}

const viewDraftsAccess = getPermissionAccess({
  featureCode: 'content',
  actionCode: 'viewDrafts',
  mode: 'none',
})

/**
 * Collection-aware read access with RBAC.
 * - Unauthenticated: published-only Where filter
 * - Super admin: full access
 * - Authenticated + has featureCode:read: full access (or published-only if no viewDrafts)
 * - Authenticated + no featureCode:read: false (hidden from admin nav)
 */
export function publishedOnlyFor(featureCode: string): Access {
  return async ({ req }: AccessArgs) => {
    const user = req.user as Record<string, unknown> | null
    if (!user) return publishedOnlyWhere(new Date().toISOString())
    if (user.isSuperAdmin === true) return true
    const rbacCheck = createRBACAccess(featureCode, 'read')
    const allowed = await rbacCheck({ req } as AccessArgs)
    if (!allowed) return false
    const hasPermission = await viewDraftsAccess({ req } as { req: typeof req })
    if (hasPermission === true) return true
    return publishedOnlyWhere(new Date().toISOString())
  }
}

/**
 * @deprecated Use publishedOnlyFor(featureCode) instead.
 */
export const publishedOnly: Access = publishedOnlyFor('content')
