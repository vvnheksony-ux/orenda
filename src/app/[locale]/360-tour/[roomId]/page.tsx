'use client'

import { Maximize2, X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import SiteLayout from '@/components/layout/SiteLayout'
import ThreeSixtyViewer from '@/components/shared/ThreeSixtyViewer'
import { Link } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { fetchTourScenes, tourCache, type TourScene } from '@/lib/tour-cache'

function OtherRoomCard({ scene, active }: { scene: TourScene; active: boolean }) {
  return (
    <Link
      href={`/360-tour/${scene.sceneNumber}` as any}
      className={`group flex flex-col overflow-hidden rounded-[16px] transition-all ${active ? 'ring-2 ring-[#b89148]' : 'hover:shadow-[0px_8px_32px_rgba(184,145,72,0.2)]'}`}
      style={{ boxShadow: '0px 4px 16px rgba(122,95,44,0.10)' }}
    >
      <div className="relative h-[160px] bg-[#f0ebe0] overflow-hidden">
        {scene.thumbnailUrl ? (
          <Image
            src={scene.thumbnailUrl}
            alt={scene.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="280px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#ead6a4]/40 to-[#f0ebe0] flex items-center justify-center">
            <span className="font-cormorant text-[40px] text-[#b89148]/30">360°</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-[12px] left-[12px] size-[28px] rounded-full bg-white/90 flex items-center justify-center">
          <span className="font-dm-sans text-[10px] font-bold text-[#3b2d17]">360</span>
        </div>
        {active && (
          <div className="absolute top-[10px] right-[10px] px-[8px] py-[4px] bg-[#b89148] rounded-full font-dm-sans text-[11px] text-white font-medium">
            Current
          </div>
        )}
      </div>
      <div className="bg-white p-[16px]">
        <p className="font-dm-sans font-medium text-[14px] text-[#3b2d17] line-clamp-2 leading-[1.4]">{scene.title}</p>
      </div>
    </Link>
  )
}

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)
  const locale = useLocale()

  const [scene, setScene] = useState<TourScene | null>(() =>
    tourCache[locale]?.find(s => String(s.sceneNumber) === roomId) ?? null
  )
  const [allScenes, setAllScenes] = useState<TourScene[]>(() => tourCache[locale] ?? [])
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(() => !tourCache[locale]?.length)

  useEffect(() => {
    fetchTourScenes(locale).then(scenes => {
      setAllScenes(scenes)
      const found = scenes.find(s => String(s.sceneNumber) === roomId)
      setScene(found ?? null)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [locale, roomId])

  const panorama = scene?.panoramaUrl || scene?.thumbnailUrl || '/images/360-page-banner.jpg'
  const descParts = (scene?.description || '').split('\n\n').filter(Boolean)
  const otherScenes = allScenes.filter(s => String(s.sceneNumber) !== roomId)

  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full min-h-screen">
        <div className="max-w-[1512px] mx-auto w-full px-4 sm:px-8 lg:px-[80px] pt-[100px] lg:pt-[212px] pb-[120px] flex flex-col gap-[64px]">

          {/* Back nav */}
          <div className="w-full">
            <Link
              href="/360-tour"
              className="inline-flex items-center gap-[8px] font-dm-sans text-[14px] text-[#7a5f2c] hover:text-[#3b2d17] transition-colors group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
              Back to 360° Tour
            </Link>
          </div>

          {loading && (
            <div className="flex flex-col gap-[32px]">
              <div className="h-[600px] rounded-[24px] bg-[#f0ebe0] animate-pulse" />
              <div className="h-[120px] rounded-[16px] bg-[#f0ebe0] animate-pulse" />
            </div>
          )}

          {!loading && !scene && (
            <div className="flex flex-col items-center justify-center py-[120px] gap-[24px]">
              <p className="font-cormorant text-[40px] text-[#3b2d17] font-semibold">Room not found</p>
              <Link href="/360-tour" className="font-dm-sans text-[#b89148] underline text-[16px]">
                Browse all rooms →
              </Link>
            </div>
          )}

          {!loading && scene && (
            <>
              {/* Hero section: viewer + info card side by side */}
              <div className="flex flex-col xl:flex-row gap-[32px] items-stretch w-full">

                {/* 360° Viewer */}
                <div className="relative flex-1 min-w-0 rounded-[24px] overflow-hidden bg-[#1a1410]" style={{ minHeight: 520 }}>
                  <ThreeSixtyViewer src={panorama} />

                  {/* Fullscreen button */}
                  <button
                    onClick={() => setExpanded(true)}
                    className="absolute bottom-[20px] right-[20px] z-20 flex items-center gap-[8px] px-[16px] h-[44px] rounded-full bg-black/50 backdrop-blur hover:bg-black/70 transition-colors border border-white/20"
                  >
                    <Maximize2 size={16} className="text-white" />
                    <span className="font-dm-sans text-[13px] text-white font-medium">Fullscreen</span>
                  </button>

                  {/* 360 badge */}
                  <div className="absolute top-[20px] left-[20px] z-10 flex items-center gap-[6px] px-[12px] h-[32px] rounded-full bg-black/50 backdrop-blur border border-white/20">
                    <span className="font-dm-sans text-[12px] text-white font-bold tracking-widest">360°</span>
                  </div>
                </div>

                {/* Info card */}
                <div className="xl:w-[380px] shrink-0 flex flex-col gap-[28px]">
                  <div className="bg-white rounded-[20px] p-[32px] flex flex-col gap-[24px] h-full"
                    style={{ boxShadow: '0px 4px 24px rgba(122,95,44,0.12)' }}>

                    <div className="flex flex-col gap-[8px]">
                      <div className="flex items-center gap-[8px]">
                        <div className="size-[6px] rounded-full bg-[#b89148]" />
                        <p className="font-dm-sans text-[12px] text-[#b89148] font-semibold uppercase tracking-widest">Virtual Tour</p>
                      </div>
                      <h1 className="font-cormorant font-bold text-[36px] text-[#3b2d17] leading-[1.1]">
                        {scene.title}
                      </h1>
                    </div>

                    <div className="h-[1px] w-full bg-[#e8dcc8]" />

                    <div className="flex-1 font-dm-sans text-[15px] text-[#594522] leading-[1.8]">
                      {descParts.length > 0 ? (
                        descParts.map((p, i) => <p key={i} className="mb-[16px] last:mb-0">{p}</p>)
                      ) : (
                        <p>Experience our {scene.title} in immersive 360° — drag to explore every corner of this space at Orienda Hospital.</p>
                      )}
                    </div>

                    <div className="h-[1px] w-full bg-[#e8dcc8]" />

                    <div className="flex flex-col gap-[12px]">
                      <p className="font-dm-sans text-[12px] font-semibold text-[#7a5f2c] uppercase tracking-widest">How to explore</p>
                      <div className="flex flex-col gap-[8px]">
                        {[
                          { icon: '🖱', text: 'Click and drag to pan the view' },
                          { icon: '🔍', text: 'Scroll to zoom in and out' },
                          { icon: '⛶', text: 'Use fullscreen for best experience' },
                        ].map(({ icon, text }) => (
                          <div key={text} className="flex items-center gap-[10px]">
                            <span className="text-[16px] shrink-0">{icon}</span>
                            <p className="font-dm-sans text-[13px] text-[#594522]">{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/appointments"
                      className="w-full h-[48px] bg-[#b89148] hover:bg-[#c8a25a] transition-colors rounded-[12px] flex items-center justify-center font-dm-sans text-[15px] text-white font-medium"
                    >
                      Book a Visit
                    </Link>
                  </div>
                </div>
              </div>

              {/* Other rooms */}
              {otherScenes.length > 0 && (
                <div className="flex flex-col gap-[40px]">
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-[8px]">
                      <h2 className="font-cormorant font-bold text-[42px] text-[#3b2d17] leading-none">Explore Other Rooms</h2>
                      <div className="w-[48px] h-[2px] bg-[#b89148] rounded-full" />
                    </div>
                    <Link
                      href="/360-tour"
                      className="font-dm-sans text-[14px] text-[#b89148] hover:text-[#7a5f2c] transition-colors flex items-center gap-[4px]"
                    >
                      View all <ChevronRight size={14} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[20px]">
                    {otherScenes.slice(0, 10).map(s => (
                      <OtherRoomCard key={s.id} scene={s} active={false} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Fullscreen modal */}
      {expanded && scene && (
        <div
          className="fixed inset-0 z-[200] bg-black flex flex-col"
          onClick={() => setExpanded(false)}
        >
          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-between px-[24px] h-[64px] bg-black/60 backdrop-blur shrink-0" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-[12px]">
              <span className="font-dm-sans text-[11px] font-bold text-white/60 uppercase tracking-widest">360° Tour</span>
              <span className="w-[1px] h-[16px] bg-white/20" />
              <p className="font-cormorant font-semibold text-[22px] text-white leading-none">{scene.title}</p>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="size-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Viewer */}
          <div className="flex-1 relative" onClick={e => e.stopPropagation()}>
            <ThreeSixtyViewer src={panorama} />
          </div>
        </div>
      )}
    </SiteLayout>
  )
}
