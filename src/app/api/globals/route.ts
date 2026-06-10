import { NextResponse } from 'next/server'
import { payloadFetch } from '@/lib/payload-api'

export const runtime = 'nodejs'

const ALLOWED = ['siteSettings', 'operationalSettings', 'navigation', 'socialLinks']

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type   = searchParams.get('type') || 'siteSettings'
  const locale = searchParams.get('locale') || 'en'

  if (!ALLOWED.includes(type)) {
    return NextResponse.json({ error: 'Unknown global' }, { status: 400 })
  }

  try {
    const data = await payloadFetch(`/payload-api/globals/${type}?locale=${locale}&depth=1`)
    return NextResponse.json(data)
  } catch (err) {
    console.error('globals:', err)
    return NextResponse.json({})
  }
}
