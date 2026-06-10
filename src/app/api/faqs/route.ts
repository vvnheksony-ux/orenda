import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const limit  = parseInt(searchParams.get('limit') || '50', 10)

  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'faqs',
      locale, fallbackLocale: 'en',
      overrideAccess: true,
      depth: 0,
      sort: 'order',
      limit,
    } as any)

    const faqs = (data.docs || []).map((doc: any) => ({
      id:       String(doc.id),
      question: doc.question ?? '',
      answer:   lexicalToText(doc.answer),
      category: doc.category ?? '',
      order:    doc.order ?? 0,
    }))

    return NextResponse.json(faqs, { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } })
  } catch (err: any) {
    console.error('faqs:', err.message)
    return NextResponse.json([])
  }
}
