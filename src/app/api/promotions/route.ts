import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const limit  = parseInt(searchParams.get('limit') || '20', 10)
  const page   = parseInt(searchParams.get('page')  || '1',  10)
  const slug   = searchParams.get('slug')
  const id     = searchParams.get('id')

  try {
    const pool = getRawPool()

    if (id || slug) {
      const params: any[] = [locale]
      const filter = id ? `AND p.id = $2` : `AND p.slug = $2`
      params.push(id ? Number(id) : slug)

      const { rows } = await pool.query(`
        SELECT
          p.id, p.slug, p.valid_from, p.valid_to, p.published_at, p.created_at,
          COALESCE(pl.title, enpl.title)             AS title,
          COALESCE(pl.description, enpl.description) AS description,
          m.filename AS img_filename, m.prefix AS img_prefix
        FROM payload.promotions p
        LEFT JOIN payload.promotions_locales pl    ON pl._parent_id = p.id AND pl._locale = $1
        LEFT JOIN payload.promotions_locales enpl  ON enpl._parent_id = p.id AND enpl._locale = 'en'
        LEFT JOIN payload.media m ON m.id = p.image_id
        WHERE p._status = 'published' ${filter}
        LIMIT 1
      `, params)

      if (!rows[0]) return NextResponse.json(null, { status: 404 })
      const row = rows[0]
      return NextResponse.json({
        id:          String(row.id),
        title:       row.title ?? '',
        slug:        row.slug ?? '',
        image:       mediaStorageUrl(row.img_filename, row.img_prefix),
        validFrom:   row.valid_from ?? null,
        validTo:     row.valid_to ?? null,
        description: lexicalToText(row.description),
      })
    }

    const offset = (page - 1) * limit
    const { rows } = await pool.query(`
      SELECT
        p.id, p.slug, p.valid_from, p.valid_to, p.published_at, p.created_at,
        COALESCE(pl.title, enpl.title)             AS title,
        COALESCE(pl.description, enpl.description) AS description,
        m.filename AS img_filename, m.prefix AS img_prefix,
        COUNT(*) OVER() AS total_count
      FROM payload.promotions p
      LEFT JOIN payload.promotions_locales pl    ON pl._parent_id = p.id AND pl._locale = $1
      LEFT JOIN payload.promotions_locales enpl  ON enpl._parent_id = p.id AND enpl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = p.image_id
      WHERE p._status = 'published'
      ORDER BY p.published_at DESC NULLS LAST
      LIMIT $2 OFFSET $3
    `, [locale, limit, offset])

    const totalDocs = rows[0] ? Number(rows[0].total_count) : 0
    const docs = rows.map((row: any) => ({
      id:          String(row.id),
      title:       row.title ?? '',
      slug:        row.slug ?? '',
      image:       mediaStorageUrl(row.img_filename, row.img_prefix),
      validFrom:   row.valid_from ?? null,
      validTo:     row.valid_to ?? null,
      publishedAt: row.published_at ?? row.created_at ?? '',
      description: lexicalToText(row.description),
    }))

    return NextResponse.json({ docs, totalDocs }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } })
  } catch (err: any) {
    console.error('promotions:', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
