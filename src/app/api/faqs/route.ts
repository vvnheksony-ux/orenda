import { NextResponse } from 'next/server'
import { getRawPool } from '@/lib/db'
import { lexicalToText } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const limit  = parseInt(searchParams.get('limit') || '50', 10)

  try {
    const pool = getRawPool()

    const { rows } = await pool.query(`
      SELECT
        f.id, f.category, f."order",
        COALESCE(fl.question, enfl.question) AS question,
        COALESCE(fl.answer, enfl.answer)     AS answer
      FROM payload.faqs f
      LEFT JOIN payload.faqs_locales fl    ON fl._parent_id = f.id AND fl._locale = $1
      LEFT JOIN payload.faqs_locales enfl  ON enfl._parent_id = f.id AND enfl._locale = 'en'
      WHERE f.status = 'published'
      ORDER BY f."order"
      LIMIT $2
    `, [locale, limit])

    const faqs = rows.map((row: any) => ({
      id:       String(row.id),
      question: row.question ?? '',
      answer:   lexicalToText(row.answer),
      category: row.category ?? '',
      order:    row.order ?? 0,
    }))

    return NextResponse.json(faqs, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
    })
  } catch (err: any) {
    console.error('faqs:', err.message)
    return NextResponse.json([])
  }
}
