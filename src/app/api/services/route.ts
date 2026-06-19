import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const deptId = searchParams.get('department') || null

  try {
    const pool = getRawPool()
    const params: any[] = [locale]
    let deptFilter = ''
    if (deptId) {
      params.push(Number(deptId))
      deptFilter = `AND s.department_id = $${params.length}`
    }

    const { rows } = await pool.query(`
      SELECT
        s.id, s.slug, s.department_id,
        COALESCE(sl.title, ensl.title)   AS title,
        dept_l.name                      AS department_name,
        m.filename AS icon_filename, m.prefix AS icon_prefix
      FROM payload.services s
      LEFT JOIN payload.services_locales sl    ON sl._parent_id = s.id AND sl._locale = $1
      LEFT JOIN payload.services_locales ensl  ON ensl._parent_id = s.id AND ensl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = s.icon_id
      LEFT JOIN payload.departments_locales dept_l
        ON dept_l._parent_id = s.department_id AND dept_l._locale = 'en'
      WHERE s._status = 'published'
      ${deptFilter}
      ORDER BY title
      LIMIT 100
    `, params)

    const docs = rows.map((row: any) => ({
      id:    String(row.id),
      title: row.title ?? '',
      slug:  row.slug ?? '',
      icon:  mediaStorageUrl(row.icon_filename, row.icon_prefix),
      department: row.department_id
        ? { id: String(row.department_id), name: row.department_name ?? '' }
        : null,
    }))

    return NextResponse.json({ docs })
  } catch (err: any) {
    console.error('services:', err.message)
    return NextResponse.json({ docs: [] })
  }
}
