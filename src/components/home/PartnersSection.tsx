'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'


const STATIC_PARTNERS = [
  { src: '/images/partner-1.png', alt: 'Partner' },
  { src: '/images/partner-2.png', alt: 'Partner' },
  { src: '/images/partner-3.png', alt: 'Partner' },
  { src: '/images/partner-1.png', alt: 'Partner' },
  { src: '/images/partner-2.png', alt: 'Partner' },
  { src: '/images/partner-3.png', alt: 'Partner' },
  { src: '/images/partner-1.png', alt: 'Partner' },
  { src: '/images/partner-2.png', alt: 'Partner' },
  { src: '/images/partner-3.png', alt: 'Partner' },
]

export default function PartnersSection() {
  const t = useTranslations('PartnersSection')
  const locale = useLocale()
  const [partners, setPartners] = useState<{ src: string; alt: string }[] | null>(null)

  useEffect(() => {
    fetch(`/api/partners?locale=${locale}`)
      .then(r => r.json())
      .then(d => setPartners(d.docs?.length ? d.docs.map((p: any) => ({ src: p.logo ?? '/images/partner-1.png', alt: p.name })) : STATIC_PARTNERS))
      .catch(() => setPartners(STATIC_PARTNERS))
  }, [locale])

  if (!partners) return null

  return (
    <section className="w-full bg-[#fbf7ee]">
      {/* Header */}
      <div className="max-w-[1512px] mx-auto w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-[80px]">
        <div className="flex flex-col gap-[20px] items-center text-center pb-[40px]">
          <h2 className="font-cormorant font-bold text-[44px] lg:text-[64px] xl:text-[72px] text-gold-900 leading-none">
            {t('title')}
          </h2>
          <p className="font-dm-sans text-[17px] sm:text-[19px] lg:text-[24px] xl:text-[26px] text-gold-800">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Infinite marquee — full viewport width, no horizontal padding */}
      <div className="w-full overflow-hidden">
        <div className="flex gap-[16px] animate-marquee" style={{ width: 'max-content' }}>
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
