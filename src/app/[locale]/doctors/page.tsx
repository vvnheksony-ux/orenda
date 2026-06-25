'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Phone } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import Reveal from '@/components/shared/Reveal'
import { useAnalytics } from '@/lib/use-analytics'
import { useBranch } from '@/lib/branch-context'
import { DoctorProfileCard } from '@/components/shared/DoctorProfileCard'
import PageState from '@/components/shared/PageState'
import { fetchJsonRetry } from '@/lib/fetch-retry'

interface Doctor {
  id: string
  name: string
  specialty: string
  department: string
  image_url?: string
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const locale = useLocale()
  const t = useTranslations('Doctors')
  const { trackCallClick } = useAnalytics()
  const { selectedBranch, ready } = useBranch()

  useEffect(() => {
    if (!ready) return

    async function fetchDoctors() {
      try {
        const url = `/api/doctors?locale=${encodeURIComponent(locale)}${selectedBranch ? `&branch=${selectedBranch.id}` : ''}`
        const data = await fetchJsonRetry<any>(url)
        setDoctors(data)
        setError('')
      } catch (err) {
        console.error('Failed to fetch doctors:', err)
        setDoctors([])
        setError('We could not load doctors right now.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchDoctors()
  }, [locale, ready, selectedBranch])

  const WOMENS_KEYWORDS = ['obstetric', 'ob', 'gynecolog', 'gynaecolog', 'pediatric', 'paediatric', 'women', 'child', 'neonatal', 'maternity', 'midwife']
  function classifyDept(dept: string): 'Women & Children' | 'General Hospital' {
    const lower = dept.toLowerCase()
    return WOMENS_KEYWORDS.some(k => lower.includes(k)) ? 'Women & Children' : 'General Hospital'
  }

  // Always exactly 2 groups in order
  const fixedGroups: Record<string, Doctor[]> = { 'Women & Children': [], 'General Hospital': [] }
  doctors.forEach(d => {
    const group = classifyDept(d.department || '')
    fixedGroups[group].push(d)
  })

  // Fallback skeleton doctors for loading state
  const skeletonGroups = {
    'Women & Children': Array(4).fill(null),
    'General Hospital': Array(4).fill(null),
  }

  const displayGroups = isLoading ? skeletonGroups : fixedGroups

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">
        <div className="page-shell flex flex-col gap-[80px] items-center pb-[120px] pt-[90px] lg:pt-[150px]">

          {/* Hero banner */}
          <div className="flex w-full flex-col gap-[16px] sm:hidden">
            <div
              className="relative h-[260px] w-full overflow-hidden rounded-[16px]"
              style={{ background: 'rgba(255,255,255,0.8)', boxShadow: '0px 4px 4px 0px rgba(0,0,0,0.25)' }}
            >
              <Image
                src="/images/doctors-banner.jpg"
                alt="Orienda Doctors"
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(184,145,72,0.18)]" />
            </div>

            <Link
              href="/contact"
              onClick={() => trackCallClick('doctors-banner')}
              className="ml-auto flex items-center gap-[8px] rounded-[12px] border border-[#b89148] bg-[#b89148] px-4 py-3"
              style={{ boxShadow: '0px 0px 4.5px #cba655' }}
            >
              <Phone size={18} className="text-[#fbf7ee]" />
              <span className="font-dm-sans text-[14px] leading-none text-[#fbf7ee]">{t('contactNow')}</span>
            </Link>
          </div>

          <div
            className="relative hidden w-full overflow-hidden rounded-[16px] sm:block sm:h-[420px] lg:h-[594px]"
            style={{ background: 'rgba(255,255,255,0.8)', boxShadow: '0px 4px 4px 0px rgba(0,0,0,0.25)' }}
          >
            <Image
              src="/images/doctors-banner.jpg"
              alt="Orienda Doctors"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(184,145,72,0.25)]" />
            {/* Contact Now button */}
            <div className="absolute bottom-[24px] right-[24px]">
              <Link
                href="/contact"
                onClick={() => trackCallClick('doctors-banner')}
                className="flex items-center gap-[10px] rounded-[12px] border border-[#b89148] bg-[#b89148] px-[42px] py-[24px] backdrop-blur-[6px]"
                style={{ boxShadow: '0px 0px 4.5px #cba655' }}
              >
                <Phone size={24} className="text-[#fbf7ee]" />
                <span className="font-dm-sans text-[20px] leading-none text-[#fbf7ee] lg:text-[24px]">{t('contactNow')}</span>
              </Link>
            </div>
          </div>

          {/* Doctors listing */}
          <div className="flex flex-col gap-[40px] items-center w-full">
            {/* Section header */}
            <Reveal className="flex flex-col gap-[12px] text-center w-full">
                <h1 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none w-full">
                  {t('meetOurDoctors')}
                </h1>
                <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522] w-full">
                  {t('teamSubtitle')}
                </p>
            </Reveal>

            {/* Empty state */}
            {!isLoading && doctors.length === 0 && (
              <PageState
                title={error ? t('unavailable') : t('noDoctors')}
                message={error || t('noDoctorsMsg')}
              />
            )}

            {/* Department groups */}
            <div className="flex flex-col gap-[40px] items-start w-full">
              {Object.entries(displayGroups).filter(() => isLoading || doctors.length > 0).map(([dept, deptDoctors]) => (
                <div key={dept} className="flex flex-col gap-[40px] items-start w-full">
                  {/* Department header */}
                  <div className="flex flex-col gap-[8px] w-full">
                    <h2 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">{dept}</h2>
                    <p className="font-dm-sans text-[16px] text-[#594522]">
                      {t('teamSubtitle')}
                    </p>
                  </div>
                  {/* Cards */}
                  <div className="grid w-full grid-cols-2 justify-items-center gap-[12px] md:grid-cols-4 md:gap-[clamp(16px,2.2vw,40px)]">
                    {isLoading
                      ? Array(8).fill(0).map((_, i) => (
                          <div key={i} className="h-[clamp(260px,31vw,400px)] w-full max-w-[clamp(168px,22vw,300px)] rounded-[16px] bg-[var(--background)] animate-pulse" style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }} />
                        ))
                      : deptDoctors.map((doc, i) =>
                          doc ? <DoctorProfileCard key={doc.id || i} id={doc.id} name={doc.name} specialty={doc.specialty} imageUrl={doc.image_url} /> : null
                        )
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
