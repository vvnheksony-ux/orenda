import { lexicalToText } from '@/lib/payload-api'

export async function fetchBranch(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      b.id, b.phone, b.email, b.map_url,
      COALESCE(bl.name, enbl.name)               AS name,
      COALESCE(bl.address, enbl.address)         AS address,
      COALESCE(bl.hours, enbl.hours)             AS hours,
      COALESCE(bl.description, enbl.description) AS description
    FROM payload.branches b
    LEFT JOIN payload.branches_locales bl    ON bl._parent_id = b.id AND bl._locale = $2
    LEFT JOIN payload.branches_locales enbl  ON enbl._parent_id = b.id AND enbl._locale = 'en'
    WHERE b.id = $1 AND b._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatBranch(row: any): string {
  const parts: string[] = []
  if (row.name)    parts.push(`Branch: ${row.name}`)
  if (row.address) parts.push(`Address: ${row.address}`)
  if (row.phone)   parts.push(`Phone: ${row.phone}`)
  if (row.email)   parts.push(`Email: ${row.email}`)
  const hours = lexicalToText(row.hours)
  if (hours) parts.push(`Hours: ${hours}`)
  const desc = lexicalToText(row.description)
  if (desc) parts.push(`Description: ${desc}`)
  if (row.map_url) parts.push(`Map: ${row.map_url}`)
  return parts.join('\n')
}
