import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale   = searchParams.get('locale') || 'en'
  const limit    = parseInt(searchParams.get('limit') || '50', 10)
  const branchId = searchParams.get('branch') || null
  const id       = searchParams.get('id') || null
  const slug     = searchParams.get('slug') || null

  try {
    const pool = getRawPool()
    const params: any[] = [locale]
    const extra: string[] = []

    if (branchId) { params.push(Number(branchId)); extra.push(`AND d.branch_id = $${params.length}`) }
    if (id)       { params.push(Number(id));        extra.push(`AND d.id = $${params.length}`) }
    if (slug)     { params.push(slug);              extra.push(`AND d.slug = $${params.length}`) }
    params.push(limit)

    const { rows } = await pool.query(`
      SELECT
        d.id, d.slug, d."order", d.branch_id,
        COALESCE(dl.name, endll.name)               AS name,
        COALESCE(dl.description, endll.description) AS description,
        m.filename AS icon_filename, m.prefix AS icon_prefix
      FROM payload.departments d
      LEFT JOIN payload.departments_locales dl
        ON dl._parent_id = d.id AND dl._locale = $1
      LEFT JOIN payload.departments_locales endll
        ON endll._parent_id = d.id AND endll._locale = 'en'
      LEFT JOIN payload.media m ON m.id = d.icon_id
      WHERE d.status = 'published'
      ${extra.join(' ')}
      ORDER BY d."order"
      LIMIT $${params.length}
    `, params)

    const toDoc = (row: any) => ({
      id:          String(row.id),
      name:        row.name ?? '',
      slug:        row.slug ?? '',
      icon:        mediaStorageUrl(row.icon_filename, row.icon_prefix),
      description: lexicalToText(row.description),
      order:       row.order ?? 0,
      branch_id:   row.branch_id ? String(row.branch_id) : null,
    })

    if (id || slug) {
      if (!rows[0]) return NextResponse.json(null, { status: 404 })
      return NextResponse.json(toDoc(rows[0]))
    }

    const docs = rows.map(toDoc)
    return NextResponse.json(
      { docs, totalDocs: docs.length },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (err: any) {
    console.error('departments error:', err.message)
    return NextResponse.json({ error: err.message, docs: [], totalDocs: 0 }, { status: 500 })
  }
}
