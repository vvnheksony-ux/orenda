import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const locale = new URL(req.url).searchParams.get('locale') || 'en'
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, content, author')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) return NextResponse.json({ docs: [], error: error.message })
    return NextResponse.json({ docs: data ?? [] }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } })
  } catch (err) {
    console.error('testimonials catch:', err)
    return NextResponse.json({ docs: [] })
  }
}
