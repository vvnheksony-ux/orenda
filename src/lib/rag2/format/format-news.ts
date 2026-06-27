import { lexicalToText } from '@/lib/payload-api'

export async function fetchNews(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      n.id, n.author,
      COALESCE(nl.title, enl.title)     AS title,
      COALESCE(nl.excerpt, enl.excerpt) AS excerpt,
      COALESCE(nl.body, enl.body)       AS body
    FROM payload.news n
    LEFT JOIN payload.news_locales nl  ON nl._parent_id = n.id AND nl._locale = $2
    LEFT JOIN payload.news_locales enl ON enl._parent_id = n.id AND enl._locale = 'en'
    WHERE n.id = $1 AND n._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatNews(row: any): string {
  const parts: string[] = []
  if (row.title)  parts.push(`Title: ${row.title}`)
  if (row.author) parts.push(`Author: ${row.author}`)
  if (row.excerpt) parts.push(`Summary: ${row.excerpt}`)
  const body = lexicalToText(row.body)
  if (body) parts.push(`Content: ${body}`)
  return parts.join('\n')
}
