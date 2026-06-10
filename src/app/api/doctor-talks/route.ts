import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl, lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const limit  = parseInt(searchParams.get('limit') || '20', 10)
  const slug   = searchParams.get('slug')

  try {
    const payload = await getPayloadClient()
    const where: any = {}
    if (slug) where.slug = { equals: slug }

    const data = await payload.find({
      collection: 'doctor-talks',
      locale, fallbackLocale: 'en',
      overrideAccess: true,
      depth: 1,
      sort: '-eventDate',
      limit,
      where,
    } as any)

    const toDoc = (doc: any) => {
      const doctor = typeof doc.featuredDoctor === 'object' && doc.featuredDoctor ? doc.featuredDoctor : null
      return {
        id:            String(doc.id),
        title:         doc.title ?? '',
        slug:          doc.slug ?? '',
        talkTopic:     doc.talkTopic ?? '',
        eventDate:     doc.eventDate ?? '',
        eventTime:     doc.eventTime ?? '',
        duration:      doc.duration ?? null,
        isVirtual:     doc.isVirtual ?? false,
        meetingLink:   doc.meetingLink ?? '',
        thumbnail:     mediaUrl(doc.thumbnail),
        excerpt:       doc.excerpt ?? '',
        body:          lexicalToText(doc.body),
        featuredDoctor: doctor
          ? { name: doctor.name ?? '', specialty: doctor.specialty ?? '' }
          : null,
      }
    }

    if (slug) {
      const doc: any = data.docs?.[0]
      if (!doc) return NextResponse.json(null, { status: 404 })
      return NextResponse.json(toDoc(doc))
    }
    return NextResponse.json({ docs: data.docs.map(toDoc), totalDocs: data.totalDocs ?? data.docs.length })
  } catch (err: any) {
    console.error('doctor-talks:', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
