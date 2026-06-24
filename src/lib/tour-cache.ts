export interface TourHotspot {
  pitch: number
  yaw: number
  label?: string
  description?: string
  // When set, clicking this hotspot navigates to the room with this sceneNumber.
  targetSceneNumber?: number | null
}

export interface TourScene {
  id: string
  sceneNumber: number
  title: string
  description: string
  roomGroup?: string | null
  thumbnailUrl: string | null
  panoramaUrl: string | null
  hotspots?: TourHotspot[]
}

// Module-level cache — persists across client-side navigations for the session
export const tourCache: Record<string, TourScene[]> = {}

export async function fetchTourScenes(locale: string, branchId?: string | null): Promise<TourScene[]> {
  // Cache per locale+branch — scenes are branch-specific, so a shared key would
  // serve the wrong branch's scenes after switching.
  const key = branchId ? `${locale}:${branchId}` : locale
  if (tourCache[key]?.length) return tourCache[key]
  const qs = branchId ? `locale=${locale}&branch=${branchId}` : `locale=${locale}`
  const res = await fetch(`/api/tour-scenes?${qs}`)
  const data = await res.json()
  const scenes: TourScene[] = Array.isArray(data) ? data : []
  if (scenes.length) {
    tourCache[key] = scenes
    // Preload all panoramas in background so room pages are instant
    scenes.forEach(s => {
      const url = s.panoramaUrl || s.thumbnailUrl
      if (url && typeof window !== 'undefined') {
        const img = new window.Image()
        img.src = url
      }
    })
  }
  return scenes
}
