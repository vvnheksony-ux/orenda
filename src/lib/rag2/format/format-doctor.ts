import { lexicalToText } from '@/lib/payload-api'

export async function fetchDoctor(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows: main } = await pool.query(`
    SELECT
      doc.id, doc.phone, doc.email, doc.sex, doc.nationality,
      doc.position_title, doc.employment_type, doc.doctor_number,
      doc.total_clinical_experience_years, doc.specialist_experience_years,
      COALESCE(dl.name, endll.name)           AS name,
      COALESCE(dl.specialty, endll.specialty) AS specialty,
      COALESCE(dl.bio, endll.bio)             AS bio
    FROM payload.doctors doc
    LEFT JOIN payload.doctors_locales dl    ON dl._parent_id = doc.id AND dl._locale = $2
    LEFT JOIN payload.doctors_locales endll ON endll._parent_id = doc.id AND endll._locale = 'en'
    WHERE doc.id = $1 AND doc._status = 'published'
    LIMIT 1
  `, [docId, locale])
  if (!main[0]) return null
  const row = main[0]

  const [{ rows: langs }, { rows: edu }, { rows: dept }] = await Promise.all([
    pool.query(`SELECT name FROM payload.doctors_languages WHERE _parent_id = $1 ORDER BY _order`, [docId]),
    pool.query(`SELECT description FROM payload.doctors_education WHERE _parent_id = $1 ORDER BY _order`, [docId]),
    pool.query(`
      SELECT dl.name FROM payload.doctors doc
      LEFT JOIN payload.departments_locales dl ON dl._parent_id = doc.department_id AND dl._locale = 'en'
      WHERE doc.id = $1 LIMIT 1
    `, [docId]),
  ])

  return {
    ...row,
    languages: langs.map((l: any) => l.name).filter(Boolean),
    education: edu.map((e: any) => e.description).filter(Boolean),
    department: dept[0]?.name ?? '',
  }
}

export function formatDoctor(row: any): string {
  const parts: string[] = []
  if (row.name)        parts.push(`Doctor: ${row.name}`)
  if (row.specialty)   parts.push(`Specialty: ${row.specialty}`)
  if (row.department)  parts.push(`Department: ${row.department}`)
  const bio = lexicalToText(row.bio)
  if (bio)             parts.push(`Bio: ${bio}`)
  if (row.doctor_number) parts.push(`Doctor Number: ${row.doctor_number}`)
  if (row.phone)       parts.push(`Phone: ${row.phone}`)
  if (row.email)       parts.push(`Email: ${row.email}`)
  if (row.sex)         parts.push(`Sex: ${row.sex}`)
  if (row.nationality) parts.push(`Nationality: ${row.nationality}`)
  if (row.position_title)  parts.push(`Position: ${row.position_title}`)
  if (row.employment_type) parts.push(`Employment Type: ${row.employment_type}`)
  if (row.total_clinical_experience_years) parts.push(`Clinical Experience: ${row.total_clinical_experience_years} years`)
  if (row.specialist_experience_years)     parts.push(`Specialist Experience: ${row.specialist_experience_years} years`)
  if (row.languages?.length) parts.push(`Languages: ${row.languages.join(', ')}`)
  if (row.education?.length) parts.push(`Education: ${row.education.join(' | ')}`)
  return parts.join('\n')
}
