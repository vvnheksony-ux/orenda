import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl, lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale   = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const limit    = parseInt(searchParams.get('limit') || '20', 10)
  const category = searchParams.get('category') || ''
  const slug     = searchParams.get('slug')

  try {
    const payload = await getPayloadClient()
    const where: any = {}
    if (slug)     where.slug = { equals: slug }
    if (category) where.healthTipCategory = { equals: category }

    const data = await payload.find({
      collection: 'health-tips',
      locale, fallbackLocale: 'en',
      overrideAccess: true,
      depth: 1,
      sort: '-publishedAt',
      limit,
      where,
    } as any)

    const toDoc = (doc: any, full = false) => ({
      id:          String(doc.id),
      title:       doc.title ?? '',
      slug:        doc.slug ?? '',
      excerpt:     doc.excerpt ?? '',
      publishedAt: doc.publishedAt ?? doc.createdAt ?? '',
      thumbnail:   mediaUrl(doc.thumbnail),
      category:    doc.healthTipCategory ?? '',
      readingTime: doc.readingTime ?? null,
      tags:        (doc.healthTipTags ?? []).map((t: any) => typeof t === 'string' ? t : t.tag ?? '').filter(Boolean),
      ...(full ? { body: lexicalToText(doc.body) } : {}),
    })

    if (slug) {
      const doc: any = data.docs?.[0]
      if (!doc) return NextResponse.json(null, { status: 404 })
      return NextResponse.json(toDoc(doc, true))
    }
    return NextResponse.json({ docs: data.docs.map((d: any) => toDoc(d, false)), totalDocs: data.totalDocs ?? data.docs.length })
  } catch (err: any) {
    console.error('health-tips:', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
