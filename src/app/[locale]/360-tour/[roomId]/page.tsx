'use client'

import { Maximize2, ArrowLeft } from 'lucide-react'
import { useState, useEffect, use } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'
import ThreeSixtyViewer from '@/components/shared/ThreeSixtyViewer'
import { Link } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { fetchTourScenes, tourCache, type TourScene } from '@/lib/tour-cache'

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)
  const locale = useLocale()

  const [scene, setScene] = useState<TourScene | null>(() =>
    tourCache[locale]?.find(s => String(s.sceneNumber) === roomId) ?? null
  )
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(() => !tourCache[locale]?.length)

  useEffect(() => {
    fetchTourScenes(locale).then(scenes => {
      const found = scenes.find(s => String(s.sceneNumber) === roomId)
      setScene(found ?? null)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [locale, roomId])

  if (loading) {
    return (
      <SiteLayout>
        <div className="bg-[#fbf7ee] w-full min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#b89148] border-t-transparent rounded-full animate-spin" />
        </div>
      </SiteLayout>
    )
  }

  if (!scene) {
    return (
      <SiteLayout>
        <div className="bg-[#fbf7ee] w-full min-h-screen flex flex-col items-center justify-center gap-4 pt-[120px]">
          <p className="font-cormorant text-[32px] text-[#3b2d17]">Room not found</p>
          <Link href="/360-tour" className="font-dm-sans text-[#b89148] underline">Back to 360 Tour</Link>
        </div>
      </SiteLayout>
    )
  }

  const panorama = scene.panoramaUrl || scene.thumbnailUrl || '/images/360-page-banner.jpg'
  const descParts = (scene.description || '').split('\n\n').filter(Boolean)

  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="max-w-[1512px] mx-auto w-full flex flex-col gap-[80px] items-center pb-[120px] px-4 sm:px-8 lg:px-[80px] pt-[100px] lg:pt-[212px]">

          {/* Back button */}
          <div className="w-full">
            <Link
              href="/360-tour"
              className="inline-flex items-center gap-[8px] font-dm-sans text-[14px] text-[#7a5f2c] hover:text-[#3b2d17] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to 360 Tour
            </Link>
          </div>

          {/* 360 Viewer Banner */}
          <div
            className="relative w-full rounded-[24px] overflow-hidden shrink-0"
            style={{ height: 598 }}
          >
            <ThreeSixtyViewer src={panorama} />
            <button
              onClick={() => setExpanded(true)}
              className="absolute bottom-[24px] right-[24px] z-20 size-[60px] rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <Maximize2 size={24} className="text-[#3b2d17]" />
            </button>
          </div>

          {/* Title + description */}
          <div className="flex flex-col items-center gap-[40px] w-full max-w-[1351px] mx-auto">
            <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none text-center w-full">
              {scene.title}
            </h1>
            <div className="font-dm-sans font-normal text-[24px] text-black w-full">
              {descParts.length ? descParts.map((p, i) => (
                <p key={i} className="leading-[1.8] mb-[32px] last:mb-0">{p}</p>
              )) : (
                <p className="leading-[1.8] text-[#594522]">Experience our {scene.title} in immersive 360°.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Full-screen modal */}
      {expanded && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setExpanded(false)}>
          <div className="relative w-[95vw] h-[90vh] rounded-[16px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <ThreeSixtyViewer src={panorama} />
            <button onClick={() => setExpanded(false)} className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 text-xl">✕</button>
            <div className="absolute top-4 left-4 z-10 bg-black/50 px-4 py-2 rounded-[8px]">
              <p className="font-dm-sans text-white text-[16px]">{scene.title}</p>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  )
}
