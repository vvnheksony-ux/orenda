'use client'

import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

export default function ClinicSection() {
  const t = useTranslations('ClinicSection')

  const CLINICS = [
    { key: 'obstetric',      name: t('obstetric'),      image: '/images/specialty-obstetric.png',  circle: true  },
    { key: 'gynecology',     name: t('gynecology'),     image: '/images/specialty-gynecology.png', circle: true  },
    { key: 'pediatric',      name: t('pediatric'),      image: '/images/specialty-pediatric.png',  circle: true  },
    { key: 'neuro',          name: t('neuro'),          image: '/images/specialty-neuro.png',      circle: false },
    { key: 'imaging',        name: t('imaging'),        image: '/images/specialty-imaging.png',    circle: false },
    { key: 'orthopedics',    name: t('orthopedics'),    image: '/images/specialty-neuro-2.png',    circle: false },
    { key: 'generalMedicine',name: 'General Medicine',  image: '/images/specialty-neuro.png',      circle: false },
  ]

  const row1 = CLINICS.slice(0, 4)
  const row2 = CLINICS.slice(4, 7)

  return (
    <section className="w-full pt-[120px] pb-[120px]">
      <div className="max-w-[1352px] mx-auto flex flex-col gap-[40px] items-center">

        <div className="flex flex-col gap-[24px] items-center">
          <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none text-center">
            {t('title')}
          </h2>
          <p className="font-dm-sans text-[20px] text-[#594522] text-center">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-[16px] w-full">
          {/* Row 1 — cards 0–3 */}
          <div className="flex gap-[12px] items-center w-full">
            {row1.map((clinic) => (
              <Link
                key={clinic.key}
                href="/departments"
                className="flex-1 min-w-0 flex flex-col gap-[24px] items-center justify-center px-[80px] py-[40px] rounded-[12px] bg-[rgba(245,236,212,0.2)] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)] cursor-pointer hover:bg-[rgba(245,236,212,0.4)] transition-colors"
              >
                <div
                  className="overflow-hidden relative shrink-0"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: clinic.circle ? 9999 : 0,
                    background: clinic.circle ? '#ffffff' : 'transparent',
                  }}
                >
                  <Image
                    src={clinic.image}
                    alt={clinic.name}
                    fill
                    className="object-contain"
                    sizes="100px"
                    unoptimized
                  />
                </div>
                <span className="font-cormorant font-bold text-[24px] text-[#2a2620] leading-none whitespace-nowrap">
                  {clinic.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Row 2 — cards 4–6 + See More */}
          <div className="flex gap-[12px] items-center w-full">
            {row2.map((clinic) => (
              <Link
                key={clinic.key}
                href="/departments"
                className="flex-1 min-w-0 flex flex-col gap-[24px] items-center justify-center px-[80px] py-[40px] rounded-[12px] bg-[rgba(245,236,212,0.2)] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)] cursor-pointer hover:bg-[rgba(245,236,212,0.4)] transition-colors"
              >
                <div
                  className="overflow-hidden relative shrink-0"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: clinic.circle ? 9999 : 0,
                    background: clinic.circle ? '#ffffff' : 'transparent',
                  }}
                >
                  <Image
                    src={clinic.image}
                    alt={clinic.name}
                    fill
                    className="object-contain"
                    sizes="100px"
                    unoptimized
                  />
                </div>
                <span className="font-cormorant font-bold text-[24px] text-[#2a2620] leading-none whitespace-nowrap">
                  {clinic.name}
                </span>
              </Link>
            ))}

            {/* See More card */}
            <Link
              href="/departments"
              className="flex-1 min-w-0 flex items-center justify-center gap-[8px] h-[228px] rounded-[12px] bg-[rgba(184,145,72,0.6)] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)] cursor-pointer hover:bg-[rgba(184,145,72,0.8)] transition-colors"
            >
              <span className="font-cormorant font-bold text-[24px] text-[#fbf7ee] leading-none whitespace-nowrap">
                See More
              </span>
              <ChevronDown className="w-[40px] h-[40px] text-[#fbf7ee] -rotate-90" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
