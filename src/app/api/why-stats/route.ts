import { NextResponse } from 'next/server'
import { payloadFetch } from '@/lib/payload-api'
export const runtime = 'nodejs'

// Expected Payload fields: value (text), label (text, localized), body (text, localized)
export async function GET(req: Request) {
  const locale = new URL(req.url).searchParams.get('locale') || 'en'
  try {
    const data = await payloadFetch(`/payload-api/whyStats?locale=${locale}&depth=0&sort=order&limit=10`)
    const docs = (data.docs || []).map((doc: any) => ({
      id: String(doc.id),
      value: doc.value ?? '',
      label: doc.label ?? '',
      body: doc.body ?? '',
    }))
    return NextResponse.json({ docs }, { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } })
  } catch {
    return NextResponse.json({ docs: [] })
  }
}
