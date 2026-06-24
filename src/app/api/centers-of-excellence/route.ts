import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'

export const runtime = 'nodejs'

// Published Centers of Excellence for the homepage section (title, thumbnail,
// and the per-center stats). Raw pool = serverless-safe.
export async function GET(req: Request) {
  const locale = new URL(req.url).searchParams.get('locale') || 'en'
  try {
    const pool = getRawPool()
    const { rows } = await pool.query(
      `
      SELECT
        c.id, c.slug, c.success_rate, c.surgeries, c.satisfactions_rate, c."order",
        COALESCE(cl.title, encl.title) AS title,
        m.filename AS thumb_filename, m.prefix AS thumb_prefix
      FROM payload.centers_of_excellence c
      LEFT JOIN payload.centers_of_excellence_locales cl   ON cl._parent_id = c.id   AND cl._locale = $1
      LEFT JOIN payload.centers_of_excellence_locales encl ON encl._parent_id = c.id AND encl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = c.thumbnail_id
      WHERE c._status = 'published'
      ORDER BY c."order" ASC NULLS LAST, c.id ASC
      LIMIT 20
      `,
      [locale],
    )

    const docs = rows.map((r: any) => ({
      id: String(r.id),
      slug: r.slug ?? '',
      title: r.title ?? '',
      icon: mediaStorageUrl(r.thumb_filename, r.thumb_prefix),
      successRate: r.success_rate ?? '',
      surgeries: r.surgeries ?? '',
      satisfactionsRate: r.satisfactions_rate ?? '',
    }))

    return NextResponse.json({ docs }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } })
  } catch (err: any) {
    console.error('centers-of-excellence:', err.message)
    return NextResponse.json({ docs: [] })
  }
}
