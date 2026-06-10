import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl, lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

const fetchNewsList = unstable_cache(
  async (locale: string, limit: number) => {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'news',
      locale: locale as any, fallbackLocale: 'en',
      overrideAccess: true, depth: 1,
      sort: '-publishedAt', limit,
      where: { _status: { equals: 'published' } },
    } as any)
    return (data.docs || []).map((doc: any) => ({
      id:          String(doc.id),
      title:       doc.title ?? '',
      slug:        doc.slug ?? '',
      excerpt:     doc.excerpt ?? '',
      author:      doc.author ?? '',
      publishedAt: doc.publishedAt ?? doc.createdAt ?? '',
      thumbnail:   mediaUrl(doc.thumbnail),
    }))
  },
  ['news-list'],
  { revalidate: 300, tags: ['news'] }
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const limit  = parseInt(searchParams.get('limit') || '20', 10)
  const slug   = searchParams.get('slug')

  try {
    const payload = await getPayloadClient()

    if (slug) {
      const data = await payload.find({
        collection: 'news',
        locale, fallbackLocale: 'en',
        overrideAccess: true,
        depth: 1,
        limit: 1,
        where: { slug: { equals: slug } },
      } as any)
      const doc: any = data.docs?.[0]
      if (!doc) return NextResponse.json(null, { status: 404 })
      return NextResponse.json({
        id:          String(doc.id),
        title:       (doc as any).title ?? '',
        slug:        (doc as any).slug ?? '',
        body:        lexicalToText((doc as any).body),
        excerpt:     (doc as any).excerpt ?? '',
        author:      (doc as any).author ?? '',
        publishedAt: (doc as any).publishedAt ?? (doc as any).createdAt ?? '',
        thumbnail:   mediaUrl((doc as any).thumbnail),
      })
    }

    const docs = await fetchNewsList(locale, limit)
    return NextResponse.json(
      { docs, totalDocs: docs.length },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (err: any) {
    console.error('news:', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
