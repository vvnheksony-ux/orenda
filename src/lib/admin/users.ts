import { createServiceClient } from '@/utils/supabase/server'
import type { Payload } from 'payload'

type PayloadUserDoc = {
  id: number | string
  name?: string | null
  email?: string | null
  role?: string | null
  lastLoginAt?: string | null
  createdAt?: string | null
}

type PublicUserRecord = {
  id?: string | number | null
  name?: string | null
  full_name?: string | null
  display_name?: string | null
  email?: string | null
  email_user?: string | null
  phone?: string | null
  role?: string | null
  user_type?: string | null
  status?: string | null
  date_of_birth?: string | null
  last_sign_in_at?: string | null
  last_login_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  [key: string]: unknown
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
  const [payloadResult, publicResult] = await Promise.all([
    getPayloadUsers(payload),
    getPublicUsers(),
  ])

  return {
    users: [...payloadResult.users, ...publicResult.users].sort(sortByCreatedDesc),
    error: [payloadResult.error, publicResult.error].filter(Boolean).join(' '),
  }
}

async function getPayloadUsers(payload: Payload) {
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

async function getPublicUsers() {
  const supabase = await createServiceClient()
  const publicUsers = await supabase.schema('public').from('users').select('*').limit(200)
  const publicProfiles = await getPublicProfileRows(supabase)
  const users = [
    ...(!publicUsers.error
      ? ((publicUsers.data || []) as PublicUserRecord[]).map((user) => toPublicUser(user, 'public.users'))
      : []),
    ...publicProfiles.users,
  ]

  if (users.length || publicProfiles.loaded) {
    return { users, error: publicProfiles.error }
  }

  const authResult = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (authResult.error) {
    return {
      users: [],
      error: `Failed to load public profiles: ${publicProfiles.error}; Supabase Auth fallback also failed: ${authResult.error.message}`,
    }
  }

  return {
    users: authResult.data.users.map((user) => toPublicUser({
      id: user.id,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      name: getAuthUserName(user.user_metadata),
      role: user.role,
    }, 'supabase.auth')),
    error: `public.profiles could not be loaded (${publicProfiles.error}); showing Supabase Auth users instead.`,
  }
}

async function getPublicProfileRows(supabase: Awaited<ReturnType<typeof createServiceClient>>) {
  const profiles = await supabase.schema('public').from('profiles').select('*').limit(200)

  if (!profiles.error) {
    return {
      users: ((profiles.data || []) as PublicUserRecord[]).map((user) => toPublicUser(user, 'public.profiles')),
      error: null,
      loaded: true,
    }
  }

  const profile = await supabase.schema('public').from('profile').select('*').limit(200)

  if (!profile.error) {
    return {
      users: ((profile.data || []) as PublicUserRecord[]).map((user) => toPublicUser(user, 'public.profile')),
      error: null,
      loaded: true,
    }
  }

  return {
    users: [],
    error: `${profiles.error.message}; ${profile.error.message}`,
    loaded: false,
  }
}

function toPublicUser(user: PublicUserRecord, fallbackName: string): CombinedUser {
  const contact = user.email || user.email_user || user.phone || '-'
  const id = user.id == null ? `${fallbackName}-${contact}` : String(user.id)

  return {
    id,
    name: user.name || user.full_name || user.display_name || fallbackName,
    contact,
    role: user.role || user.user_type || 'Customer',
    status: user.status || 'active',
    source: fallbackName,
    lastLogin: formatDate(user.last_login_at || user.last_sign_in_at),
    dateOfBirth: formatDate(user.date_of_birth),
    created: formatDate(user.created_at),
    href: '',
  }
}

function getAuthUserName(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') return null
  const values = metadata as Record<string, unknown>
  const name = values.name || values.full_name || values.display_name
  return typeof name === 'string' ? name : null
}

function sortByCreatedDesc(a: CombinedUser, b: CombinedUser) {
  return getTimestamp(b.created) - getTimestamp(a.created)
}

function getTimestamp(value: string) {
  if (value === '-') return 0
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
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
