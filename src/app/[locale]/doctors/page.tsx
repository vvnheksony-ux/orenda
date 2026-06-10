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
      className="bg-[#fbf7ee] flex flex-col gap-[40px] h-[400px] items-center justify-center overflow-hidden relative rounded-[16px] shrink-0 w-[300px]"
      style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}
    >
      {/* Gold gradient header */}
      <div
        className="absolute top-0 left-0 w-full h-[206px] opacity-[0.64] pointer-events-none"
        style={{ background: 'linear-gradient(133deg, rgba(234,214,164,0.6) 0%, rgba(206,175,112,0.827) 25%, rgba(184,145,72,0.8) 49.5%, rgba(210,181,120,0.792) 76%, rgba(234,214,164,0.6) 100%)' }}
      />
      {/* Circular photo */}
      <div
        className="relative rounded-full overflow-hidden shrink-0 size-[146px] bg-[#fbf7ee]"
        style={{ boxShadow: '0px 4px 30px 12px rgba(184,145,72,0.2)' }}
      >
        {doc.image_url ? (
          <Image src={doc.image_url} alt={doc.name} fill className="object-cover object-top" sizes="146px" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#ead6a4]">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex flex-col h-[145px] items-center justify-between shrink-0">
        <div className="flex flex-col gap-[16px] items-center text-center text-[#3b2d17] capitalize overflow-hidden">
          <p className="font-cormorant font-medium text-[24px] w-[217px] leading-none">{doc.name}</p>
          <p className="font-dm-sans text-[16px] w-[186px] leading-none text-[#594522]">{doc.specialty}</p>
        </div>
        <Link
          href={`/doctors/${doc.id}` as any}
          className="bg-[#b89148] flex h-[32px] items-center justify-center overflow-hidden px-[12px] py-[8px] rounded-[12px] w-[145px] font-dm-sans text-[12px] text-[#fbf7ee] hover:bg-[#c8a25a] transition-colors"
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
        <div className="max-w-[1512px] mx-auto w-full flex flex-col gap-[80px] items-center pb-[120px] px-4 sm:px-8 lg:px-[80px] pt-[100px] lg:pt-[212px]">

          {/* Hero banner */}
          <div
            className="relative w-full h-[594px] rounded-[16px] overflow-hidden"
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
                className="flex items-center gap-[10px] px-[42px] py-[24px] rounded-[12px] bg-[#b89148] backdrop-blur-[6px] border border-[#b89148]"
                style={{ boxShadow: '0px 0px 4.5px #cba655' }}
              >
                <Phone size={24} className="text-[#fbf7ee]" />
                <span className="font-dm-sans text-[24px] text-[#fbf7ee] leading-none">Contact Now</span>
              </button>
            </div>
          </div>

          {/* Doctors listing */}
          <div className="flex flex-col gap-[40px] items-center w-full">
            {/* Section header */}
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">
                Meet Our Doctors
              </h1>
              <p className="font-dm-sans text-[20px] text-[#594522] w-full">
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
                  <div className="flex flex-wrap gap-[40px] items-center justify-center w-full">
                    {isLoading
                      ? Array(8).fill(0).map((_, i) => (
                          <div key={i} className="bg-[#fbf7ee] rounded-[16px] h-[400px] w-[300px] animate-pulse" style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }} />
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
