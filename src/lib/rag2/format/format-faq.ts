import { lexicalToText } from '@/lib/payload-api'

export async function fetchFaq(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      f.id, f.category,
      COALESCE(fl.question, enfl.question) AS question,
      COALESCE(fl.answer, enfl.answer)     AS answer
    FROM payload.faqs f
    LEFT JOIN payload.faqs_locales fl    ON fl._parent_id = f.id AND fl._locale = $2
    LEFT JOIN payload.faqs_locales enfl  ON enfl._parent_id = f.id AND enfl._locale = 'en'
    WHERE f.id = $1 AND f._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatFaq(row: any): string {
  const parts: string[] = []
  if (row.question) parts.push(`Question: ${row.question}`)
  const answer = lexicalToText(row.answer)
  if (answer) parts.push(`Answer: ${answer}`)
  if (row.category) parts.push(`Category: ${row.category}`)
  return parts.join('\n')
}
