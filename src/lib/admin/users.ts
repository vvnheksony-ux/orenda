import type { Payload } from 'payload'

type PayloadUserDoc = {
  id: number | string
  name?: string | null
  email?: string | null
  role?: string | null
  lastLoginAt?: string | null
  createdAt?: string | null
}

export type CombinedUser = {
  id: string
  name: string
  contact: string
  role: string
  status: string
  source: string
  lastLogin: string
  dateOfBirth: string
  created: string
  href: string
}

export async function getCombinedUsers(payload: Payload) {
  return getPayloadUsers(payload)
}

export async function getPayloadUsers(payload: Payload) {
  try {
    const result = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 200,
      sort: '-createdAt',
    })

    return {
      users: (result.docs as PayloadUserDoc[]).map((user) => ({
        id: String(user.id),
        name: user.name || 'Payload user',
        contact: user.email || '-',
        role: user.role || '-',
        status: 'active',
        source: 'Payload',
        lastLogin: formatDate(user.lastLoginAt),
        dateOfBirth: '-',
        created: formatDate(user.createdAt),
        href: `/admin/collections/users/${user.id}`,
      })),
      error: null,
    }
  } catch (error) {
    return { users: [], error: `Failed to load Payload users: ${getErrorMessage(error)}` }
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-US', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}
