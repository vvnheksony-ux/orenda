'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import Reveal from '@/components/shared/Reveal'


function StatCard({ value, label, body }: { value: string; label: string; body: string }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[16px] border border-[#fbf7ee] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)]"
      style={{ padding: '16px', background: 'rgba(251,247,238,0.8)' }}
    >
      <div className="flex flex-col gap-[10px] pt-[4px] pb-[12px] w-full items-center text-center">
        {/* Value + label: inline on mobile, stacked on xl */}
        <div className="flex flex-wrap md:flex-col items-baseline xl:items-center justify-center gap-x-[6px] gap-y-[2px] xl:gap-y-[8px] font-cormorant font-bold leading-none">
          <span className="text-[20px] sm:text-[28px] xl:text-[36px] text-[#7a5f2c] whitespace-nowrap">{value}</span>
          <span className="text-[14px] sm:text-[18px] xl:text-[24px] text-[#3b2d17]">{label}</span>
        </div>
        <p className="font-dm-sans font-normal text-[13px] sm:text-[15px] text-[#3b2d17] leading-[1.3] text-center">
          {body}
        </p>
      </div>
    </div>
  )
}

type Stat = { value: string; label: string; body: string }

export default function WhySection({ initialStats = null }: { initialStats?: Stat[] | null }) {
  const t = useTranslations('WhySection')
  const locale = useLocale()
  const [apiStats, setApiStats] = useState<Stat[] | null>(initialStats)
  const didInit = useRef(false)

  // Fallback stats shown when the CMS (why-stats) returns nothing — translated.
  const staticStats: Stat[] = [
    { value: '99%',           label: t('stat1Label'), body: t('stat1Body') },
    { value: t('stat2Value'), label: t('stat2Label'), body: t('stat2Body') },
    { value: '0%',            label: t('stat3Label'), body: t('stat3Body') },
    { value: '0.5%',          label: t('stat4Label'), body: t('stat4Body') },
  ]

  useEffect(() => {
    // Server already provided this locale's stats on first render — skip the
    // redundant client fetch. Only fetch when the locale changes afterwards.
    if (!didInit.current) {
      didInit.current = true
      if (initialStats) return
    }
    fetch(`/api/why-stats?locale=${locale}`)
      .then(r => r.json())
      .then(d => setApiStats(d.docs?.length ? d.docs : null))
      .catch(() => setApiStats(null))
  }, [locale])

  const stats = apiStats ?? staticStats

  return (
    <section className="relative w-full overflow-hidden py-[48px] xl:py-[100px] bg-[var(--background)] lg:bg-transparent">

      {/* Background image — desktop only */}
      <div className="absolute inset-0 hidden md:block">
        <Image src="/images/figma-facility-1.jpg" alt="Why Orienda" fill className="object-cover" sizes="100vw" priority />
      </div>

      {/* Dark blur overlay — desktop only */}
      <div className="absolute inset-0 hidden md:block bg-[rgba(0,0,0,0.3)]" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }} />

      {/* Content */}
      <div className="page-shell relative z-10 flex flex-col gap-[32px] xl:gap-[82px]">

        {/* Text block */}
        <div className="flex flex-col gap-[16px] items-start max-w-full xl:max-w-[695px]">
          <Reveal className="flex flex-col gap-[12px] lg:gap-[16px]">
            <h2 className="font-cormorant font-bold text-[36px] xl:text-[48px] leading-tight text-[#3b2d17] lg:text-[#fbf7ee]">
              {t('title')}
            </h2>
            <p className="font-dm-sans font-light text-[14px] sm:text-[16px] xl:text-[24px] leading-[1.5] overflow-hidden text-[#3b2d17] lg:text-[#fbf7ee]" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
              {t('description')}
            </p>
          </Reveal>
          <Link href="/about" className="flex items-center gap-[8px] bg-[#b89148] text-white rounded-[12px] font-dm-sans text-[15px] xl:text-[16px] px-[20px] hover:opacity-90 transition-opacity" style={{ height: 44 }}>
            {t('discoverMore')}
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* 4 stat cards — 2 cols on mobile, staggered row on xl */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-[12px] md:hidden">
            {stats.map((s) => (
              <StatCard key={s.label} value={s.value} label={s.label} body={s.body} />
            ))}
          </div>
        )}
        <div className="hidden md:flex gap-[20px] items-start">
          {[stats[0], stats[2], stats[1], stats[3]].filter(Boolean).map((s, i) => (
            <div key={s.label} className="shrink-0 w-[322px]" style={{ marginTop: i % 2 === 1 ? 86 : 0 }}>
              <StatCard value={s.value} label={s.label} body={s.body} />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
