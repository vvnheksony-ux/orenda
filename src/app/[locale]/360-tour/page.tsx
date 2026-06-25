'use client'

import { ArrowRight } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useState, useEffect } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link, useRouter } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import ThreeSixtyViewer from '@/components/shared/ThreeSixtyViewer'
import { fetchTourScenes, type TourScene } from '@/lib/tour-cache'
import { useBranch } from '@/lib/branch-context'
import Reveal from '@/components/shared/Reveal'

type LocalizedHref = ComponentProps<typeof Link>['href']
const tourHref = (sceneNumber: number): LocalizedHref => `/360-tour/${sceneNumber}` as LocalizedHref

// Grid: scenes in sceneNumber order. Middle scene = featured full-width card. All others in rows of 2.
function buildGrid(scenes: TourScene[]) {
  const sorted = [...scenes].sort((a, b) => a.sceneNumber - b.sceneNumber)
  const mid = Math.floor(sorted.length / 2)
  const center = sorted[mid]
  const others = sorted.filter(s => s.id !== center.id)
  const rows: TourScene[][] = []
  for (let i = 0; i < others.length; i += 2) rows.push(others.slice(i, i + 2))
  const splitAt = Math.ceil(rows.length / 2)
  return { rowsBefore: rows.slice(0, splitAt), rowsAfter: rows.slice(splitAt), center }
}

// Group scenes by roomGroup into sub-room sections. Scenes without a group
// fall into an "Other Rooms" section. Returns [] when nothing is grouped.
function buildGroups(scenes: TourScene[], otherRoomsLabel: string) {
  const sorted = [...scenes].sort((a, b) => a.sceneNumber - b.sceneNumber)
  const map = new Map<string, TourScene[]>()
  const ungrouped: TourScene[] = []
  for (const s of sorted) {
    const g = (s.roomGroup ?? '').trim()
    if (g) {
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(s)
    } else {
      ungrouped.push(s)
    }
  }
  const sections = Array.from(map.entries()).map(([name, list]) => ({ name, scenes: list }))
  if (ungrouped.length) sections.push({ name: otherRoomsLabel, scenes: ungrouped })
  return sections
}

