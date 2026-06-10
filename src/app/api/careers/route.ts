import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl, lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const limit  = parseInt(searchParams.get('limit') || '50', 10)
  const slug   = searchParams.get('slug')

  try {
    const payload = await getPayloadClient()
    const where: any = {}
    if (slug) where.slug = { equals: slug }

    const data = await payload.find({
      collection: 'careers',
      locale, fallbackLocale: 'en',
      overrideAccess: true,
      depth: 1,
      sort: '-createdAt',
      limit,
      where,
    } as any)

    const toDoc = (doc: any) => ({
      id:                  String(doc.id),
      title:               doc.position ?? doc.title ?? '',
      slug:                doc.slug ?? '',
      department:          typeof doc.careerDepartment === 'object' ? (doc.careerDepartment?.name ?? '') : '',
      employmentType:      doc.careerEmploymentType ?? '',
      experienceLevel:     doc.experienceLevel ?? '',
      salaryRange:         doc.salaryRange ?? '',
      applicationDeadline: doc.applicationDeadline ?? null,
      thumbnail:           mediaUrl(doc.thumbnail),
      requirements:        lexicalToText(doc.careerRequirements),
      responsibilities:    lexicalToText(doc.responsibilities),
    })

    if (slug) {
      const doc: any = data.docs?.[0]
      if (!doc) return NextResponse.json(null, { status: 404 })
      return NextResponse.json(toDoc(doc))
    }
    return NextResponse.json({ docs: data.docs.map(toDoc), totalDocs: data.totalDocs ?? data.docs.length })
  } catch (err: any) {
    console.error('careers:', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
