import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const slug = searchParams.get('slug')

  try {
    const pool = getRawPool()
    const params: any[] = [locale]
    let slugFilter = ''
    if (slug) { params.push(slug); slugFilter = `AND sp.slug = $${params.length}` }

    const { rows } = await pool.query(`
      SELECT
        sp.id, sp.slug, sp."order",
        COALESCE(spl.title, enspl.title)             AS title,
        COALESCE(spl.description, enspl.description) AS description,
        COALESCE(spl.price_label, enspl.price_label) AS price_label,
        m.filename AS img_filename, m.prefix AS img_prefix
      FROM payload.service_packages sp
      LEFT JOIN payload.service_packages_locales spl
        ON spl._parent_id = sp.id AND spl._locale = $1
      LEFT JOIN payload.service_packages_locales enspl
        ON enspl._parent_id = sp.id AND enspl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = sp.image_id
      WHERE sp._status = 'published'
      ${slugFilter}
      ORDER BY sp."order"
      LIMIT 20
    `, params)

    const toDoc = (row: any) => ({
      id:          String(row.id),
      slug:        row.slug ?? '',
      title:       row.title ?? '',
      description: lexicalToText(row.description),
      price:       row.price_label ?? '',
      image:       mediaStorageUrl(row.img_filename, row.img_prefix),
    })

    if (slug) {
      if (!rows[0]) return NextResponse.json(null, { status: 404 })
      return NextResponse.json(toDoc(rows[0]))
    }

    return NextResponse.json(rows.map(toDoc))
  } catch (err: any) {
    console.error('packages:', err.message)
    return NextResponse.json(slug ? null : [])
  }
}