function SceneCard({ scene }: { scene: TourScene }) {
  const t = useTranslations('Tour360')
  const src = scene.thumbnailUrl || scene.panoramaUrl || '/images/360-page-banner.jpg'
  return (
    <Link
      href={tourHref(scene.sceneNumber)}
      className="bg-white flex flex-1 flex-col items-center min-w-0 overflow-hidden rounded-3xl group w-full"
      style={{ boxShadow: '0px 4px 30px 12px rgba(138,124,88,0.12)' }}
    >
      {/* Image */}
      <div className="relative h-[280px] sm:h-[clamp(320px,25vw,384px)] w-full bg-zinc-100 shrink-0 overflow-hidden">
        <ThreeSixtyViewer src={src} height="100%" width="100%" interactive={false} />
      </div>
      {/* Footer */}
      <div className="flex flex-1 flex-col sm:flex-row sm:items-end justify-between p-5 sm:p-8 lg:p-10 w-full gap-4">
        <div className="flex flex-col justify-end items-start gap-3 min-w-0">
          <p className="font-cormorant font-bold text-[32px] sm:text-[40px] lg:text-5xl text-[#3b2d17] leading-tight lg:leading-[48px] break-words">{scene.title}</p>
          <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-xl text-[#594522] leading-6 sm:leading-5">{scene.description.split('\n')[0].slice(0, 50)}</p>
        </div>
        <div className="h-12 px-5 py-3.5 rounded-xl outline outline-[1.5px] outline-offset-[-1.5px] outline-[#b89148] flex justify-center items-center gap-1 shrink-0 group-hover:bg-[#b89148] transition-colors">
          <span className="font-dm-sans text-[16px] lg:text-lg text-[#5c4924] px-2 group-hover:text-white transition-colors">{t('learnMore')}</span>
          <ArrowRight size={20} className="text-[#5c4924] group-hover:text-white transition-colors" />
        </div>
      </div>
    </Link>
  )
}

function SceneCardFull({ scene }: { scene: TourScene }) {
  const t = useTranslations('Tour360')
  const src = scene.thumbnailUrl || scene.panoramaUrl || '/images/360-page-banner.jpg'
  return (
    <Link
      href={tourHref(scene.sceneNumber)}
      className="bg-white flex flex-col md:flex-row w-full overflow-hidden rounded-3xl group"
      style={{ boxShadow: '0px 4px 30px 12px rgba(138,124,88,0.12)' }}
    >
      {/* Left: 360° frozen view ~65% width */}
      <div className="relative shrink-0 overflow-hidden rounded-3xl w-full md:w-[65%] h-[280px] sm:h-[360px] md:h-[clamp(420px,35vw,536px)]">
        <ThreeSixtyViewer src={src} height="100%" width="100%" interactive={false} />
      </div>
      {/* Right: info panel */}
      <div className="flex flex-col justify-between p-5 sm:p-8 lg:p-10 flex-1 gap-6">
        <div className="flex flex-col gap-4">
          <p className="font-dm-sans text-[14px] text-[#b89148] tracking-[2px] uppercase">{t('featuredScene')}</p>
          <p className="font-cormorant font-bold text-[32px] sm:text-[40px] lg:text-5xl text-[#3b2d17] leading-tight lg:leading-[48px] break-words">{scene.title}</p>
          <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-xl text-[#594522] leading-relaxed line-clamp-4">{scene.description}</p>
        </div>
        <div className="h-12 px-5 py-3.5 rounded-xl outline outline-[1.5px] outline-offset-[-1.5px] outline-[#b89148] flex justify-center items-center gap-1 w-fit group-hover:bg-[#b89148] transition-colors">
          <span className="font-dm-sans text-[16px] lg:text-lg text-[#5c4924] px-2 group-hover:text-white transition-colors">{t('learnMore')}</span>
          <ArrowRight size={20} className="text-[#5c4924] group-hover:text-white transition-colors" />
        </div>
      </div>
    </Link>
  )
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-[40px] w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] lg:gap-[40px] w-full">
        <div className="flex-1 h-[530px] rounded-[24px] bg-[#f0ebe0] animate-pulse" />
        <div className="flex-1 h-[530px] rounded-[24px] bg-[#f0ebe0] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] lg:gap-[40px] w-full">
        <div className="flex-1 h-[530px] rounded-[24px] bg-[#f0ebe0] animate-pulse" />
        <div className="flex-1 h-[530px] rounded-[24px] bg-[#f0ebe0] animate-pulse" />
      </div>
      <div className="w-full h-[536px] rounded-[16px] bg-[#f0ebe0] animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] lg:gap-[40px] w-full">
        <div className="flex-1 h-[530px] rounded-[24px] bg-[#f0ebe0] animate-pulse" />
        <div className="flex-1 h-[530px] rounded-[24px] bg-[#f0ebe0] animate-pulse" />
      </div>
    </div>
  )
}

