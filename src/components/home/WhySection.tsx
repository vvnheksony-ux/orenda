'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'


function StatCard({ value, label, body }: { value: string; label: string; body: string }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[16px] border border-[#fbf7ee] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)]"
      style={{ padding: '16px', background: 'rgba(251,247,238,0.8)' }}
    >
      <div className="flex flex-col gap-[10px] pt-[4px] pb-[12px] w-full items-center text-center">
        {/* Value + label: inline on mobile, stacked on xl */}
        <div className="flex flex-wrap xl:flex-col items-baseline xl:items-center justify-center gap-x-[6px] gap-y-[2px] xl:gap-y-[8px] font-cormorant font-bold leading-none">
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

const STATIC_STATS = [
  { value: '99%', label: 'Patient satisfaction', body: 'Based on patient feedback surveys across departments. Patients highlighted clear communication, staff friendliness, and modern facilities.' },
  { value: 'Over 100,000', label: 'Patient Visits since 2024', body: 'Including both Cambodian and International patients from over 20 countries — a sign of growing trust in local healthcare quality.' },
  { value: '0%', label: 'Readmission Rate', body: "Orienda's readmission rate stands at 0%, reflecting consistent follow-up and preventive care success." },
  { value: '0.5%', label: 'Surgical Infection Rate', body: 'A 0.5% surgical infection rate shows our commitment to safe surgeries and careful post-operative care for every patient.' },
]

export default function WhySection() {
  const t = useTranslations('WhySection')
  const locale = useLocale()
  const [STATS, setStats] = useState<typeof STATIC_STATS | null>(null)

  useEffect(() => {
    fetch(`/api/why-stats?locale=${locale}`)
      .then(r => r.json())
      .then(d => setStats(d.docs?.length ? d.docs : STATIC_STATS))
      .catch(() => setStats(STATIC_STATS))
  }, [locale])

  if (!STATS) return null

  return (
    <section className="relative w-full overflow-hidden py-[48px] xl:py-[100px] bg-[#fbf7ee] lg:bg-transparent">

      {/* Background image — desktop only */}
      <div className="absolute inset-0 hidden lg:block">
        <Image src="/images/figma-facility-1.jpg" alt="Why Orienda" fill className="object-cover" sizes="100vw" priority />
      </div>

      {/* Dark blur overlay — desktop only */}
      <div className="absolute inset-0 hidden lg:block bg-[rgba(0,0,0,0.3)]" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} />

      {/* Content */}
      <div className="relative z-10 max-w-[1512px] mx-auto w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-[80px] flex flex-col gap-[32px] xl:gap-[82px]">

        {/* Text block */}
        <div className="flex flex-col gap-[16px] items-start max-w-full xl:max-w-[695px]">
          <div className="flex flex-col gap-[12px] lg:gap-[16px]">
            <h2 className="font-cormorant font-bold text-[36px] xl:text-[48px] leading-tight text-[#3b2d17] lg:text-[#fbf7ee]">
              Why Orienda Is Your Best Choice?
            </h2>
            <p className="font-dm-sans font-light text-[14px] sm:text-[16px] xl:text-[24px] leading-[1.5] overflow-hidden text-[#3b2d17] lg:text-[#fbf7ee]" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
              Orienda International Hospital is the premier choice for healthcare in Cambodia, combining award-winning international standards with a proven track record of life-saving success. As an ISO-certified institution, we provide 24/7 comprehensive medical services—ranging from specialized fertility and maternity care to emergency air ambulance transport—all powered by a dedicated team of over 800 professionals.
            </p>
          </div>
          <button className="flex items-center gap-[8px] bg-[#b89148] text-white rounded-[12px] font-dm-sans text-[15px] xl:text-[16px] px-[20px]" style={{ height: 44 }}>
            {t('discoverMore')}
            <ArrowRight size={16} />
          </button>
        </div>

        {/* 4 stat cards — 2 cols on mobile, staggered row on xl */}
        {STATS.length > 0 && (
          <div className="grid grid-cols-2 gap-[12px] xl:hidden">
            {STATS.map((s) => (
              <StatCard key={s.label} value={s.value} label={s.label} body={s.body} />
            ))}
          </div>
        )}
        <div className="hidden xl:flex gap-[20px] items-start">
          {[STATS[0], STATS[2], STATS[1], STATS[3]].filter(Boolean).map((s, i) => (
            <div key={s.label} className="shrink-0 w-[322px]" style={{ marginTop: i % 2 === 1 ? 86 : 0 }}>
              <StatCard value={s.value} label={s.label} body={s.body} />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
