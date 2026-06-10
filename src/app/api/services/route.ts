import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const deptId = searchParams.get('department') || null

  try {
    const payload = await getPayloadClient()
    const where: any = {}
    if (deptId) where['department'] = { equals: Number(deptId) }

    const data = await payload.find({
      collection: 'services',
      locale, fallbackLocale: 'en',
      overrideAccess: true,
      depth: 1,
      sort: 'title',
      limit: 100,
      where,
    } as any)

    const docs = (data.docs || []).map((doc: any) => ({
      id:    String(doc.id),
      title: doc.title ?? '',
      slug:  doc.slug ?? '',
      icon:  mediaUrl(doc.icon),
      department: typeof doc.department === 'object' && doc.department
        ? { id: String(doc.department.id), name: doc.department.name ?? '' }
        : null,
    }))

    return NextResponse.json({ docs })
  } catch (err: any) {
    console.error('services:', err.message)
    return NextResponse.json({ docs: [] })
  }
}
