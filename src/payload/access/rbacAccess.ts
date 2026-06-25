import type { AccessArgs, PayloadRequest } from 'payload'
import { getPermissionAccess } from '@zealamic/payload-plugin-rbac'

/**
 * Create an RBAC-based Access function for a specific feature + action.
 * Super admins bypass. Non-super-admins are checked against the permission matrix.
 * Returns boolean (not Where), safe for collection-level access fields.
 */
export function createRBACAccess(featureCode: string, actionCode: string) {
  const checkPermission = getPermissionAccess({ featureCode, actionCode, mode: 'none' })

  return async ({ req }: AccessArgs) => {
    const user = req.user as Record<string, unknown> | null
    if (!user) return false
    if (user.isSuperAdmin === true) return true
    const result = await checkPermission({ req } as { req: typeof req })
    return result === true
  }
}

/**
 * Check if the current user has any enabled permission in the RBAC matrix.
 * Used for the admin entry gate — deny users with zero permissions.
 * Super admins always pass. Authenticated users with at least one role pass.
 */
export async function hasAnyMatrixPermission(req: PayloadRequest): Promise<boolean> {
  const user = req.user as Record<string, unknown> | null
  if (!user) return false
  if (user.isSuperAdmin === true) return true
  const roles = user.roles
  if (!Array.isArray(roles) || roles.length === 0) return false
  return true
}
