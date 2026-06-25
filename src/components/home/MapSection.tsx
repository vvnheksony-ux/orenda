'use client'

import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useState, useEffect } from 'react'
import { fetchJsonRetry } from '@/lib/fetch-retry'

interface Branch { id: string; name: string; address: string; phone: string; hours: string; image: string | null; mapUrl?: string }

function BranchCard({ branch, t, alwaysOpen = false }: { branch: Branch; t: ReturnType<typeof useTranslations>; alwaysOpen?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const open = alwaysOpen || hovered

  return (
    <div
      className="relative md:flex-1 h-[280px] sm:h-[360px] lg:h-[450px] overflow-hidden cursor-pointer"
      onMouseEnter={() => { if (!alwaysOpen) setHovered(true) }}
      onMouseLeave={() => { if (!alwaysOpen) setHovered(false) }}
    >
      {/* Background image — full bleed, blurs through overlay */}
      <Image
        src={branch.image ?? '/images/facility-building.jpg'}
        alt={branch.name}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        unoptimized={!!branch.image?.startsWith('/payload')}
      />

      {/* Info panel — slides up from bottom on hover, covers full card */}
      <div
        className="absolute inset-0 overflow-hidden p-[24px] sm:p-[32px] lg:p-[40px] z-10"
        style={{
          background: 'rgba(245,236,212,0.5)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          transform: open ? 'translateY(0) translateZ(0)' : 'translateY(100%) translateZ(0)',
          transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Content wrapper — stacks top-to-bottom, button right-aligned */}
        <div className="flex flex-col gap-[16px] lg:gap-[24px] items-end w-full h-full">

          {/* Name + address — left aligned, full width */}
          <div className="flex flex-col gap-[8px] lg:gap-[12px] items-start w-full">
            <p className="font-cormorant font-bold text-[26px] sm:text-[36px] lg:text-[48px] text-[#3b2d17] leading-[1.1]">
              {branch.name}
            </p>
            <p className="font-dm-sans font-light text-[13px] sm:text-[18px] lg:text-[24px] text-[#3b2d17] leading-snug">
              {branch.address}
            </p>
          </div>

          {/* Hours + phone — left aligned, full width */}
          <div className="flex flex-col gap-[6px] lg:gap-[12px] items-start w-full font-dm-sans font-light text-[13px] sm:text-[18px] lg:text-[24px] text-[#594522]">
            {branch.hours && <p>{branch.hours}</p>}
            {branch.phone && <p>{branch.phone}</p>}
          </div>

          {/* View Map button — right aligned (items-end on parent) */}
          <a
            href={branch.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(branch.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-[#b89148] hover:bg-[#9a7630] transition-colors text-white font-dm-sans font-normal text-[15px] sm:text-[18px] lg:text-[24px] px-[28px] sm:px-[40px] lg:px-[56px] py-[10px] lg:py-[16px] rounded-[32px] shrink-0"
            onClick={e => e.stopPropagation()}
          >
            {t('viewMap')}
          </a>
        </div>
      </div>
    </div>
  )
}

export default function MapSection() {
  const t = useTranslations('MapSection')
  const locale = useLocale()
  const [branches, setBranches] = useState<Branch[] | null>(null)

  useEffect(() => {
    fetchJsonRetry<any>(`/api/branches?locale=${locale}`)
      .then(d => { if (d?.docs?.length) setBranches(d.docs) })
      .catch(() => {})
  }, [locale])

  if (!branches) {
    return (
      <section className="flex flex-col md:flex-row w-full overflow-hidden">
        <div className="h-[280px] sm:h-[360px] lg:h-[450px] md:flex-1 bg-[#e8d9b8] animate-pulse" />
        <div className="h-[280px] sm:h-[360px] lg:h-[450px] md:flex-1 bg-[#eadfc8] animate-pulse" />
      </section>
    )
  }

  // branches[0] = Hospital II (left), branches[1] = Hospital I (right)
  const left = branches[0]
  const right = branches[1]

  if (!branches.length) return null

  return (
    <section className="flex flex-col md:flex-row w-full overflow-hidden">
      {left && <BranchCard branch={left} t={t} alwaysOpen={true} />}
      {right && <BranchCard branch={right} t={t} />}
    </section>
  )
}
