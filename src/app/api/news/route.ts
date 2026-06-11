import { NextResponse } from 'next/server'
import { getRawPool } from '@/lib/db'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

async function rawNewsList(locale: string, limit: number) {
  const pool = getRawPool()
  const { rows } = await pool.query(`
    SELECT
      n.id, n.slug, n.author, n.published_at, n.created_at, n.thumbnail_id,
      COALESCE(nl.title, enl.title)   AS title,
      COALESCE(nl.excerpt, enl.excerpt) AS excerpt,
      m.url AS thumbnail_url
    FROM payload.news n
    LEFT JOIN payload.news_locales nl  ON nl._parent_id = n.id AND nl._locale = $1
    LEFT JOIN payload.news_locales enl ON enl._parent_id = n.id AND enl._locale = 'en'
    LEFT JOIN payload.media m ON m.id = n.thumbnail_id
    WHERE n.status = 'published'
    ORDER BY n.published_at DESC NULLS LAST
    LIMIT $2
  `, [locale, limit])
  return rows
}

async function rawNewsImages(pool: any, parentIds: number[]) {
  if (!parentIds.length) return {} as Record<number, string[]>
  const { rows } = await pool.query(`
    SELECT nr.parent_id, m.url
    FROM payload.news_rels nr
    JOIN payload.media m ON m.id = nr.media_id
    WHERE nr.parent_id = ANY($1) AND nr.path = 'images'
    ORDER BY nr.parent_id, nr.order
  `, [parentIds])
  const map: Record<number, string[]> = {}
  for (const r of rows) {
    if (!map[r.parent_id]) map[r.parent_id] = []
    map[r.parent_id].push(r.url)
  }
  return map
}

function toListDoc(row: any, images: string[]) {
  return {
    id:          String(row.id),
    title:       row.title ?? '',
    slug:        row.slug ?? '',
    excerpt:     row.excerpt ?? '',
    author:      row.author ?? '',
    publishedAt: row.published_at ?? row.created_at ?? '',
    thumbnail:   row.thumbnail_url ?? null,
    images,
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const limit  = parseInt(searchParams.get('limit') || '20', 10)
  const slug   = searchParams.get('slug')

  try {
    const pool = getRawPool()

    if (slug) {
      const { rows } = await pool.query(`
        SELECT
          n.id, n.slug, n.author, n.published_at, n.created_at,
          COALESCE(nl.title,   enl.title)   AS title,
          COALESCE(nl.excerpt, enl.excerpt) AS excerpt,
          COALESCE(nl.body,    enl.body)    AS body,
          m.url AS thumbnail_url
        FROM payload.news n
        LEFT JOIN payload.news_locales nl  ON nl._parent_id = n.id AND nl._locale = $1
        LEFT JOIN payload.news_locales enl ON enl._parent_id = n.id AND enl._locale = 'en'
        LEFT JOIN payload.media m ON m.id = n.thumbnail_id
        WHERE n.status = 'published' AND n.slug = $2
        LIMIT 1
      `, [locale, slug])

      if (!rows[0]) return NextResponse.json(null, { status: 404 })
      const row = rows[0]
      const imgMap = await rawNewsImages(pool, [row.id])
      return NextResponse.json({
        id:          String(row.id),
        title:       row.title ?? '',
        slug:        row.slug ?? '',
        body:        lexicalToText(row.body),
        excerpt:     row.excerpt ?? '',
        author:      row.author ?? '',
        publishedAt: row.published_at ?? row.created_at ?? '',
        thumbnail:   row.thumbnail_url ?? null,
        images:      imgMap[row.id] ?? [],
      })
    }

    const rows = await rawNewsList(locale, limit)
    const ids = rows.map((r: any) => r.id)
    const imgMap = await rawNewsImages(pool, ids)
    const docs = rows.map((r: any) => toListDoc(r, imgMap[r.id] ?? []))
    return NextResponse.json(
      { docs, totalDocs: docs.length },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  } catch (err: any) {
    console.error('[news API]', err.message)
    return NextResponse.json({ docs: [], totalDocs: 0 })
  }
}
