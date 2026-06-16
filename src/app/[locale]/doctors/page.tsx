'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Phone } from 'lucide-react'
import { useLocale } from 'next-intl'
import SiteLayout from '@/components/layout/SiteLayout'
import { useAnalytics } from '@/lib/use-analytics'
import { Link } from '@/i18n/routing'
import { useBranch } from '@/lib/branch-context'

interface Doctor {
  id: string
  name: string
  specialty: string
  department: string
  image_url?: string
}

function DoctorCard({ doc }: { doc: Doctor }) {
  return (
    <div
      className="relative flex h-[260px] w-full max-w-[168px] flex-col items-center justify-center gap-[18px] overflow-hidden rounded-[16px] bg-[#fbf7ee] sm:h-[330px] sm:max-w-[240px] sm:gap-[24px] lg:h-[400px] lg:max-w-[300px] lg:gap-[32px]"
      style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}
    >
      {/* Gold gradient header */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[110px] w-full opacity-[0.64] sm:h-[165px] lg:h-[206px]"
        style={{ background: 'linear-gradient(133deg, rgba(234,214,164,0.6) 0%, rgba(206,175,112,0.827) 25%, rgba(184,145,72,0.8) 49.5%, rgba(210,181,120,0.792) 76%, rgba(234,214,164,0.6) 100%)' }}
      />
      {/* Circular photo */}
      <div
        className="relative size-[84px] shrink-0 overflow-hidden rounded-full bg-[#fbf7ee] sm:size-[118px] lg:size-[146px]"
        style={{ boxShadow: '0px 4px 30px 12px rgba(184,145,72,0.2)' }}
      >
        {doc.image_url ? (
          <Image src={doc.image_url} alt={doc.name} fill className="object-cover object-top" sizes="(max-width: 640px) 84px, (max-width: 1024px) 118px, 146px" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#ead6a4]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="sm:w-12 sm:h-12 lg:w-14 lg:h-14">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex h-[110px] shrink-0 flex-col items-center justify-between sm:h-[132px] lg:h-[145px]">
        <div className="flex flex-col items-center gap-[8px] overflow-hidden px-2 text-center text-[#3b2d17] capitalize sm:gap-[12px] sm:px-4 lg:gap-[16px]">
          <p className="max-w-[140px] break-words font-cormorant text-[16px] font-medium leading-none sm:max-w-[180px] sm:text-[20px] lg:max-w-[217px] lg:text-[24px]">{doc.name}</p>
          <p className="max-w-[132px] break-words font-dm-sans text-[11px] leading-none text-[#594522] sm:max-w-[160px] sm:text-[13px] lg:max-w-[186px] lg:text-[16px]">{doc.specialty}</p>
        </div>
        <Link
          href={`/doctors/${doc.id}` as any}
          className="flex h-[28px] w-[110px] items-center justify-center overflow-hidden rounded-[10px] bg-[#b89148] px-[12px] py-[8px] font-dm-sans text-[11px] text-[#fbf7ee] transition-colors hover:bg-[#c8a25a] sm:h-[30px] sm:w-[130px] sm:text-[12px] lg:h-[32px] lg:w-[145px]"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const locale = useLocale()
  const { trackCallClick } = useAnalytics()
  const { selectedBranch } = useBranch()

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const url = `/api/doctors?locale=${encodeURIComponent(locale)}${selectedBranch ? `&branch=${selectedBranch.id}` : ''}`
        const res = await fetch(url)
        if (res.ok) setDoctors(await res.json())
      } catch (err) {
        console.error('Failed to fetch doctors:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDoctors()
  }, [locale, selectedBranch])

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
      <div className="bg-[#fbf7ee] w-full">
        <div className="page-shell flex flex-col gap-[80px] items-center pb-[120px] pt-[100px] lg:pt-[212px]">

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

            <button
              onClick={() => trackCallClick('doctors-banner')}
              className="ml-auto flex items-center gap-[8px] rounded-[12px] border border-[#b89148] bg-[#b89148] px-4 py-3"
              style={{ boxShadow: '0px 0px 4.5px #cba655' }}
            >
              <Phone size={18} className="text-[#fbf7ee]" />
              <span className="font-dm-sans text-[14px] leading-none text-[#fbf7ee]">Contact Now</span>
            </button>
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
              <button
                onClick={() => trackCallClick('doctors-banner')}
                className="flex items-center gap-[10px] rounded-[12px] border border-[#b89148] bg-[#b89148] px-[42px] py-[24px] backdrop-blur-[6px]"
                style={{ boxShadow: '0px 0px 4.5px #cba655' }}
              >
                <Phone size={24} className="text-[#fbf7ee]" />
                <span className="font-dm-sans text-[20px] leading-none text-[#fbf7ee] lg:text-[24px]">Contact Now</span>
              </button>
            </div>
          </div>

          {/* Doctors listing */}
          <div className="flex flex-col gap-[40px] items-center w-full">
            {/* Section header */}
            <div className="flex flex-col gap-[12px] text-center w-full">
                <h1 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none w-full">
                  Meet Our Doctors
                </h1>
                <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522] w-full">
                  A selected team of experts committed to your health
                </p>
            </div>

            {/* Empty state */}
            {!isLoading && doctors.length === 0 && (
              <p className="font-dm-sans text-[18px] text-[#594522] py-[60px] text-center w-full">No doctors available at this time.</p>
            )}

            {/* Department groups */}
            <div className="flex flex-col gap-[40px] items-start w-full">
              {Object.entries(displayGroups).filter(([, d]) => isLoading || d.length > 0).map(([dept, deptDoctors]) => (
                <div key={dept} className="flex flex-col gap-[40px] items-start w-full">
                  {/* Department header */}
                  <div className="flex flex-col gap-[8px] w-full">
                    <h2 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">{dept}</h2>
                    <p className="font-dm-sans text-[16px] text-[#594522]">
                      A selected team of experts committed to your health
                    </p>
                  </div>
                  {/* Cards */}
                  <div className="grid w-full grid-cols-2 justify-items-center gap-[12px] sm:grid-cols-3 sm:gap-[20px] xl:grid-cols-4 xl:gap-[40px]">
                    {isLoading
                      ? Array(8).fill(0).map((_, i) => (
                          <div key={i} className="aspect-[3/4] w-full max-w-[168px] rounded-[16px] bg-[#fbf7ee] animate-pulse sm:max-w-[240px] lg:max-w-[300px]" style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }} />
                        ))
                      : deptDoctors.map((doc, i) =>
                          doc ? <DoctorCard key={doc.id || i} doc={doc} /> : null
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
