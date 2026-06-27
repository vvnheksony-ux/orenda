import { lexicalToText } from '@/lib/payload-api'

export async function fetchDepartment(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      d.id, d.branch_id,
      COALESCE(dl.name, endll.name)               AS name,
      COALESCE(dl.description, endll.description) AS description,
      COALESCE(bl.name, en_bl.name)               AS branch_name
    FROM payload.departments d
    LEFT JOIN payload.departments_locales dl    ON dl._parent_id = d.id AND dl._locale = $2
    LEFT JOIN payload.departments_locales endll ON endll._parent_id = d.id AND endll._locale = 'en'
    LEFT JOIN payload.branches_locales bl       ON bl._parent_id = d.branch_id AND bl._locale = $2
    LEFT JOIN payload.branches_locales en_bl    ON en_bl._parent_id = d.branch_id AND en_bl._locale = 'en'
    WHERE d.id = $1 AND d._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatDepartment(row: any): string {
  const parts: string[] = []
  if (row.name)        parts.push(`Department: ${row.name}`)
  if (row.branch_name) parts.push(`Branch: ${row.branch_name}`)
  const desc = lexicalToText(row.description)
  if (desc) parts.push(`Description: ${desc}`)
  return parts.join('\n')
}
