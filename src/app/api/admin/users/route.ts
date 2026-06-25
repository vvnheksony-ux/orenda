import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import { createRBACAccess } from '@/payload/access/rbacAccess'

export async function POST(req: NextRequest) {
  const authError = await requireRBACPermission(req)
  if (authError) return authError

  const body = (await req.json().catch(() => null)) as {
    email?: string
    password?: string
    name?: string
    roleId?: number
  } | null

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  if (body.password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  const newUser = await payload.create({
    collection: 'users',
    data: {
      email: body.email,
      password: body.password,
      name: body.name || '',
    },
  })

  if (body.roleId) {
    await payload.update({
      collection: 'users',
      id: newUser.id,
      data: {
        roles: [body.roleId],
      },
    })
  }

  return NextResponse.json({ id: newUser.id }, { status: 201 })
}

async function requireRBACPermission(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })

  if (!user || typeof user !== 'object' || !('id' in user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Super admin bypass
  if (user.isSuperAdmin === true) return null

  // RBAC check: users:create permission
  const rbacCheck = createRBACAccess('users', 'create')
  const hasPermission = await rbacCheck({ req: { user, payload, headers: req.headers } } as any)

  if (hasPermission === true) return null

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
