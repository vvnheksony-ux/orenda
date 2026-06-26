import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const slug   = searchParams.get('slug')
  const deptId = searchParams.get('department') || null

  try {
    const pool = getRawPool()
    const params: any[] = [locale]
    const conditions: string[] = ["sp._status = 'published'"]

    if (slug) {
      params.push(slug)
      conditions.push(`sp.slug = $${params.length}`)
    }
    if (deptId) {
      params.push(Number(deptId))
      conditions.push(`sp.department_id = $${params.length}`)
    }

    const { rows } = await pool.query(`
      SELECT
        sp.id, sp.slug, sp."order",
        COALESCE(spl.title, en_spl.title)             AS title,
        COALESCE(spl.description, en_spl.description) AS description,
        COALESCE(spl.price_label, en_spl.price_label) AS price_label,
        m.filename AS img_filename, m.prefix AS img_prefix,
        dept.id AS dept_id,
        COALESCE(dept_l.name, en_dept_l.name) AS dept_name,
        COALESCE(
          (SELECT jsonb_agg(jsonb_build_object('id', s.id, 'title', COALESCE(svl.title, en_svl.title)))
           FROM payload.service_packages_rels spr
           JOIN payload.services s ON s.id = spr.services_id
           LEFT JOIN payload.services_locales svl
             ON svl._parent_id = s.id AND svl._locale = $1
           LEFT JOIN payload.services_locales en_svl
             ON en_svl._parent_id = s.id AND en_svl._locale = 'en'
           WHERE spr.parent_id = sp.id),
          '[]'::jsonb
        ) AS services
      FROM payload.service_packages sp
      LEFT JOIN payload.service_packages_locales spl
        ON spl._parent_id = sp.id AND spl._locale = $1
      LEFT JOIN payload.service_packages_locales en_spl
        ON en_spl._parent_id = sp.id AND en_spl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = sp.image_id
      LEFT JOIN payload.departments dept ON dept.id = sp.department_id
      LEFT JOIN payload.departments_locales dept_l
        ON dept_l._parent_id = dept.id AND dept_l._locale = $1
      LEFT JOIN payload.departments_locales en_dept_l
        ON en_dept_l._parent_id = dept.id AND en_dept_l._locale = 'en'
      WHERE ${conditions.join(' AND ')}
      ORDER BY sp."order"
      LIMIT 50
    `, params)

    const toDoc = (row: any) => ({
      id:         String(row.id),
      slug:       row.slug ?? '',
      title:      row.title ?? '',
      description: lexicalToText(row.description),
      price:      row.price_label ?? '',
      image:      mediaStorageUrl(row.img_filename, row.img_prefix),
      department: row.dept_id
        ? { id: String(row.dept_id), name: row.dept_name ?? '' }
        : null,
      services: row.services ?? [],
      order:     row.order ?? 0,
    })

    if (slug) {
      if (!rows[0]) return NextResponse.json(null, { status: 404 })
      return NextResponse.json(toDoc(rows[0]))
    }

    return NextResponse.json(rows.map(toDoc), {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch (err: any) {
    console.error('service-packages:', err.message)
    return NextResponse.json(slug ? null : [])
  }
}
