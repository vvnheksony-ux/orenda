'use client'

import { Maximize2, X, ArrowLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import SiteLayout from '@/components/layout/SiteLayout'
import ThreeSixtyViewer from '@/components/shared/ThreeSixtyViewer'
import { Link, useRouter } from '@/i18n/routing'
import { useScrollLock } from '@/lib/useScrollLock'
import { useLocale } from 'next-intl'
import { fetchTourScenes, type TourScene } from '@/lib/tour-cache'
import { useBranch } from '@/lib/branch-context'
import { useAnalytics } from '@/lib/use-analytics'

type Doctor = { id: number; name: string; specialty: string; image_url: string | null; slug: string }

function DoctorCard({ doc }: { doc: Doctor }) {
  return (
    <div className="relative flex h-[260px] w-full max-w-[168px] flex-col items-center justify-center gap-[18px] overflow-clip rounded-[16px] bg-[var(--background)] shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] sm:h-[330px] sm:max-w-[240px] sm:gap-[24px] lg:h-[400px] lg:max-w-[300px] lg:gap-[40px]">
      {/* Gold gradient header */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[110px] w-full -translate-x-1/2 opacity-64 sm:h-[165px] lg:h-[206px]"
        style={{ backgroundImage: 'linear-gradient(133.36deg,rgba(234,214,164,0.6) 0%,rgba(206,175,112,0.827) 25%,rgba(184,145,72,0.8) 49.52%,rgba(210,181,120,0.792) 75.96%,rgba(234,214,164,0.6) 100%)' }}
      />
      {/* Circle photo */}
      <div className="relative z-10 size-[84px] shrink-0 overflow-hidden rounded-full bg-[var(--background)] shadow-[0px_4px_30px_12px_rgba(184,145,72,0.2)] sm:size-[118px] lg:size-[146px]">
        <Image
          src={doc.image_url || '/images/doctor-1.jpg'}
          alt={doc.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 84px, (max-width: 1024px) 118px, 146px"
          unoptimized
        />
      </div>
      {/* Info */}
      <div className="z-10 flex shrink-0 flex-col items-center gap-[10px] px-[10px] sm:gap-[14px] sm:px-[16px]">
        <div className="flex flex-col items-center gap-[6px] text-center sm:gap-[10px]">
          <p className="w-full max-w-[140px] font-cormorant text-[16px] font-bold leading-tight capitalize text-[#3b2d17] sm:max-w-[180px] sm:text-[20px] lg:max-w-[217px] lg:text-[22px]">{doc.name}</p>
          <p className="w-full max-w-[132px] text-center font-dm-sans text-[11px] leading-tight text-[#3b2d17] sm:max-w-[160px] sm:text-[13px] lg:max-w-[186px] lg:text-[15px]">{doc.specialty}</p>
        </div>
        <Link
          href={`/doctors/${doc.slug || doc.id}` as any}
          className="flex h-[28px] w-[110px] items-center justify-center rounded-[10px] bg-[#b89148] px-[12px] shadow-[0px_2px_6px_6px_rgba(0,0,0,0.05)] sm:h-[30px] sm:w-[130px] lg:h-[32px] lg:w-[145px]"
        >
          <span className="text-center font-dm-sans text-[11px] text-[#fbf7ee] sm:text-[12px]">View Profile</span>
        </Link>
      </div>
    </div>
  )
}

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)
  const locale = useLocale()
  const router = useRouter()
  const { trackTourView } = useAnalytics()
  const { selectedBranch, ready } = useBranch()

  const [scene, setScene] = useState<TourScene | null>(null)
  const [expanded, setExpanded] = useState(false)
  // Lock background scroll while the fullscreen viewer is open.
  useScrollLock(expanded)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(true)
  const [doctors, setDoctors] = useState<Doctor[]>([])

  useEffect(() => {
    if (!ready) return
    let active = true
    setLoading(true)
    fetchTourScenes(locale, selectedBranch?.id).then(scenes => {
      if (!active) return
      const found = scenes.find(s => String(s.sceneNumber) === roomId)
      setScene(found ?? null)
    }).catch(() => {}).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [locale, roomId, selectedBranch, ready])

  useEffect(() => {
    fetch(`/api/doctors?locale=${locale}&limit=4`)
      .then(r => r.json())
      .then((data: any[]) => { if (Array.isArray(data)) setDoctors(data.slice(0, 4)) })
      .catch(() => {})
  }, [locale])

  const panorama = scene?.panoramaUrl || scene?.thumbnailUrl || '/images/360-page-banner.jpg'
  const descParts = (scene?.description || '').split('\n\n').filter(Boolean)

  const handleHotspotClick = (targetSceneNumber: number | null) => {
    if (targetSceneNumber == null) return
    trackTourView(targetSceneNumber)
    setExpanded(false)
    router.push(`/360-tour/${targetSceneNumber}` as any)
  }

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full min-h-screen">
        <div className="page-shell pt-[100px] lg:pt-[140px] pb-[120px] flex flex-col gap-[67px]">

          {/* Back nav */}
          <Link
            href="/360-tour"
            className="inline-flex items-center gap-[8px] font-dm-sans text-[14px] text-[#7a5f2c] hover:text-[#3b2d17] transition-colors group w-fit"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            Back to 360° Tour
          </Link>

          {loading && (
            <div className="flex flex-col gap-[40px]">
              <div className="h-[598px] rounded-[24px] bg-[#f0ebe0] animate-pulse" />
              <div className="flex flex-col gap-[24px] items-center">
                <div className="h-[52px] w-[400px] rounded-lg bg-[#e8d9b8] animate-pulse" />
                <div className="h-[200px] w-full max-w-[1346px] rounded-lg bg-[#e8d9b8] animate-pulse" />
              </div>
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
              {/* Full-width 360° banner */}
              <div
                className="relative w-full h-[598px] rounded-[24px] overflow-hidden bg-[#1a1410]"
                onDoubleClick={() => setLocked(false)}
              >
                <ThreeSixtyViewer
                  src={panorama}
                  interactive={!locked}
                  hotspots={!locked ? scene.hotspots : undefined}
                  onHotspotClick={handleHotspotClick}
                />

                {/* Lock overlay — subtle dark tint with hint */}
                {locked && (
                  <div className="absolute inset-0 z-30 bg-black/50 flex flex-col items-center justify-center gap-[16px] select-none backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-[12px]">
                      <span className="font-dm-sans text-[48px] text-white/90 font-bold tracking-widest">360°</span>
                      <p className="font-dm-sans text-[16px] text-white/70 tracking-wide">Double-click to explore</p>
                    </div>
                  </div>
                )}

                {/* 360 badge */}
                {!locked && (
                  <div className="absolute top-[20px] left-[20px] z-10 flex items-center gap-[6px] px-[12px] h-[32px] rounded-full bg-black/50 backdrop-blur border border-white/20">
                    <span className="font-dm-sans text-[12px] text-white font-bold tracking-widest">360°</span>
                  </div>
                )}

                {/* Expand button bottom-right */}
                {!locked && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="absolute bottom-[24px] right-[24px] z-20 size-[60px] rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-[0px_4px_16px_rgba(122,95,44,0.25)] flex items-center justify-center border border-white/60"
                    aria-label="Expand fullscreen"
                  >
                    <Maximize2 size={22} className="text-[#3b2d17]" strokeWidth={1.5} />
                  </button>
                )}
              </div>

              {/* Title + description */}
              <div className="flex flex-col items-center gap-[40px] w-full">
                <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none text-center">
                  {scene.title}
                </h1>
                <div className="font-dm-sans text-[20px] text-[#3b2d17] leading-[1.8] max-w-[1346px] w-full">
                  {descParts.length > 0 ? (
                    descParts.map((p, i) => (
                      <p key={i} className={i < descParts.length - 1 ? 'mb-[32px]' : ''}>{p}</p>
                    ))
                  ) : (
                    <p>Experience our {scene.title} in immersive 360° — drag to explore every corner of this space at Orienda Hospital.</p>
                  )}
                </div>
              </div>

              {/* Meet Our Specialist */}
              {doctors.length > 0 && (
                <div className="flex flex-col gap-[40px] items-center w-full">
                  {/* Heading */}
                  <div className="flex flex-col gap-[12px] items-center text-center">
                    <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">
                      Meet Our Specialist
                    </h2>
                    <p className="font-dm-sans text-[20px] text-[#594522]">
                      Meet Our Specialists in This Department
                    </p>
                  </div>

                  {/* Doctor cards grid */}
                  <div className="grid w-full grid-cols-2 justify-items-center gap-[12px] sm:gap-[20px] md:grid-cols-4 lg:gap-[40px]">
                    {doctors.map(doc => (
                      <DoctorCard key={doc.id} doc={doc} />
                    ))}
                  </div>

                  {/* See More */}
                  <Link
                    href="/doctors"
                    className="flex items-center gap-[4px] border border-[#b89148] h-[32px] px-[12px] rounded-[12px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)] w-[145px] justify-center group"
                  >
                    <span className="font-dm-sans text-[12px] text-[#5c4924]">See More</span>
                    <ChevronRight size={14} className="text-[#5c4924] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
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
          <div className="flex-1 relative" onClick={e => e.stopPropagation()}>
            <ThreeSixtyViewer src={panorama} hotspots={scene.hotspots} onHotspotClick={handleHotspotClick} />
          </div>
        </div>
      )}
    </SiteLayout>
  )
}
