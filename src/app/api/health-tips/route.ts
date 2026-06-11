import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

async function rawQuery(locale: string, limit: number, slug?: string, category?: string) {
  const payload = await getPayloadClient()
  const pool = (payload as any).db.pool
  const params: any[] = [locale, limit]
  const extra: string[] = []
  if (slug)     { params.push(slug);     extra.push(`AND ht.slug = $${params.length}`) }
  if (category) { params.push(category); extra.push(`AND ht.health_tip_category = $${params.length}`) }

  const { rows } = await pool.query(`
    SELECT
      ht.id, ht.slug, ht._status, ht.published_at, ht.created_at,
      ht.author, ht.health_tip_category, ht.reading_time,
      htl.title, htl.excerpt, htl.body,
      m.url AS thumbnail_url
    FROM payload.health_tips ht
    JOIN payload.health_tips_locales htl
      ON htl._parent_id = ht.id AND htl._locale = $1
    LEFT JOIN payload.media m ON m.id = ht.thumbnail_id
    WHERE ht._status = 'published'
    ${extra.join(' ')}
    ORDER BY ht.published_at DESC NULLS LAST
    LIMIT $2
  `, params)
  return rows
}

function toDoc(row: any, full: boolean) {
  return {
    id:          String(row.id),
    title:       row.title ?? '',
    slug:        row.slug ?? '',
    excerpt:     row.excerpt ?? '',
    publishedAt: row.published_at ?? row.created_at ?? '',
    thumbnail:   row.thumbnail_url ?? null,
    category:    row.health_tip_category ?? '',
    readingTime: row.reading_time ?? null,
    tags:        [],
    ...(full ? { body: lexicalToText(row.body) } : {}),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale   = searchParams.get('locale') || 'en'
  const limit    = parseInt(searchParams.get('limit') || '20', 10)
  const category = searchParams.get('category') || ''
  const slug     = searchParams.get('slug') || ''

  try {
    const rows = await rawQuery(locale, limit, slug || undefined, category || undefined)

    if (slug) {
      if (!rows[0]) return NextResponse.json(null, { status: 404 })
      return NextResponse.json(toDoc(rows[0], true))
    }

    const docs = rows.map((r: any) => toDoc(r, false))
    return NextResponse.json({ docs, totalDocs: docs.length })
  } catch (err: any) {
    console.error('health-tips:', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
