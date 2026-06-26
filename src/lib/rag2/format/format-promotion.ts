import { lexicalToText } from '@/lib/payload-api'

export async function fetchPromotion(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      p.id, p.valid_from, p.valid_to,
      COALESCE(pl.title, enpl.title)             AS title,
      COALESCE(pl.description, enpl.description) AS description
    FROM payload.promotions p
    LEFT JOIN payload.promotions_locales pl    ON pl._parent_id = p.id AND pl._locale = $2
    LEFT JOIN payload.promotions_locales enpl  ON enpl._parent_id = p.id AND enpl._locale = 'en'
    WHERE p.id = $1 AND p._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatPromotion(row: any): string {
  const parts: string[] = []
  if (row.title)     parts.push(`Promotion: ${row.title}`)
  if (row.valid_from) parts.push(`Valid From: ${row.valid_from}`)
  if (row.valid_to)   parts.push(`Valid To: ${row.valid_to}`)
  const desc = lexicalToText(row.description)
  if (desc) parts.push(`Details: ${desc}`)
  return parts.join('\n')
}
