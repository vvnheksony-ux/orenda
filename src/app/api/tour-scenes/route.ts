import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/payload-api'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const locale = (new URL(req.url).searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'

  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'tourScenes',
      locale, fallbackLocale: 'en',
      overrideAccess: true,
      depth: 1,
      sort: 'sceneNumber',
      limit: 15,
    } as any)

    const scenes = (data.docs || []).map((doc: any) => {
      const panorama = mediaUrl(doc.thumbnailImage)
      return {
        id:           String(doc.id),
        sceneNumber:  doc.sceneNumber ?? 0,
        title:        doc.title ?? '',
        description:  doc.description ?? '',
        thumbnailUrl: panorama,
        panoramaUrl:  panorama,
        hotspots: (doc.hotspots ?? []).map((h: any) => ({
          pitch: h.pitch, yaw: h.yaw, label: h.label ?? '', description: h.description ?? '',
        })),
      }
    })

    return NextResponse.json(scenes, { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } })
  } catch (err: any) {
    console.error('tour-scenes:', err.message)
    return NextResponse.json([])
  }
}
