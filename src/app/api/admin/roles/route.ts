import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authError = await requirePayloadAdmin(req)
  if (authError) return authError

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'roles',
    limit: 100,
    sort: 'code',
  })

  return NextResponse.json({
    roles: result.docs.map((role) => ({
      id: role.id,
      code: role.code,
      name: role.name,
    })),
  })
}

async function requirePayloadAdmin(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const isSuperAdmin = user && typeof user === 'object' && 'isSuperAdmin' in user ? user.isSuperAdmin : false
  const role = user && typeof user === 'object' && 'role' in user ? user.role : null

  if (!isSuperAdmin && role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
