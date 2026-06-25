import type { PayloadRequest } from 'payload'
import { getPermissionAccess } from '@zealamic/payload-plugin-rbac'

/**
 * Server-side page access guard.
 * Returns true if the user has RBAC permission for the given feature, or is super admin.
 */
export async function checkPageAccess(
  req: PayloadRequest,
  featureCode: string,
  actionCode: string = 'read',
): Promise<boolean> {
  const user = req.user as Record<string, unknown> | null
  if (!user) return false
  if (user.isSuperAdmin === true) return true

  const checkPermission = getPermissionAccess({ featureCode, actionCode, mode: 'none' })
  const result = await checkPermission({ req } as { req: typeof req })
  return result === true
}

/**
 * Check if user has admin or super-admin role (legacy gate for admin-only tables).
 */
export function isAdminOrSuperAdmin(user: Record<string, unknown> | null | undefined): boolean {
  if (!user) return false
  if (user.isSuperAdmin === true) return true
  return user.role === 'admin'
}
