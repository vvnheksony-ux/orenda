import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const locale = new URL(req.url).searchParams.get('locale') || 'en'

  try {
    const pool = getRawPool()

    const { rows } = await pool.query(`
      SELECT
        b.id, b.slug, b.phone, b.email, b.map_url, b."order",
        COALESCE(bl.name, enbl.name)           AS name,
        COALESCE(bl.address, enbl.address)     AS address,
        COALESCE(bl.hours, enbl.hours)         AS hours,
        m.filename AS image_filename, m.prefix AS image_prefix
      FROM payload.branches b
      LEFT JOIN payload.branches_locales bl    ON bl._parent_id = b.id AND bl._locale = $1
      LEFT JOIN payload.branches_locales enbl  ON enbl._parent_id = b.id AND enbl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = b.image_id
      WHERE b._status = 'published'
      ORDER BY b."order"
      LIMIT 20
    `, [locale])

    const docs = rows.map((row: any) => ({
      id:      String(row.id),
      name:    row.name ?? '',
      slug:    row.slug ?? '',
      address: row.address ?? '',
      phone:   row.phone ?? '',
      email:   row.email ?? '',
      mapUrl:  row.map_url ?? '',
      hours:   row.hours ?? '',
      image:   mediaStorageUrl(row.image_filename, row.image_prefix),
      order:   row.order ?? 0,
    }))

    return NextResponse.json({ docs }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (err: any) {
    console.error('branches:', err.message)
    return NextResponse.json({ docs: [] })
  }
}
