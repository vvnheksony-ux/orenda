'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Reveal from '@/components/shared/Reveal'


type PartnerItem = {
  logo?: string | null
  name?: string | null
}

export default function PartnersSection() {
  const t = useTranslations('PartnersSection')
  const locale = useLocale()
  const [partners, setPartners] = useState<{ src: string; alt: string }[]>([])

  useEffect(() => {
    fetch(`/api/partners?locale=${locale}`)
      .then(r => r.json())
      .then(d => setPartners((d.docs ?? [])
        .filter((p: PartnerItem) => p.logo)
        .map((p: PartnerItem) => ({ src: p.logo as string, alt: p.name ?? 'Partner' }))))
      .catch(() => setPartners([]))
  }, [locale])

  return (
    <section className="w-full bg-[var(--background)]">
      {/* Header */}
      <div className="page-shell">
        <Reveal className="flex flex-col gap-[20px] items-center text-center pb-[40px]">
          <h2 className="font-cormorant font-bold text-[44px] lg:text-[64px] xl:text-[72px] text-gold-900 leading-none">
            {t('title')}
          </h2>
          <p className="font-dm-sans text-[17px] sm:text-[19px] lg:text-[24px] xl:text-[26px] text-gold-800">
            {t('subtitle')}
          </p>
        </Reveal>
      </div>

      {/* Infinite marquee — full viewport width, no horizontal padding */}
      <div className="marquee-bleed">
        <div className="marquee-track gap-[16px] animate-marquee">
          {(() => { const fill = Array.from({ length: 8 }, () => partners).flat(); return [...fill, ...fill] })().map((partner, i) => (
            <div
              key={i}
              className="relative rounded-[12px] shrink-0 overflow-hidden w-[96px] h-[96px] sm:w-[98px] sm:h-[98px]"
            >
              <Image
                src={partner.src}
                alt={partner.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, 98px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
