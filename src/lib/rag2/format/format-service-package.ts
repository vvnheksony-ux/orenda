import { lexicalToText } from '@/lib/payload-api'

export async function fetchServicePackage(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      sp.id,
      COALESCE(spl.title, en_spl.title)             AS title,
      COALESCE(spl.price_label, en_spl.price_label) AS price_label,
      COALESCE(spl.description, en_spl.description) AS description,
      COALESCE(dept_l.name, en_dept_l.name)         AS department_name
    FROM payload.service_packages sp
    LEFT JOIN payload.service_packages_locales spl    ON spl._parent_id = sp.id AND spl._locale = $2
    LEFT JOIN payload.service_packages_locales en_spl ON en_spl._parent_id = sp.id AND en_spl._locale = 'en'
    LEFT JOIN payload.departments_locales dept_l      ON dept_l._parent_id = sp.department_id AND dept_l._locale = $2
    LEFT JOIN payload.departments_locales en_dept_l   ON en_dept_l._parent_id = sp.department_id AND en_dept_l._locale = 'en'
    WHERE sp.id = $1 AND sp._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatServicePackage(row: any): string {
  const parts: string[] = []
  if (row.title)           parts.push(`Package: ${row.title}`)
  if (row.department_name) parts.push(`Department: ${row.department_name}`)
  if (row.price_label)     parts.push(`Price: ${row.price_label}`)
  const desc = lexicalToText(row.description)
  if (desc) parts.push(`Description: ${desc}`)
  return parts.join('\n')
}
