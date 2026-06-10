import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl, lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const limit  = parseInt(searchParams.get('limit') || '20', 10)
  const page   = parseInt(searchParams.get('page')  || '1',  10)
  const slug   = searchParams.get('slug')
  const id     = searchParams.get('id')

  try {
    const payload = await getPayloadClient()

    // Single promo lookup
    if (id || slug) {
      const where: any = id ? { id: { equals: Number(id) } } : { slug: { equals: slug } }
      const data = await payload.find({ collection: 'promotions', locale, fallbackLocale: 'en', depth: 1, where, limit: 1 } as any)
      const doc: any = data.docs?.[0]
      if (!doc) return NextResponse.json(null, { status: 404 })
      return NextResponse.json({
        id: String(doc.id), title: doc.title ?? '', slug: doc.slug ?? '',
        image: mediaUrl(doc.image), validFrom: doc.validFrom ?? null, validTo: doc.validTo ?? null,
        description: lexicalToText(doc.description),
      })
    }

    const data = await payload.find({
      collection: 'promotions',
      locale, fallbackLocale: 'en',
      depth: 1,
      sort: '-publishedAt',
      limit,
      page,
    } as any)

    const docs = (data.docs || []).map((doc: any) => ({
      id:          String(doc.id),
      title:       doc.title ?? '',
      slug:        doc.slug ?? '',
      image:       mediaUrl(doc.image),
      validFrom:   doc.validFrom ?? null,
      validTo:     doc.validTo ?? null,
      publishedAt: doc.publishedAt ?? doc.createdAt ?? '',
      description: lexicalToText(doc.description),
    }))

    return NextResponse.json({ docs, totalDocs: data.totalDocs ?? docs.length })
  } catch (err: any) {
    console.error('promotions:', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
