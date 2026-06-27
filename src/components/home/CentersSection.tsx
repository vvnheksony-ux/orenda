'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useBranch } from '@/lib/branch-context'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'


export default function CentersSection() {
  const t = useTranslations('CentersSection')
  const locale = useLocale()
  const { selectedBranch, ready } = useBranch()
  const [idx, setIdx] = useState(0)
  const [fetching, setFetching] = useState(true)
  const [SPECIALTIES, setSpecialties] = useState<{key:string;name:string;thumb:string;display:string;successRate?:string;surgeries?:string;satisfactionsRate?:string}[]>([])

  useEffect(() => {
    if (!ready || !selectedBranch) return

    let active = true
    ;(async () => {
      setIdx(0)
      try {
        // Bound solely to the Centers of Excellence collection (CMS-managed).
        const res = await fetch(`/api/centers-of-excellence?locale=${locale}`)
        const data = await res.json().catch(() => ({}))
        const centers = Array.isArray(data?.docs) ? data.docs : []
        if (!active) return
        setSpecialties(centers.map((c: { id: string; slug?: string; title: string; icon?: string | null; successRate?: string; surgeries?: string; satisfactionsRate?: string }) => ({
          key:     c.slug || String(c.id),
          name:    c.title,
          thumb:   c.icon ?? '',
          display: c.icon ?? '',
          successRate:       c.successRate || undefined,
          surgeries:         c.surgeries || undefined,
          satisfactionsRate: c.satisfactionsRate || undefined,
        })))
      } catch {
        if (active) setSpecialties([])
      } finally {
        if (active) setFetching(false)
      }
    })()

    return () => {
      active = false
    }
  }, [locale, ready, selectedBranch])

  const prev = () => setIdx(i => (i - 1 + SPECIALTIES.length) % SPECIALTIES.length)
  const next = () => setIdx(i => (i + 1) % SPECIALTIES.length)
  const active = SPECIALTIES[idx] ?? SPECIALTIES[0]
  const loading = !ready || (!!selectedBranch && fetching)

  if (loading) return (
    <section className="w-full" style={{ backgroundColor: 'var(--background)' }}>
      <div className="page-shell flex flex-col gap-[24px] lg:gap-[40px] items-center">
        <div className="flex flex-col gap-[12px] items-center">
          <div className="h-[36px] lg:h-[48px] w-[280px] rounded-lg bg-[#e8d9b8] animate-pulse" />
          <div className="h-[20px] w-[220px] rounded bg-[#e8d9b8] animate-pulse" />
        </div>
        <div className="hidden md:flex gap-[52px] items-center w-full">
          <div className="flex flex-col gap-[40px] items-center shrink-0">
            {[0,1,2].map(i => <div key={i} className="rounded-full bg-[#e8d9b8] animate-pulse size-[144px]" />)}
          </div>
          <div className="w-[450px] aspect-square rounded-xl bg-[#e8d9b8] animate-pulse shrink-0" />
          <div className="grid w-[clamp(280px,28vw,420px)] shrink-0 grid-cols-2 gap-[clamp(16px,1.4vw,20px)] content-start">
            {[0,1,2,3].map(i => <div key={i} className="aspect-square rounded-[12px] bg-[#e8d9b8] animate-pulse" />)}
          </div>
        </div>
        <div className="md:hidden w-full aspect-square rounded-xl bg-[#e8d9b8] animate-pulse" />
      </div>
    </section>
  )

  if (!selectedBranch) return null

  // No Centers of Excellence records yet — still render the section header so the
  // homepage keeps its structure; the interactive content shows once CoE records
  // are published.
  if (!active) return (
    <section className="w-full" style={{ backgroundColor: 'var(--background)' }}>
      <div className="page-shell flex flex-col gap-[12px] lg:gap-[16px] items-center">
        <h2 className="font-cormorant font-bold text-[36px] lg:text-[48px] text-[#3b2d17] leading-none text-center">
          {t('title')}
        </h2>
        <p className="font-dm-sans text-[18px] lg:text-[20px] text-[#594522] leading-none text-center w-[299px] lg:w-full">
          {t('subtitle')}
        </p>
      </div>
    </section>
  )

  const STATS = [
    { value: active.successRate       || '99%',  label: t('stat1') },
    { value: active.surgeries         || '20k',  label: t('stat2') },
    { value: active.satisfactionsRate || '100%', label: t('stat3') },
  ]

  return (
    <section className="w-full" style={{ backgroundColor: 'var(--background)' }}>
      <div className="page-shell flex flex-col gap-[24px] lg:gap-[40px] items-center">

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
      <div className="flex flex-col gap-[24px] items-center w-full md:hidden">

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
              <Image src={active.display} alt={active.name} fill className="object-cover" sizes="80vw" unoptimized={active.display?.startsWith('/payload')} />
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
            <div key={stat.value} className="flex flex-col gap-[4px] items-center justify-center rounded-full liquid-glass" style={{ width: 108, height: 108 }}>
              <p className="font-cormorant font-bold text-[24px] text-[#3b2d17] leading-none">{stat.value}</p>
              <p className="font-dm-sans text-[11px] text-[#7a5f2c] text-center leading-tight px-2">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:flex flex-col gap-[40px] items-center w-full">
      <div className="flex gap-6 xl:gap-12 items-center justify-between w-full">

        {/* LEFT: chevron up + 3 stat bubbles + chevron down */}
        <div className="flex flex-col gap-[24px] xl:gap-[40px] items-center shrink-0">
          <button onClick={prev} aria-label="Previous" className="w-[40px] h-[40px] flex items-center justify-center text-[#3b2d17] hover:opacity-70 transition-opacity">
            <ChevronUp className="w-[40px] h-[40px]" strokeWidth={1.5} />
          </button>

          <div className="flex flex-col gap-[16px] xl:gap-[24px] items-center">
            {STATS.map(stat => (
              <div
                key={stat.value}
                className="flex flex-col gap-[4px] items-center justify-center rounded-full liquid-glass shrink-0 size-[130px] xl:size-[144px]"
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
        <div className="flex flex-col gap-[clamp(20px,2.6vw,40px)] items-center justify-center shrink-0 w-[min(26vw,400px)] min-w-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative w-full aspect-square shrink-0"
            >
              <Image src={active.display} alt={active.name} fill className="object-cover" sizes="(max-width: 1279px) 28vw, 32vw" unoptimized={active.display?.startsWith('/payload')} />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={active.key + '-name'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="font-cormorant font-bold text-[24px] xl:text-[34px] text-[#3b2d17] leading-none capitalize text-center"
            >
              {active.name}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* RIGHT: 2×2 specialty selector grid */}
        <div className="grid w-[min(44vw,640px)] min-w-[420px] shrink-0 grid-cols-2 gap-[clamp(12px,1.6vw,24px)] content-start">
          {SPECIALTIES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setIdx(i)}
              className="group flex aspect-square flex-col items-center justify-center gap-3 sm:gap-6 rounded-2xl px-4 py-4 sm:px-8 sm:py-8 overflow-hidden liquid-glass"
              style={i === idx ? { background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.16))' } : undefined}
            >
              {s.thumb && (
                <div className="relative size-24 sm:size-32 overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Image src={s.thumb} alt={s.name} fill className="object-contain" sizes="128px" unoptimized={s.thumb.startsWith('/payload')} />
                </div>
              )}
              <p className="font-cormorant font-bold text-lg sm:text-3xl text-[#2A2620] leading-tight capitalize text-center text-balance">
                {s.name}
              </p>
            </button>
          ))}
        </div>
      </div>
      </div>
      </div>
    </section>
  )
}
