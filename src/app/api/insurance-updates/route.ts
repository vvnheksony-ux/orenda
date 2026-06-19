import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  try {
    const pool = getRawPool()
    const { rows } = await pool.query(`
      SELECT
        iu.id, iu.slug, iu.status, iu.published_at, iu.updated_at,
        iu.effective_date, iu.expiration_date,
        COALESCE(l.title, enl.title)     AS title,
        COALESCE(l.excerpt, enl.excerpt) AS excerpt,
        m.filename AS thumb_filename, m.prefix AS thumb_prefix
      FROM payload.insurance_updates iu
      LEFT JOIN payload.insurance_updates_locales l   ON l._parent_id = iu.id AND l._locale = $1
      LEFT JOIN payload.insurance_updates_locales enl ON enl._parent_id = iu.id AND enl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = iu.thumbnail_id
      WHERE iu.status = 'published'
      ORDER BY iu.published_at DESC NULLS LAST
      LIMIT $2
    `, [locale, limit])

    const docs = rows.map((row: any) => ({
      id:                String(row.id),
      title:             row.title ?? '',
      slug:              row.slug ?? '',
      excerpt:           row.excerpt ?? '',
      insuranceProvider: '',
      thumbnail:         mediaStorageUrl(row.thumb_filename, row.thumb_prefix),
      effectiveDate:     row.effective_date ?? null,
      expirationDate:    row.expiration_date ?? null,
      status:            row.status ?? 'draft',
      publishedAt:       row.published_at ?? row.updated_at ?? '',
      updatedAt:         row.updated_at ?? '',
    }))

    return NextResponse.json(
      { docs, totalDocs: docs.length },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (err: any) {
    console.error('insurance-updates:', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
