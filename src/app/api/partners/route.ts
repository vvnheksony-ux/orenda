import { NextResponse } from 'next/server'
import { payloadFetch, mediaUrl } from '@/lib/payload-api'
export const runtime = 'nodejs'

// Expected Payload fields: name (text), logo (media upload)
export async function GET(req: Request) {
  const locale = new URL(req.url).searchParams.get('locale') || 'en'
  try {
    const data = await payloadFetch(`/payload-api/partners?locale=${locale}&depth=1&limit=50`)
    const docs = (data.docs || []).map((doc: any) => ({
      id: String(doc.id),
      name: doc.name ?? '',
      logo: mediaUrl(doc.logo) ?? null,
    }))
    return NextResponse.json({ docs }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } })
  } catch {
    return NextResponse.json({ docs: [] })
  }
}
