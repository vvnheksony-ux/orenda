'use client'

import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useState, useEffect } from 'react'
import { useBranch } from '@/lib/branch-context'
import { DepartmentListItem, fetchDepartments } from '@/lib/departments-cache'

interface Clinic {
  key: string
  name: string
  image: string
  circle: boolean
}

function ClinicCard({ c }: { c: Clinic }) {
  return (
    <Link href="/departments"
      className="flex flex-col items-center justify-center gap-3 sm:gap-6 aspect-square sm:aspect-auto overflow-hidden px-4 py-4 sm:px-8 sm:py-8 bg-[rgba(245,236,212,0.20)] rounded-xl border border-white shadow-[0px_4px_12px_3px_rgba(89,69,34,0.20),inset_0px_2px_8px_rgba(89,69,34,0.08)] hover:shadow-[0px_6px_16px_4px_rgba(89,69,34,0.28),inset_0px_2px_8px_rgba(89,69,34,0.08)] transition-shadow cursor-pointer group"
    >
      <div className="relative shrink-0 size-20 sm:size-32 transition-transform duration-300 group-hover:scale-105">
        {c.image && <Image src={c.image} alt={c.name} fill className="object-contain" sizes="128px" unoptimized={c.image.startsWith('/payload')} />}
      </div>
      <span className="font-cormorant font-bold text-sm sm:text-2xl leading-tight sm:leading-6 line-clamp-2 sm:line-clamp-none text-[#2A2620] text-center">
        {c.name}
      </span>
    </Link>
  )
}

export default function ClinicSection() {
  const t = useTranslations('ClinicSection')
  const locale = useLocale()

  const { selectedBranch } = useBranch()
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBranch) {
      setClinics([])
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    fetchDepartments(locale, selectedBranch.id)
      .then(docs => {
        if (!active) return
        const withIcons = docs.filter((dept: DepartmentListItem) => dept.icon?.trim())
        setClinics(withIcons.map((dept: DepartmentListItem) => ({
          key:    dept.slug || String(dept.id),
          name:   dept.name,
          image:  dept.icon ?? '',
          circle: false,
        })))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [locale, selectedBranch])

  const row1 = clinics.slice(0, 4)
  const row2 = clinics.slice(4, 7)

  const SeeMorePill = () => (
    <div className="flex justify-center">
      <Link href="/departments" className="px-8 py-3 bg-transparent rounded-[32px] outline outline-[1.5px] outline-offset-[-1.5px] outline-[#b89148] inline-flex justify-center items-center font-dm-sans text-base font-normal text-[#5c4924] hover:bg-[#b89148]/10 transition-colors">
        See More
      </Link>
    </div>
  )

  return (
    <section className="w-full" style={{ paddingTop: 'clamp(140px, 12vw, 180px)' }}>
      <div className="page-shell flex flex-col gap-[32px] lg:gap-[40px] items-center">

        <div className="flex flex-col gap-[24px] items-center">
          <h2 className="font-cormorant font-bold text-[36px] xl:text-[48px] text-[#3d3123] leading-none text-center">
            {t('title')}
          </h2>
          <p className="font-dm-sans text-[15px] sm:text-[17px] xl:text-[20px] text-[#8c7d6c] text-center w-full">
            {t('subtitle')}
          </p>
        </div>

        {loading && (
          <>
            {/* Mobile skeleton: 2 cards */}
            <div className="grid grid-cols-2 gap-[12px] w-full sm:hidden">
              {Array(2).fill(0).map((_,i) => <div key={i} className="h-[160px] rounded-[12px] bg-[rgba(245,236,212,0.2)] animate-pulse"/>)}
            </div>
            {/* Desktop skeleton: 8 cards */}
            <div className="hidden sm:flex flex-col gap-[16px] w-full">
              <div className="grid sm:grid-cols-4 gap-[12px] w-full">{Array(4).fill(0).map((_,i)=><div key={i} className="h-[190px] lg:h-[228px] rounded-[12px] bg-[rgba(245,236,212,0.2)] animate-pulse"/>)}</div>
              <div className="grid sm:grid-cols-4 gap-[12px] w-full">{Array(4).fill(0).map((_,i)=><div key={i} className="h-[190px] lg:h-[228px] rounded-[12px] bg-[rgba(245,236,212,0.2)] animate-pulse"/>)}</div>
            </div>
          </>
        )}

        {!loading && (
          <>
            {/* ── Mobile: 2 cards + See More ── */}
            <div className="flex flex-col gap-[16px] w-full sm:hidden">
              <div className="grid grid-cols-2 gap-[12px] w-full">
                {clinics.slice(0, 2).map(c => <ClinicCard key={c.key} c={c} />)}
              </div>
              <SeeMorePill />
            </div>

            {/* ── Desktop: all cards in rows + gold See More card ── */}
            <div className="hidden sm:flex flex-col gap-[12px] w-full">
              <div className="grid sm:grid-cols-4 gap-[12px] w-full">
                {row1.map(c => <ClinicCard key={c.key} c={c} />)}
              </div>
              <div className="grid sm:grid-cols-4 gap-[12px] w-full">
                {row2.map(c => <ClinicCard key={c.key} c={c} />)}
                {/* Gold "See More" as 4th card in row 2 */}
                <Link
                  href="/departments"
                  className="flex items-center justify-center gap-[8px] rounded-xl shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)] hover:opacity-90 transition-opacity"
                  style={{ background: 'rgba(184,145,72,0.6)' }}
                >
                  <span className="font-cormorant font-bold text-[18px] lg:text-[24px] text-[#fbf7ee] leading-none">See More</span>
                  <ChevronRight className="w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] text-[#fbf7ee]" />
                </Link>
              </div>
            </div>
          </>
        )}

      </div>
    </section>
  )
}
