import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

type PayloadUploadFile = {
  data: Buffer
  mimetype: string
  name: string
  size: number
}

export async function PATCH(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const role = user && typeof user === 'object' && 'role' in user ? user.role : null

  if (!user || typeof user !== 'object' || role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Invalid settings payload.' }, { status: 400 })

  const id = 'id' in user ? user.id : null
  const currentEmail = 'email' in user && typeof user.email === 'string' ? user.email : ''
  const avatar = formData.get('avatar')
  const name = getString(formData.get('name'))
  const email = getString(formData.get('email'))
  const oldPassword = getString(formData.get('oldPassword'))
  const newPassword = getString(formData.get('newPassword'))
  const confirmPassword = getString(formData.get('confirmPassword'))
  const resetPassword = formData.get('resetPassword') === 'true'

  if (!id) return NextResponse.json({ error: 'Authenticated user is missing an id.' }, { status: 400 })
  if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 })

  const updateData: { avatar?: number; email: string; name: string; password?: string } = { email, name }

  if (newPassword || confirmPassword || oldPassword) {
    if (newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
    if (newPassword !== confirmPassword) return NextResponse.json({ error: 'New password and confirmation do not match.' }, { status: 400 })

    if (!resetPassword) {
      if (!oldPassword) return NextResponse.json({ error: 'Old password is required.' }, { status: 400 })

      try {
        await payload.login({
          collection: 'users',
          data: { email: currentEmail, password: oldPassword },
          overrideAccess: true,
        })
      } catch {
        return NextResponse.json({ error: 'Old password is incorrect.' }, { status: 400 })
      }
    }

    updateData.password = newPassword
  }

  if (avatar instanceof File && avatar.size > 0) {
    if (!avatar.type.startsWith('image/')) return NextResponse.json({ error: 'Avatar must be an image.' }, { status: 400 })

    const media = await payload.create({
      collection: 'media',
      data: { alt: `${name} profile photo` },
      file: await toPayloadFile(avatar),
      overrideAccess: true,
    })

    updateData.avatar = Number(media.id)
  }

  const updated = await payload.update({
    collection: 'users',
    id,
    data: updateData,
    overrideAccess: true,
  })

  return NextResponse.json({
    user: {
      email: updated.email,
      id: updated.id,
      name: updated.name,
      role: (updated as any).role ?? null,
      avatar: updated.avatar,
    },
  })
}

async function toPayloadFile(file: File): Promise<PayloadUploadFile> {
  return {
    data: Buffer.from(await file.arrayBuffer()),
    mimetype: file.type || 'application/octet-stream',
    name: file.name,
    size: file.size,
  }
}

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}
