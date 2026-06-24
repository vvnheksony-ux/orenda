import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const locale = url.searchParams.get('locale') || 'en'
  const branch = url.searchParams.get('branch')
  // tour_scenes is branch-linked (optional): show this branch's scenes + global
  // (no-branch) scenes. A strict equality filter would hide the global ones.
  const params: string[] = [locale]
  let branchClause = ''
  if (branch) {
    params.push(branch)
    branchClause = `AND (ts.branch_id IS NULL OR ts.branch_id = $${params.length}::int)`
  }

  try {
    const pool = getRawPool()

    const { rows: scenes } = await pool.query(`
      SELECT
        ts.id, ts.scene_number, ts.room_group,
        COALESCE(tsl.title, entsl.title)             AS title,
        COALESCE(tsl.description, entsl.description) AS description,
        m.filename AS thumb_filename, m.prefix AS thumb_prefix
      FROM payload.tour_scenes ts
      LEFT JOIN payload.tour_scenes_locales tsl
        ON tsl._parent_id = ts.id AND tsl._locale = $1
      LEFT JOIN payload.tour_scenes_locales entsl
        ON entsl._parent_id = ts.id AND entsl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = ts.thumbnail_image_id
      WHERE ts.status = 'published' ${branchClause}
      ORDER BY ts.scene_number
      LIMIT 15
    `, params)

    if (!scenes.length) {
      return NextResponse.json([])
    }

    const ids = scenes.map((s: any) => s.id)

    const { rows: hotspotRows } = await pool.query(`
      SELECT
        tsh._parent_id AS scene_id, tsh._order,
        tsh.pitch, tsh.yaw,
        tgt.scene_number AS target_scene_number,
        COALESCE(tshl.label, entshl.label)             AS label,
        COALESCE(tshl.description, entshl.description) AS description
      FROM payload.tour_scenes_hotspots tsh
      LEFT JOIN payload.tour_scenes tgt ON tgt.id = tsh.target_scene_id
      LEFT JOIN payload.tour_scenes_hotspots_locales tshl
        ON tshl._parent_id = tsh.id AND tshl._locale = $1
      LEFT JOIN payload.tour_scenes_hotspots_locales entshl
        ON entshl._parent_id = tsh.id AND entshl._locale = 'en'
      WHERE tsh._parent_id = ANY($2)
      ORDER BY tsh._parent_id, tsh._order
    `, [locale, ids])

    const hotspotMap: Record<number, any[]> = {}
    for (const h of hotspotRows) {
      if (!hotspotMap[h.scene_id]) hotspotMap[h.scene_id] = []
      hotspotMap[h.scene_id].push({
        pitch: Number(h.pitch),
        yaw: Number(h.yaw),
        label: h.label ?? '',
        description: h.description ?? '',
        targetSceneNumber: h.target_scene_number != null ? Number(h.target_scene_number) : null,
      })
    }

    const result = scenes.map((s: any) => {
      const panorama = mediaStorageUrl(s.thumb_filename, s.thumb_prefix)
      return {
        id:           String(s.id),
        sceneNumber:  Number(s.scene_number),
        title:        s.title ?? '',
        description:  s.description ?? '',
        roomGroup:    s.room_group ?? null,
        thumbnailUrl: panorama,
        panoramaUrl:  panorama,
        hotspots:     hotspotMap[s.id] ?? [],
      }
    })

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
    })
  } catch (err: any) {
    console.error('tour-scenes:', err.message)
    return NextResponse.json([])
  }
}
