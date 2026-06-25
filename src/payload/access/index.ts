import type { Access, AccessArgs } from 'payload'
import { createRBACAccess, hasAnyMatrixPermission } from './rbacAccess'

/**
 * @deprecated Use createRBACAccess(slug, 'read') or publishedOnlyFor(slug) directly.
 * Tries to infer collection/global slug from req, which doesn't work in Payload access functions.
 */
export const isAdmin: Access = async ({ req }: AccessArgs) => {
  const user = req.user as Record<string, unknown> | null
  if (!user) return false
  if (user.isSuperAdmin === true) return true
  return false
}

/**
 * @deprecated Use createRBACAccess(slug, 'create') directly.
 */
export const isAdminOrEditor: Access = async (args: AccessArgs) => {
  const user = args.req.user as Record<string, unknown> | null
  if (!user) return false
  if (user.isSuperAdmin === true) return true
  return false
}

/**
 * @deprecated Use createRBACAccess(slug, 'read') directly.
 */
export const isAdminOrEditorRead: Access = async (args: AccessArgs) => {
  const user = args.req.user as Record<string, unknown> | null
  if (!user) return false
  if (user.isSuperAdmin === true) return true
  return false
}

export const isLoggedIn: Access = ({ req }: AccessArgs) => {
  return !!req.user
}

export const publicRead: Access = () => true

export { publishedOnly, publishedOnlyFor } from './contentAccess'
export { createRBACAccess, hasAnyMatrixPermission } from './rbacAccess'
