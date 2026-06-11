import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const limit  = parseInt(searchParams.get('limit') || '50', 10)
  const slug   = searchParams.get('slug')

  try {
    const pool = getRawPool()
    const params: any[] = [locale]
    let slugFilter = ''
    if (slug) { params.push(slug); slugFilter = `AND c.slug = $${params.length}` }
    params.push(limit)

    const { rows } = await pool.query(`
      SELECT
        c.id, c.slug, c.career_employment_type, c.experience_level,
        c.application_deadline, c.created_at,
        COALESCE(cl.position, encl.position)                       AS position,
        COALESCE(cl.title, encl.title)                             AS title,
        COALESCE(cl.salary_range, encl.salary_range)               AS salary_range,
        COALESCE(cl.career_requirements, encl.career_requirements) AS career_requirements,
        COALESCE(cl.responsibilities, encl.responsibilities)       AS responsibilities,
        dept_l.name AS department_name,
        m.filename AS thumb_filename, m.prefix AS thumb_prefix
      FROM payload.careers c
      LEFT JOIN payload.careers_locales cl    ON cl._parent_id = c.id AND cl._locale = $1
      LEFT JOIN payload.careers_locales encl  ON encl._parent_id = c.id AND encl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = c.thumbnail_id
      LEFT JOIN payload.departments_locales dept_l
        ON dept_l._parent_id = c.career_department_id AND dept_l._locale = 'en'
      WHERE c.status = 'published'
      ${slugFilter}
      ORDER BY c.created_at DESC
      LIMIT $${params.length}
    `, params)

    const toDoc = (row: any) => ({
      id:                  String(row.id),
      title:               row.position ?? row.title ?? '',
      slug:                row.slug ?? '',
      department:          row.department_name ?? '',
      employmentType:      row.career_employment_type ?? '',
      experienceLevel:     row.experience_level ?? '',
      salaryRange:         row.salary_range ?? '',
      applicationDeadline: row.application_deadline ?? null,
      thumbnail:           mediaStorageUrl(row.thumb_filename, row.thumb_prefix),
      requirements:        lexicalToText(row.career_requirements),
      responsibilities:    lexicalToText(row.responsibilities),
    })

    if (slug) {
      if (!rows[0]) return NextResponse.json(null, { status: 404 })
      return NextResponse.json(toDoc(rows[0]))
    }
    return NextResponse.json({ docs: rows.map(toDoc), totalDocs: rows.length })
  } catch (err: any) {
    console.error('careers:', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
