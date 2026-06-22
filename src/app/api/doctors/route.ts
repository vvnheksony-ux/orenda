import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale   = searchParams.get('locale') || 'en'
  const id       = searchParams.get('id')
  const branchId = searchParams.get('branch') || null

  try {
    const pool = getRawPool()

    if (id) {
      const { rows } = await pool.query(`
        SELECT
          doc.id, doc.slug, doc.phone, doc.email, doc.sex, doc.nationality,
          doc.position_title, doc.employment_type,
          doc.total_clinical_experience_years, doc.specialist_experience_years,
          doc."order", doc.department_id,
          COALESCE(dl.name, endll.name)           AS name,
          COALESCE(dl.specialty, endll.specialty) AS specialty,
          COALESCE(dl.bio, endll.bio)             AS bio,
          m.filename AS photo_filename, m.prefix AS photo_prefix
        FROM payload.doctors doc
        LEFT JOIN payload.doctors_locales dl    ON dl._parent_id = doc.id AND dl._locale = $1
        LEFT JOIN payload.doctors_locales endll ON endll._parent_id = doc.id AND endll._locale = 'en'
        LEFT JOIN payload.media m ON m.id = doc.photo_id
        WHERE doc._status = 'published' AND doc.id = $2
        LIMIT 1
      `, [locale, Number(id)])

      if (!rows[0]) return NextResponse.json(null, { status: 404 })
      const row = rows[0]

      const [{ rows: langs }, { rows: edu }, { rows: depts }] = await Promise.all([
        pool.query(`SELECT name FROM payload.doctors_languages WHERE _parent_id = $1 ORDER BY _order`, [row.id]),
        pool.query(`SELECT description FROM payload.doctors_education WHERE _parent_id = $1 ORDER BY _order`, [row.id]),
        row.department_id
          ? pool.query(`SELECT dl.name, d.branch_id FROM payload.departments d LEFT JOIN payload.departments_locales dl ON dl._parent_id = d.id AND dl._locale = 'en' WHERE d.id = $1 LIMIT 1`, [row.department_id])
          : Promise.resolve({ rows: [] }),
      ])

      return NextResponse.json({
        id:                          String(row.id),
        name:                        row.name ?? '',
        specialty:                   row.specialty ?? '',
        department:                  depts[0]?.name ?? '',
        department_payload_id:       row.department_id ? String(row.department_id) : '',
        branch_id:                   depts[0]?.branch_id ? String(depts[0].branch_id) : '',
        image_url:                   mediaStorageUrl(row.photo_filename, row.photo_prefix),
        bio:                         lexicalToText(row.bio),
        phone:                       row.phone ?? '',
        email:                       row.email ?? '',
        nationality:                 row.nationality ?? '',
        position_title:              row.position_title ?? '',
        employment_type:             row.employment_type ?? '',
        total_experience_years:      row.total_clinical_experience_years ?? null,
        specialist_experience_years: row.specialist_experience_years ?? null,
        sex:                         row.sex ?? '',
        education:                   edu.map((e: any) => e.description ?? '').filter(Boolean),
        languages:                   langs.map((l: any) => l.name ?? '').filter(Boolean),
      })
    }

    // List with optional branch filter via department subquery
    const params: any[] = [locale]
    let branchFilter = ''
    if (branchId) {
      params.push(Number(branchId))
      branchFilter = `AND doc.department_id IN (
        SELECT id FROM payload.departments WHERE branch_id = $${params.length} AND _status = 'published'
      )`
    }

    const { rows } = await pool.query(`
      SELECT
        doc.id, doc.department_id,
        COALESCE(dl.name, endll.name)           AS name,
        COALESCE(dl.specialty, endll.specialty) AS specialty,
        m.filename AS photo_filename, m.prefix AS photo_prefix,
        dept_l.name AS department_name
      FROM payload.doctors doc
      LEFT JOIN payload.doctors_locales dl    ON dl._parent_id = doc.id AND dl._locale = $1
      LEFT JOIN payload.doctors_locales endll ON endll._parent_id = doc.id AND endll._locale = 'en'
      LEFT JOIN payload.media m ON m.id = doc.photo_id
      LEFT JOIN payload.departments_locales dept_l
        ON dept_l._parent_id = doc.department_id AND dept_l._locale = 'en'
      WHERE doc._status = 'published'
      ${branchFilter}
      ORDER BY doc."order"
      LIMIT 100
    `, params)

    const doctors = rows.map((row: any) => ({
      id:                    String(row.id),
      name:                  row.name ?? '',
      specialty:             row.specialty ?? '',
      department:            row.department_name ?? '',
      department_payload_id: row.department_id ? String(row.department_id) : '',
      image_url:             mediaStorageUrl(row.photo_filename, row.photo_prefix),
    }))

    return NextResponse.json(doctors, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch (err: any) {
    console.error('Failed to fetch doctors:', err.message)
    return NextResponse.json([], { status: 200 })
  }
}
