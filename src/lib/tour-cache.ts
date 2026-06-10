export interface TourScene {
  id: string
  sceneNumber: number
  title: string
  description: string
  thumbnailUrl: string | null
  panoramaUrl: string | null
}

// Module-level cache — persists across client-side navigations for the session
export const tourCache: Record<string, TourScene[]> = {}

export async function fetchTourScenes(locale: string): Promise<TourScene[]> {
  if (tourCache[locale]?.length) return tourCache[locale]
  const res = await fetch(`/api/tour-scenes?locale=${locale}`)
  const data = await res.json()
  const scenes: TourScene[] = Array.isArray(data) ? data : []
  if (scenes.length) {
    tourCache[locale] = scenes
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
