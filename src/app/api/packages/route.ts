import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl, lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'

  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'service-packages',
      locale, fallbackLocale: 'en',
      overrideAccess: true,
      depth: 1,
      sort: 'order',
      limit: 20,
    } as any)

    const docs = (data.docs || []).map((doc: any) => ({
      id:          String(doc.id),
      slug:        doc.slug ?? '',
      title:       doc.title ?? '',
      description: lexicalToText(doc.description),
      price:       doc.priceLabel ?? '',
      image:       mediaUrl(doc.image),
    }))

    return NextResponse.json(docs)
  } catch (err: any) {
    console.error('packages:', err.message)
    return NextResponse.json([])
  }
}