export default function ThreeSixtyTourPage() {
  const locale = useLocale()
  const t = useTranslations('Tour360')
  const router = useRouter()
  const { selectedBranch, ready } = useBranch()
  const [scenes, setScenes] = useState<TourScene[]>([])
  const [loading, setLoading] = useState(true)
  const [heroLocked, setHeroLocked] = useState(true)

  useEffect(() => {
    if (!ready) return
    let active = true
    fetchTourScenes(locale, selectedBranch?.id)
      .then(data => { if (active) setScenes(data) })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [locale, selectedBranch, ready])

  const scene1 = scenes.find(s => s.sceneNumber === 1) ?? scenes[0]
  const hasGroups = scenes.some(s => (s.roomGroup ?? '').trim())
  const groupSections = hasGroups ? buildGroups(scenes, t('otherRooms')) : []
  const grid = scenes.length ? buildGrid(scenes) : null
  const hero = scene1?.panoramaUrl || scene1?.thumbnailUrl || '/images/360-page-banner.jpg'
  // Sub-rooms of scene 1, shown as clickable dots on the hero. The label above
  // each dot is the destination ROOM NAME (the linked scene's title).
  const scene1Hotspots = (scene1?.hotspots ?? []).map(h => ({
    ...h,
    label: scenes.find(s => s.sceneNumber === h.targetSceneNumber)?.title || h.label,
  }))

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">

        {/* Scene 1 — interactive 360° hero */}
        <div className="page-shell pt-[90px] lg:pt-[150px]">
          {loading ? (
            <div className="w-full h-[520px] rounded-[28px] bg-[#1a1308] animate-pulse" />
          ) : !scene1 ? (
            <div className="flex flex-col items-center justify-center h-[300px] gap-4">
              <p className="font-cormorant font-bold text-[32px] text-[#3b2d17]">{t('noToursTitle')}</p>
              <p className="font-dm-sans text-[18px] text-[#594522]">{t('noToursMessage')}</p>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden rounded-[28px] h-[360px] sm:h-[520px] lg:h-[700px]"
              style={{ boxShadow: '0 8px 60px 8px rgba(184,145,72,0.18)', border: '1px solid rgba(184,145,72,0.28)' }}
              onDoubleClick={() => setHeroLocked(false)}
            >
              <ThreeSixtyViewer
                src={hero}
                height="100%"
                width="100%"
                interactive={!heroLocked}
                hotspots={scene1Hotspots}
                onHotspotClick={(target) => { if (target != null) router.push(`/360-tour/${target}?explore=1` as any) }}
              />
              {heroLocked && (
                <div className="absolute top-[20px] left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none rounded-full bg-black/45 backdrop-blur-[2px] px-4 py-1.5">
                  <p className="font-dm-sans text-[12px] sm:text-[13px] text-white/85 tracking-wide">{t('heroHint')}</p>
                </div>
              )}
                <div className="absolute bottom-0 inset-x-0 pointer-events-none flex flex-col gap-[8px] px-5 sm:px-8 lg:px-[48px] pb-5 sm:pb-8 lg:pb-[40px]"
                  style={{ background: 'linear-gradient(0deg, rgba(10,8,4,0.80) 0%, transparent 55%)' }}>
                  <p className="font-dm-sans text-[13px] text-[#e8cc88] tracking-[3px] uppercase">{t('scene1Label')}</p>
                  <p className="font-cormorant font-bold text-white text-[28px] sm:text-[36px] lg:text-[42px] leading-none break-words">{scene1.title}</p>
                </div>
              <Link
                href={tourHref(scene1.sceneNumber)}
                className="absolute top-[20px] right-[20px] z-20 flex items-center gap-[8px] px-[18px] py-[10px] rounded-[10px] font-dm-sans text-[14px] text-[#3b2d17] hover:bg-[#c8a25a] transition-colors"
                style={{ background: 'rgba(184,145,72,0.92)', backdropFilter: 'blur(6px)' }}
              >
                {t('fullView')} →
              </Link>
            </div>
          )}
        </div>

        {/* Grid section */}
        <div className="page-shell flex flex-col gap-[40px] items-center pb-[120px] pt-[80px]">
          <Reveal className="flex flex-col gap-[12px] text-center w-full">
            <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none w-full">{t('visitRoomsHeading')}</h2>
            <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522] w-full">{t('visitRoomsSubtitle')}</p>
          </Reveal>

          {loading ? <Skeleton /> : hasGroups ? (
            /* Grouped view: each room group shown as a sub-room section */
            <div className="flex flex-col gap-[64px] w-full">
              {groupSections.map(({ name, scenes: groupScenes }) => (
                <div key={name} className="flex flex-col gap-[24px] w-full">
                  <div className="flex items-center gap-[16px] w-full">
                    <h3 className="font-cormorant font-bold text-[28px] sm:text-[34px] text-[#3b2d17] whitespace-nowrap">{name}</h3>
                    <div className="h-px flex-1 bg-[#e0d4b8]" />
                    <span className="font-dm-sans text-[14px] text-[#b89148] whitespace-nowrap">{t('roomCount', { count: groupScenes.length })}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] lg:gap-[40px] w-full">
                    {groupScenes.map(s => <SceneCard key={s.id} scene={s} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : grid ? (
            <div className="flex flex-col gap-[40px] w-full">
              {grid.rowsBefore.map((pair, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-[24px] lg:gap-[40px] w-full">
                  {pair.map(s => <SceneCard key={s.id} scene={s} />)}
                  {pair.length === 1 && <div className="flex-1" />}
                </div>
              ))}
              <SceneCardFull scene={grid.center} />
              {grid.rowsAfter.map((pair, i) => (
                <div key={`a${i}`} className="grid grid-cols-1 md:grid-cols-2 gap-[24px] lg:gap-[40px] w-full">
                  {pair.map(s => <SceneCard key={s.id} scene={s} />)}
                  {pair.length === 1 && <div className="flex-1" />}
                </div>
              ))}
            </div>
          ) : null}
        </div>

      </div>
    </SiteLayout>
  )
}
