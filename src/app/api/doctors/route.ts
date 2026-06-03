import { NextResponse } from 'next/server'
import { Client } from 'pg'

export const runtime = 'nodejs'

type DoctorRow = {
  id: string | number
  name: string
  specialty: string
  department: string
  image_url: string | null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const requestedLocale = searchParams.get('locale')
  const locale = requestedLocale === 'km' || requestedLocale === 'zh' ? requestedLocale : 'en'
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('DATABASE_URL is not configured')
    return NextResponse.json([], { status: 200 })
  }

  const client = new Client({ connectionString })

  try {
    await client.connect()
    const { rows } = await client.query<DoctorRow>(
      `
        select
          d.id,
          coalesce(dl.name, dl_en.name, '') as name,
          coalesce(dl.specialty, dl_en.specialty, '') as specialty,
          coalesce(dep_l.name, dep_l_en.name, 'General') as department,
          m.url as image_url
        from payload.doctors d
        left join payload.doctors_locales dl
          on dl._parent_id = d.id and dl._locale = $1
        left join payload.doctors_locales dl_en
          on dl_en._parent_id = d.id and dl_en._locale = 'en'
        left join payload.departments dep
          on dep.id = d.department_id
        left join payload.departments_locales dep_l
          on dep_l._parent_id = dep.id and dep_l._locale = $1
        left join payload.departments_locales dep_l_en
          on dep_l_en._parent_id = dep.id and dep_l_en._locale = 'en'
        left join payload.media m
          on m.id = d.photo_id
        where d._status = 'published'
          and (d.published_at is null or d.published_at <= now())
        order by d.order asc nulls last, d.created_at desc
        limit 100
      `,
      [locale],
    )

    const doctors = rows.map((doc) => ({
      id: doc.id,
      name: doc.name,
      specialty: doc.specialty,
      department: doc.department,
      image_url: doc.image_url,
    }))

    return NextResponse.json(doctors)
  } catch (err) {
    console.error('Failed to fetch doctors from database:', err)
    return NextResponse.json([], { status: 200 })
  } finally {
    await client.end().catch(() => undefined)
  }
}
