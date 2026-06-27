import { lexicalToText } from '@/lib/payload-api'

export async function fetchHealthTip(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      ht.id, ht.author, ht.health_tip_category, ht.reading_time,
      COALESCE(htl.title, en_htl.title)     AS title,
      COALESCE(htl.excerpt, en_htl.excerpt) AS excerpt,
      COALESCE(htl.body, en_htl.body)       AS body
    FROM payload.health_tips ht
    LEFT JOIN payload.health_tips_locales htl    ON htl._parent_id = ht.id AND htl._locale = $2
    LEFT JOIN payload.health_tips_locales en_htl ON en_htl._parent_id = ht.id AND en_htl._locale = 'en'
    WHERE ht.id = $1 AND ht._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatHealthTip(row: any): string {
  const parts: string[] = []
  if (row.title)               parts.push(`Health Tip: ${row.title}`)
  if (row.health_tip_category) parts.push(`Category: ${row.health_tip_category}`)
  if (row.reading_time)        parts.push(`Reading Time: ${row.reading_time} min`)
  if (row.author)              parts.push(`Author: ${row.author}`)
  if (row.excerpt)             parts.push(`Summary: ${row.excerpt}`)
  const body = lexicalToText(row.body)
  if (body) parts.push(`Content: ${body}`)
  return parts.join('\n')
}
