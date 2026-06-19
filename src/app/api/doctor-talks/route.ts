import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const limit  = parseInt(searchParams.get('limit') || '20', 10)
  const slug   = searchParams.get('slug')

  try {
    const pool = getRawPool()
    const params: any[] = [locale]
    let slugFilter = ''
    if (slug) { params.push(slug); slugFilter = `AND dt.slug = $${params.length}` }
    params.push(limit)

    const { rows } = await pool.query(`
      SELECT
        dt.id, dt.slug, dt.event_date, dt.event_time, dt.duration,
        dt.is_virtual, dt.meeting_link, dt.featured_doctor_id,
        COALESCE(dtl.title, endtl.title)           AS title,
        COALESCE(dtl.talk_topic, endtl.talk_topic) AS talk_topic,
        COALESCE(dtl.excerpt, endtl.excerpt)       AS excerpt,
        COALESCE(dtl.body, endtl.body)             AS body,
        doc_l.name                                 AS doctor_name,
        doc_l.specialty                            AS doctor_specialty,
        m.filename AS thumb_filename, m.prefix AS thumb_prefix
      FROM payload.doctor_talks dt
      LEFT JOIN payload.doctor_talks_locales dtl
        ON dtl._parent_id = dt.id AND dtl._locale = $1
      LEFT JOIN payload.doctor_talks_locales endtl
        ON endtl._parent_id = dt.id AND endtl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = dt.thumbnail_id
      LEFT JOIN payload.doctors_locales doc_l
        ON doc_l._parent_id = dt.featured_doctor_id AND doc_l._locale = 'en'
      WHERE dt._status = 'published'
      ${slugFilter}
      ORDER BY dt.event_date DESC NULLS LAST
      LIMIT $${params.length}
    `, params)

    const toDoc = (row: any) => ({
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
        ? { name: row.doctor_name ?? '', specialty: row.doctor_specialty ?? '' }
        : null,
    })

    if (slug) {
      if (!rows[0]) return NextResponse.json(null, { status: 404 })
      return NextResponse.json(toDoc(rows[0]))
    }
    return NextResponse.json({ docs: rows.map(toDoc), totalDocs: rows.length })
  } catch (err: any) {
    console.error('doctor-talks:', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
