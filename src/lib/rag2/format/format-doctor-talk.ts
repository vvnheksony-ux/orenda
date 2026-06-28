import { lexicalToText } from '@/lib/payload-api'

export async function fetchDoctorTalk(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      dt.id, dt.meeting_link, dt.event_date,
      COALESCE(dtl.title, endtl.title)           AS title,
      COALESCE(dtl.talk_topic, endtl.talk_topic) AS talk_topic,
      COALESCE(dtl.excerpt, endtl.excerpt)       AS excerpt,
      COALESCE(dtl.body, endtl.body)             AS body,
      doc_l.name     AS doctor_name,
      doc_l.specialty AS doctor_specialty
    FROM payload.doctor_talks dt
    LEFT JOIN payload.doctor_talks_locales dtl    ON dtl._parent_id = dt.id AND dtl._locale = $2
    LEFT JOIN payload.doctor_talks_locales endtl  ON endtl._parent_id = dt.id AND endtl._locale = 'en'
    LEFT JOIN payload.doctors doc ON doc.id = dt.featured_doctor_id
    LEFT JOIN payload.doctors_locales doc_l ON doc_l._parent_id = doc.id AND doc_l._locale = 'en'
    WHERE dt.id = $1 AND dt._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatDoctorTalk(row: any): string {
  const parts: string[] = []
  if (row.title)            parts.push(`Doctor Talk: ${row.title}`)
  if (row.talk_topic)       parts.push(`Topic: ${row.talk_topic}`)
  if (row.doctor_name)      parts.push(`Speaker: ${row.doctor_name}`)
  if (row.doctor_specialty) parts.push(`Specialty: ${row.doctor_specialty}`)
  if (row.event_date)       parts.push(`Date: ${row.event_date}`)
  if (row.meeting_link)     parts.push(`Link: ${row.meeting_link}`)
  if (row.excerpt)          parts.push(`Summary: ${row.excerpt}`)
  const body = lexicalToText(row.body)
  if (body) parts.push(`Details: ${body}`)
  return parts.join('\n')
}
