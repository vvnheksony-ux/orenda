'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useBranch } from '@/lib/branch-context'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'


export default function CentersSection() {
  const t = useTranslations('CentersSection')
  const locale = useLocale()
  const { selectedBranch } = useBranch()
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [SPECIALTIES, setSpecialties] = useState<{key:string;name:string;thumb:string;display:string}[]>([])

  useEffect(() => {
    if (!selectedBranch) return
    setIdx(0)
    setLoading(true)
    fetch(`/api/departments?locale=${locale}&branch=${selectedBranch.id}`)
      .then(r => r.json())
      .then(d => {
        // Display images for Centers section — cycle through real facility photos
        const DISPLAY_IMAGES = [
          '/images/figma-centers-main.jpg',
          '/images/figma-facility-1.jpg',
          '/images/figma-facility-main.jpg',
          '/images/figma-facility-small.jpg',
        ]
        const ADMIN_KEYWORDS = ['director', 'administration', 'admin', 'manager', 'executive', 'officer', 'coordinator']
        const depts = (d?.docs || []).filter((dept: any) => {
          if (!dept.icon?.trim()) return false
          const lower = (dept.name || '').toLowerCase()
          return !ADMIN_KEYWORDS.some(k => lower.includes(k))
        })
        if (depts.length > 0) {
          setSpecialties(depts.slice(0, 4).map((dept: any, i: number) => ({
            key:     dept.slug || String(dept.id),
            name:    dept.name,
            thumb:   dept.icon,                          // real dept icon as thumbnail
            display: DISPLAY_IMAGES[i % DISPLAY_IMAGES.length], // proper facility photo
          })))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locale, selectedBranch])

  const prev = () => setIdx(i => (i - 1 + SPECIALTIES.length) % SPECIALTIES.length)
  const next = () => setIdx(i => (i + 1) % SPECIALTIES.length)
  const active = SPECIALTIES[idx] ?? SPECIALTIES[0]

  if (loading) return (
    <section className="w-full" style={{ backgroundColor: '#fbf7ee' }}>
      <div className="max-w-[1512px] mx-auto w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-[80px] flex flex-col gap-[24px] lg:gap-[40px] items-center">
        <div className="flex flex-col gap-[12px] items-center">
          <div className="h-[36px] lg:h-[48px] w-[280px] rounded-lg bg-[#e8d9b8] animate-pulse" />
          <div className="h-[20px] w-[220px] rounded bg-[#e8d9b8] animate-pulse" />
        </div>
        <div className="hidden lg:flex gap-[52px] items-center w-full">
          <div className="flex flex-col gap-[40px] items-center shrink-0">
            {[0,1,2].map(i => <div key={i} className="rounded-full bg-[#e8d9b8] animate-pulse size-[144px]" />)}
          </div>
          <div className="w-[450px] aspect-square rounded-xl bg-[#e8d9b8] animate-pulse shrink-0" />
          <div className="grid grid-cols-2 grid-rows-2 gap-[20px] flex-1 h-[674px]">
            {[0,1,2,3].map(i => <div key={i} className="rounded-[12px] bg-[#e8d9b8] animate-pulse" />)}
          </div>
        </div>
        <div className="lg:hidden w-full aspect-square rounded-xl bg-[#e8d9b8] animate-pulse" />
      </div>
    </section>
  )

  if (!active) return null

  const STATS = [
    { value: '99%',    label: t('stat1') },
    { value: '20k',    label: t('stat2') },
    { value: '100%',   label: t('stat3') },
  ]

  return (
    <section className="w-full" style={{ backgroundColor: '#fbf7ee' }}>
      <div className="max-w-[1512px] mx-auto w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-[80px] flex flex-col gap-[24px] lg:gap-[40px] items-center">

      {/* Header */}
      <div className="flex flex-col gap-[12px] lg:gap-[16px] items-center">
        <h2 className="font-cormorant font-bold text-[36px] lg:text-[48px] text-[#3b2d17] leading-none text-center">
          {t('title')}
        </h2>
        <p className="font-dm-sans text-[18px] lg:text-[20px] text-[#594522] leading-none text-center w-[299px] lg:w-full">
          {t('subtitle')}
        </p>
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex flex-col gap-[24px] items-center w-full lg:hidden">

        {/* Main image between L/R chevrons */}
        <div className="flex items-center gap-[12px] w-full">
          <button onClick={prev} aria-label="Previous" className="shrink-0 w-[32px] h-[32px] flex items-center justify-center text-[#3b2d17] hover:opacity-70 transition-opacity">
            <ChevronLeft className="w-[32px] h-[32px]" strokeWidth={1.5} />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative flex-1 aspect-square rounded-xl overflow-hidden"
            >
              <Image src={active.display} alt={active.name} fill className="object-cover" sizes="80vw" unoptimized />
            </motion.div>
          </AnimatePresence>

          <button onClick={next} aria-label="Next" className="shrink-0 w-[32px] h-[32px] flex items-center justify-center text-[#3b2d17] hover:opacity-70 transition-opacity">
            <ChevronRight className="w-[32px] h-[32px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Specialty name */}
        <AnimatePresence mode="wait">
          <motion.p
            key={active.key + '-name'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="font-cormorant font-bold text-[24px] text-[#3b2d17] leading-none capitalize text-center"
          >
            {active.name}
          </motion.p>
        </AnimatePresence>

        {/* 3 stat bubbles */}
        <div className="flex gap-5 w-full justify-center">
          {STATS.map(stat => (
            <div key={stat.value} className="flex flex-col gap-[4px] items-center justify-center rounded-full bg-white/10 shadow-[0px_2.8px_8.4px_2.1px_rgba(89,69,34,0.20)]" style={{ width: 108, height: 108 }}>
              <p className="font-cormorant font-bold text-[24px] text-[#3b2d17] leading-none">{stat.value}</p>
              <p className="font-dm-sans text-[11px] text-[#7a5f2c] text-center leading-tight px-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* See More button */}
        <Link href="/centers-of-excellence" className="px-8 py-3 bg-transparent rounded-[32px] outline outline-[1.5px] outline-offset-[-1.5px] outline-[#b89148] inline-flex justify-center items-center font-dm-sans text-base font-normal text-[#5c4924] hover:bg-[#b89148]/10 transition-colors">
          {t('seeMore')}
        </Link>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden lg:flex flex-col gap-[40px] items-center w-full">
      <div className="flex gap-[24px] xl:gap-[52px] items-center w-full">

        {/* LEFT: chevron up + 3 stat bubbles + chevron down */}
        <div className="flex flex-col gap-[24px] xl:gap-[40px] items-center shrink-0">
          <button onClick={prev} aria-label="Previous" className="w-[40px] h-[40px] flex items-center justify-center text-[#3b2d17] hover:opacity-70 transition-opacity">
            <ChevronUp className="w-[40px] h-[40px]" strokeWidth={1.5} />
          </button>

          <div className="flex flex-col gap-[16px] xl:gap-[24px] items-center">
            {STATS.map(stat => (
              <div
                key={stat.value}
                className="flex flex-col gap-[4px] items-center justify-center rounded-full bg-white/10 shadow-[0px_2.8px_8.4px_2.1px_rgba(89,69,34,0.20)] shrink-0 size-[130px] xl:size-[144px]"
              >
                <p className="font-cormorant font-bold text-[22px] xl:text-[24px] text-[#3b2d17] leading-none">{stat.value}</p>
                <p className="font-dm-sans text-[12px] text-[#7a5f2c] text-center leading-tight px-2">{stat.label}</p>
              </div>
            ))}
          </div>

          <button onClick={next} aria-label="Next" className="w-[40px] h-[40px] flex items-center justify-center text-[#3b2d17] hover:opacity-70 transition-opacity">
            <ChevronDown className="w-[40px] h-[40px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* CENTER: large specialty illustration + name */}
        <div className="flex flex-col gap-[24px] xl:gap-[40px] items-center justify-center shrink-0 w-[280px] xl:w-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative w-full aspect-square shrink-0"
            >
              <Image src={active.display} alt={active.name} fill className="object-cover" sizes="450px" unoptimized />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={active.key + '-name'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="font-cormorant font-bold text-[24px] xl:text-[32px] text-[#3b2d17] leading-none capitalize"
            >
              {active.name}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* RIGHT: 2×2 specialty selector grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-[12px] xl:gap-[20px] flex-1 min-w-0 h-[480px] xl:h-[674px]">
          {SPECIALTIES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setIdx(i)}
              className="flex flex-col gap-[12px] xl:gap-[16px] items-center justify-center rounded-[12px] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)] hover:opacity-90 transition-opacity overflow-hidden"
              style={{ background: i === idx ? 'rgba(245,236,212,0.35)' : 'rgba(245,236,212,0.15)' }}
            >
              {s.thumb && (
                <div className="relative w-[110px] h-[110px] xl:w-[190px] xl:h-[190px] shrink-0 rounded-full overflow-hidden bg-[#f5ecd4]">
                  <Image src={s.thumb} alt={s.name} fill className="object-contain mix-blend-multiply" sizes="190px" unoptimized />
                </div>
              )}
              <p className="font-cormorant font-bold text-[22px] xl:text-[32px] text-[#3b2d17] leading-none capitalize text-center px-4">
                {s.name}
              </p>
            </button>
          ))}
        </div>
      </div>
        {/* See More — desktop */}
        <Link href="/centers-of-excellence" className="px-8 py-3 bg-transparent rounded-[32px] outline outline-[1.5px] outline-offset-[-1.5px] outline-[#b89148] inline-flex justify-center items-center font-dm-sans text-base font-normal text-[#5c4924] hover:bg-[#b89148]/10 transition-colors">
          {t('seeMore')}
        </Link>
      </div>
      </div>
    </section>
  )
}
