import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const deptId = searchParams.get('department') || null

  try {
    const payload = await getPayloadClient()
    const where: any = {}
    if (deptId) where['department'] = { equals: Number(deptId) }

    const { docs } = await payload.find({
      collection: 'service-packages',
      overrideAccess: true,
      locale, fallbackLocale: 'en',
      depth: 2,
      sort: 'order',
      limit: 50,
      where,
    } as any)

    const packages = docs.map((doc: any) => ({
      id:         String(doc.id),
      title:      doc.title ?? '',
      slug:       doc.slug ?? '',
      priceLabel: doc.priceLabel ?? '',
      image:      typeof doc.image === 'object' ? doc.image?.url ?? null : null,
      department: typeof doc.department === 'object' && doc.department
        ? { id: String(doc.department.id), name: doc.department.name ?? '' }
        : null,
      services: (doc.services ?? []).map((s: any) => typeof s === 'object' ? { id: String(s.id), title: s.title ?? '' } : s),
      order: doc.order ?? 0,
    }))

    return NextResponse.json({ docs: packages })
  } catch (err: any) {
    console.error('service-packages:', err.message)
    return NextResponse.json({ docs: [] })
  }
}
