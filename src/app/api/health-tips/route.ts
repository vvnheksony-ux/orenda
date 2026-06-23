import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

type HealthTipRow = {
  id: number
  slug: string | null
  published_at: string | null
  created_at: string | null
  author: string | null
  health_tip_category: string | null
  reading_time: number | string | null
  title: string | null
  excerpt: string | null
  body: unknown
  thumb_filename: string | null
  thumb_prefix: string | null
}

async function rawQuery(locale: string, limit: number, slug?: string, category?: string) {
  const pool = getRawPool()
  const params: Array<string | number> = [locale, limit]
  const extra: string[] = []
  if (slug)     { params.push(slug);     extra.push(`AND ht.slug = $${params.length}`) }
  if (category) { params.push(category); extra.push(`AND ht.health_tip_category = $${params.length}`) }

  const { rows } = await pool.query(`
    SELECT
      ht.id, ht.slug, ht._status, ht.published_at, ht.created_at,
      ht.author, ht.health_tip_category, ht.reading_time,
      COALESCE(htl.title, enhtl.title) AS title,
      COALESCE(htl.excerpt, enhtl.excerpt) AS excerpt,
      COALESCE(htl.body, enhtl.body) AS body,
      m.filename AS thumb_filename, m.prefix AS thumb_prefix
    FROM payload.health_tips ht
    LEFT JOIN payload.health_tips_locales htl
      ON htl._parent_id = ht.id AND htl._locale = $1
    LEFT JOIN payload.health_tips_locales enhtl
      ON enhtl._parent_id = ht.id AND enhtl._locale = 'en'
    LEFT JOIN payload.media m ON m.id = ht.thumbnail_id AND (m.filename IS NULL OR m.filename NOT LIKE 'news-thumb%')
    WHERE ht._status = 'published'
    ${extra.join(' ')}
    ORDER BY ht.published_at DESC NULLS LAST
    LIMIT $2
  `, params)
  return rows as HealthTipRow[]
}

function toDoc(row: HealthTipRow, full: boolean) {
  return {
    id:          String(row.id),
    title:       row.title ?? '',
    slug:        row.slug ?? '',
    excerpt:     row.excerpt ?? '',
    author:      row.author ?? '',
    publishedAt: row.published_at ?? row.created_at ?? '',
    thumbnail:   mediaStorageUrl(row.thumb_filename, row.thumb_prefix),
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

    const docs = rows.map((row) => toDoc(row, false))
    return NextResponse.json({ docs, totalDocs: docs.length }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'We could not load health tips right now.'
    console.error('health-tips:', message)
    return NextResponse.json(
      { error: message, docs: [], totalDocs: 0 },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
