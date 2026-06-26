import { lexicalToText } from '@/lib/payload-api'

export async function fetchCareer(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      c.id, c.career_employment_type, c.experience_level, c.application_deadline,
      COALESCE(cl.title, encl.title)                             AS title,
      COALESCE(cl.position, encl.position)                       AS position,
      COALESCE(cl.excerpt, encl.excerpt)                         AS excerpt,
      COALESCE(cl.body, encl.body)                               AS body,
      COALESCE(cl.salary_range, encl.salary_range)               AS salary_range,
      COALESCE(cl.career_requirements, encl.career_requirements) AS career_requirements,
      COALESCE(cl.responsibilities, encl.responsibilities)       AS responsibilities,
      COALESCE(dept_l.name, en_dept_l.name)                      AS department_name
    FROM payload.careers c
    LEFT JOIN payload.careers_locales cl        ON cl._parent_id = c.id AND cl._locale = $2
    LEFT JOIN payload.careers_locales encl      ON encl._parent_id = c.id AND encl._locale = 'en'
    LEFT JOIN payload.departments_locales dept_l    ON dept_l._parent_id = c.career_department_id AND dept_l._locale = $2
    LEFT JOIN payload.departments_locales en_dept_l ON en_dept_l._parent_id = c.career_department_id AND en_dept_l._locale = 'en'
    WHERE c.id = $1 AND c._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatCareer(row: any): string {
  const parts: string[] = []
  if (row.position || row.title) parts.push(`Position: ${row.position ?? row.title}`)
  if (row.department_name)       parts.push(`Department: ${row.department_name}`)
  if (row.career_employment_type) parts.push(`Employment Type: ${row.career_employment_type}`)
  if (row.experience_level)      parts.push(`Experience Level: ${row.experience_level}`)
  if (row.salary_range)          parts.push(`Salary Range: ${row.salary_range}`)
  if (row.application_deadline)  parts.push(`Application Deadline: ${row.application_deadline}`)
  if (row.excerpt)               parts.push(`Summary: ${row.excerpt}`)
  const requirements = lexicalToText(row.career_requirements)
  if (requirements) parts.push(`Requirements: ${requirements}`)
  const responsibilities = lexicalToText(row.responsibilities)
  if (responsibilities) parts.push(`Responsibilities: ${responsibilities}`)
  const body = lexicalToText(row.body)
  if (body) parts.push(`Details: ${body}`)
  return parts.join('\n')
}
