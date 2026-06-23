import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

type DoctorTalkRow = {
  id: number
  slug: string | null
  event_date: string | null
  event_time: string | null
  duration: number | string | null
  is_virtual: boolean | null
  meeting_link: string | null
  featured_doctor_id: number | null
  featured_doctor_department_id: number | null
  title: string | null
  talk_topic: string | null
  excerpt: string | null
  body: unknown
  doctor_name: string | null
  doctor_specialty: string | null
  doctor_department_name: string | null
  thumb_filename: string | null
  thumb_prefix: string | null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const limit  = parseInt(searchParams.get('limit') || '20', 10)
  const slug   = searchParams.get('slug')

  try {
    const pool = getRawPool()
    const params: Array<string | number> = [locale]
    let slugFilter = ''
    if (slug) { params.push(slug); slugFilter = `AND dt.slug = $${params.length}` }
    params.push(limit)

    const { rows } = await pool.query(`
      SELECT
        dt.id, dt.slug, dt.event_date, dt.event_time, dt.duration,
        dt.is_virtual, dt.meeting_link, dt.featured_doctor_id,
        doc.department_id AS featured_doctor_department_id,
        COALESCE(dtl.title, endtl.title)           AS title,
        COALESCE(dtl.talk_topic, endtl.talk_topic) AS talk_topic,
        COALESCE(dtl.excerpt, endtl.excerpt)       AS excerpt,
        COALESCE(dtl.body, endtl.body)             AS body,
        doc_l.name                                 AS doctor_name,
        doc_l.specialty                            AS doctor_specialty,
        COALESCE(dept_l.name, en_dept_l.name)      AS doctor_department_name,
        m.filename AS thumb_filename, m.prefix AS thumb_prefix
      FROM payload.doctor_talks dt
      LEFT JOIN payload.doctor_talks_locales dtl
        ON dtl._parent_id = dt.id AND dtl._locale = $1
      LEFT JOIN payload.doctor_talks_locales endtl
        ON endtl._parent_id = dt.id AND endtl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = dt.thumbnail_id
      LEFT JOIN payload.doctors doc ON doc.id = dt.featured_doctor_id
      LEFT JOIN payload.doctors_locales doc_l
        ON doc_l._parent_id = dt.featured_doctor_id AND doc_l._locale = 'en'
      LEFT JOIN payload.departments_locales dept_l
        ON dept_l._parent_id = doc.department_id AND dept_l._locale = $1
      LEFT JOIN payload.departments_locales en_dept_l
        ON en_dept_l._parent_id = doc.department_id AND en_dept_l._locale = 'en'
      WHERE dt._status = 'published'
      ${slugFilter}
      ORDER BY dt.event_date DESC NULLS LAST
      LIMIT $${params.length}
    `, params)

    const toDoc = (row: DoctorTalkRow) => ({
      id:           String(row.id),
      title:        row.title ?? '',
      slug:         row.slug ?? '',
      talkTopic:    row.talk_topic ?? '',
      eventDate:    row.event_date ?? '',
      eventTime:    row.event_time ?? '',
      duration:     row.duration ? Number(row.duration) : null,
      isVirtual:    row.is_virtual ?? false,
      meetingLink:  row.meeting_link ?? '',
      thumbnail:    mediaStorageUrl(row.thumb_filename, row.thumb_prefix),
      excerpt:      row.excerpt ?? '',
      body:         lexicalToText(row.body),
      featuredDoctor: row.featured_doctor_id
        ? {
            name: row.doctor_name ?? '',
            specialty: row.doctor_specialty ?? '',
            departmentId: row.featured_doctor_department_id ? String(row.featured_doctor_department_id) : '',
            departmentName: row.doctor_department_name ?? '',
          }
        : null,
    })

    if (slug) {
      if (!rows[0]) return NextResponse.json(null, { status: 404 })
      return NextResponse.json(toDoc(rows[0]))
    }
    return NextResponse.json({ docs: (rows as DoctorTalkRow[]).map(toDoc), totalDocs: rows.length }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'We could not load doctor talks right now.'
    console.error('doctor-talks:', message)
    return NextResponse.json(
      { error: message, docs: [], totalDocs: 0 },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
