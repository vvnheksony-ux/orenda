import type { PayloadRequest } from 'payload'
import { NextResponse } from 'next/server'
import { operationsTableFeatureMap } from '@/payload/access/featureMap'
import { getPermissionAccess } from '@zealamic/payload-plugin-rbac'

/**
 * Check if the authenticated user has permission for the given operations table + action.
 * Returns null on success, NextResponse on failure.
 */
export async function requireTablePermission(
  req: PayloadRequest,
  table: string,
  actionCode: string,
): Promise<NextResponse | null> {
  const featureCode = operationsTableFeatureMap[table]

  if (!featureCode) {
    return NextResponse.json({ error: 'Unknown operations table.' }, { status: 404 })
  }

  const user = req.user as Record<string, unknown> | null
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  // Super admin bypasses all checks
  if (user.isSuperAdmin === true) return null

  // Admin-only tables: check legacy admin role
  if (featureCode === 'admin') {
    if (user.role === 'admin') return null
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  // RBAC permission check
  const checkPermission = getPermissionAccess({ featureCode, actionCode, mode: 'none' })
  const hasPermission = await checkPermission({ req } as { req: typeof req })

  if (hasPermission === true) return null

  return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
}
