import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'insurance-updates',
      locale: locale as any,
      depth: 1,
      limit,
      overrideAccess: false,
      sort: '-publishedAt',
    } as any)

    const docs = data.docs.map((doc: any) => ({
      id: String(doc.id),
      title: doc.title ?? '',
      slug: doc.slug ?? '',
      excerpt: doc.excerpt ?? '',
      insuranceProvider: doc.insuranceProvider ?? '',
      thumbnail: mediaUrl(doc.thumbnail) ?? null,
      effectiveDate: doc.effectiveDate ?? null,
      expirationDate: doc.expirationDate ?? null,
      status: doc._status ?? 'draft',
      publishedAt: doc.publishedAt ?? doc.updatedAt ?? '',
      updatedAt: doc.updatedAt ?? '',
    }))

    return NextResponse.json(
      { docs, totalDocs: data.totalDocs },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (err: any) {
    console.error('insurance-updates:', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
