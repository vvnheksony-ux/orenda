import type { Access, AccessArgs } from 'payload'

export const isAdmin: Access = ({ req }: AccessArgs) => {
  const user = req.user as Record<string, unknown> | null
  if (!user) return false
  return user.role === 'admin'
}

export const isAdminOrEditor: Access = ({ req }: AccessArgs) => {
  const user = req.user as Record<string, unknown> | null
  if (!user) return false
  return user.role === 'admin' || user.role === 'editor'
}

export const isLoggedIn: Access = ({ req }: AccessArgs) => {
  return !!req.user
}

export const publicRead: Access = () => true

export { publishedOnly } from './contentAccess'
