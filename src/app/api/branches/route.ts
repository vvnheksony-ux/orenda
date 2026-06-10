import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'

  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'branches',
      locale, fallbackLocale: 'en',
      overrideAccess: true,
      depth: 1,
      sort: 'order',
      limit: 20,
    } as any)

    const docs = (data.docs || []).map((doc: any) => ({
      id:      String(doc.id),
      name:    doc.name ?? '',
      slug:    doc.slug ?? '',
      address: doc.address ?? '',
      phone:   doc.phone ?? '',
      email:   doc.email ?? '',
      mapUrl:  doc.mapUrl ?? '',
      hours:   doc.hours ?? '',
      image:   mediaUrl(doc.image),
      order:   doc.order ?? 0,
    }))

    return NextResponse.json({ docs }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  } catch (err: any) {
    console.error('branches:', err.message)
    return NextResponse.json({ docs: [] })
  }
}
