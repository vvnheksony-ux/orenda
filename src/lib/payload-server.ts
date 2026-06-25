import { getPayload } from 'payload'
import { headers } from 'next/headers'
import config from '@payload-config'

/**
 * Get Payload with the current request's auth context.
 * Use in server components where RBAC access control needs the authenticated user.
 */
export async function getRequestPayload() {
  const hdrs = await headers()
  const payload = await getPayload({ config })
  return { payload, headers: hdrs }
}
