import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl, lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale   = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const id       = searchParams.get('id')
  const branchId = searchParams.get('branch') || null

  try {
    const payload = await getPayloadClient()

    if (id) {
      const data = await payload.find({
        collection: 'doctors',
        locale, fallbackLocale: 'en',
        overrideAccess: true,
        depth: 2,
        where: { id: { equals: Number(id) } },
        limit: 1,
      } as any)

      const doc: any = data.docs?.[0]
      if (!doc) return NextResponse.json(null, { status: 404 })

      const dept = typeof doc.department === 'object' && doc.department ? doc.department : null

      return NextResponse.json({
        id:                          String(doc.id),
        name:                        doc.name ?? '',
        specialty:                   doc.specialty ?? '',
        department:                  dept?.name ?? '',
        department_payload_id:       dept ? String(dept.id) : '',
        image_url:                   mediaUrl(doc.photo),
        bio:                         lexicalToText(doc.bio),
        phone:                       doc.phone ?? '',
        email:                       doc.email ?? '',
        nationality:                 doc.nationality ?? '',
        position_title:              doc.positionTitle ?? '',
        employment_type:             doc.employmentType ?? '',
        total_experience_years:      doc.totalClinicalExperienceYears ?? null,
        specialist_experience_years: doc.specialistExperienceYears ?? null,
        sex:                         doc.sex ?? '',
        education:                   (doc.education ?? []).map((e: any) => e.description ?? '').filter(Boolean),
        languages:                   (doc.languages ?? []).map((e: any) => e.name ?? '').filter(Boolean),
      })
    }

    // Single query: join doctors → departments filtered by branch
    const where: any = branchId
      ? { 'department.branch': { equals: Number(branchId) } }
      : {}

    const [data] = await Promise.all([
      payload.find({
        collection: 'doctors',
        locale, fallbackLocale: 'en',
        overrideAccess: true,
        depth: 1,
        sort: 'order',
        limit: 100,
        where,
      } as any),
    ])

    const doctors = data.docs.map((doc: any) => {
      const dept = typeof doc.department === 'object' && doc.department ? doc.department : null
      return {
        id:                    String(doc.id),
        name:                  doc.name ?? '',
        specialty:             doc.specialty ?? '',
        department:            dept?.name ?? '',
        department_payload_id: dept ? String(dept.id) : '',
        image_url:             mediaUrl(doc.photo),
      }
    })

    return NextResponse.json(doctors, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch (err: any) {
    console.error('Failed to fetch doctors:', err.message)
    return NextResponse.json([], { status: 200 })
  }
}
