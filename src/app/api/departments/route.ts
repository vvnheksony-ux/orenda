import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl, lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale   = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const limit    = parseInt(searchParams.get('limit') || '50', 10)
  const branchId = searchParams.get('branch') || null
  const id       = searchParams.get('id') || null
  const slug     = searchParams.get('slug') || null

  try {
    const payload = await getPayloadClient()

    if (id || slug) {
      const where: any = id ? { id: { equals: Number(id) } } : { slug: { equals: slug } }
      const data = await payload.find({ collection: 'departments', locale, fallbackLocale: 'en', overrideAccess: true, depth: 1, where, limit: 1 } as any)
      const doc: any = data.docs?.[0]
      if (!doc) return NextResponse.json(null, { status: 404 })
      return NextResponse.json({
        id: String(doc.id), name: doc.name ?? '', slug: doc.slug ?? '',
        icon: mediaUrl(doc.icon), description: lexicalToText(doc.description), order: doc.order ?? 0,
      })
    }

    const where: any = {}
    if (branchId) where['branch'] = { equals: Number(branchId) }

    const data = await payload.find({
      collection: 'departments',
      locale, fallbackLocale: 'en',
      overrideAccess: true,
      depth: 1,
      sort: 'order',
      limit,
      where,
    } as any)

    const docs = (data.docs || []).map((doc: any) => ({
      id:          String(doc.id),
      name:        doc.name ?? '',
      slug:        doc.slug ?? '',
      icon:        mediaUrl(doc.icon),
      description: lexicalToText(doc.description),
      order:       doc.order ?? 0,
      branch_id:   typeof doc.branch === 'object' ? String(doc.branch?.id) : doc.branch ? String(doc.branch) : null,
    }))

    return NextResponse.json({ docs, totalDocs: data.totalDocs ?? docs.length }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  } catch (err: any) {
    console.error('departments error:', err.message)
    return NextResponse.json({ error: err.message, docs: [], totalDocs: 0 }, { status: 500 })
  }
}
