'use client'

import Image from 'next/image'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import { useState, useEffect } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { useBranch } from '@/lib/branch-context'

interface Department {
  id: string
  name: string
  slug: string
  icon: string | null
}

const WOMENS_KEYWORDS = ['obstetric','ob','gynecolog','gynaecolog','pediatric','paediatric','women','child','neonatal','maternity']

function isWomens(dept: Department) {
  const lower = dept.name.toLowerCase()
  return WOMENS_KEYWORDS.some(k => lower.includes(k))
}

const BANNER_ITEMS = [
  { icon: '/images/clinics/banner-icon1.png', title: 'Discover our departments',  desc: 'Choose by name, specialty and more.' },
  { icon: '/images/clinics/banner-icon2.png', title: 'Discover our departments',  desc: 'Ask about our treatments and services' },
  { icon: '/images/clinics/banner-icon3.png', title: 'Discover our departments',  desc: 'Schedule your visit online.' },
]

function DeptCard({ dept, variant }: { dept: Department; variant: 'pink' | 'gold' }) {
  const icon = dept.icon || '/images/specialty-obstetric.png'
  const isPink = variant === 'pink'

  return (
    <Link
      href={`/departments/${dept.slug || dept.id}` as any}
      className="group flex aspect-square w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[16px] border border-white bg-[rgba(245,236,212,0.20)] px-4 py-5 text-center shadow-[0px_4px_12px_3px_rgba(89,69,34,0.20),inset_0px_2px_8px_rgba(89,69,34,0.08)] transition-shadow hover:shadow-[0px_6px_16px_4px_rgba(89,69,34,0.28),inset_0px_2px_8px_rgba(89,69,34,0.08)] sm:gap-5 sm:px-5 sm:py-6 lg:gap-6 lg:px-6 lg:py-8"
    >
      <div className="relative size-[92px] shrink-0 transition-transform duration-300 group-hover:scale-105 sm:size-[108px] lg:size-[128px] xl:size-[140px]">
        <Image src={icon} alt={dept.name} fill className="object-contain" sizes="140px" unoptimized />
      </div>
      <p className={`font-cormorant text-[20px] font-bold leading-[1.05] break-words text-balance sm:text-[22px] lg:text-[24px] ${isPink ? 'text-[#4f1b31]' : 'text-[#2A2620]'}`}>
        {dept.name}
      </p>
    </Link>
  )
}

function SkeletonCard() {
  return <div className="aspect-square w-full rounded-[16px] bg-[rgba(245,236,212,0.2)] animate-pulse" />
}

export default function DepartmentsPage() {
  const locale = useLocale()
  const { selectedBranch } = useBranch()
  const [depts, setDepts] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const branchParam = selectedBranch ? `&branch=${selectedBranch.id}` : ''
    fetch(`/api/departments?locale=${locale}${branchParam}`)
      .then(r => r.json())
      .then(d => {
        if (d?.docs?.length) {
          setDepts(
            d.docs
              .filter((dept: any) => dept.order > 0)
              .map((dept: any) => ({
                id:   String(dept.id),
                name: dept.name,
                slug: dept.slug,
                icon: dept.icon || null,
              }))
          )
        } else {
          setDepts([])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locale, selectedBranch])

  const womens  = depts.filter(d => isWomens(d))
  const general = depts.filter(d => !isWomens(d))

  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="page-shell flex flex-col gap-[80px] items-center pb-[120px] pt-[100px] lg:pt-[212px]">

          {/* Hero slider */}
          <PromotionStyleHero
            imageSrc="/images/about/about-hero-3.jpg"
            imageAlt="Orienda International Hospital"
            title="Orienda International Hospital"
            lines={[
              'We dedicated to providing safe and reliable medical services.',
              'Schedule an appointment to experience world-class healthcare.',
            ]}
          />

          {/* Gold info banner */}
          <div className="w-full max-w-[1352px] rounded-[16px] overflow-hidden flex items-center justify-center px-4 py-6 lg:p-0" style={{ background: 'rgba(184,145,72,0.8)', boxShadow: '0px 4px 24px 3px rgba(184,145,72,0.2)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 items-stretch justify-center w-full h-full">
              {BANNER_ITEMS.map((item, i) => (
                <div key={i} className={`flex flex-col gap-[16px] items-center justify-center h-full px-4 py-5 ${i < BANNER_ITEMS.length - 1 ? 'md:border-r-2 md:border-b-0 border-b border-[#f5ecd4]' : ''}`}>
                  <div className="relative size-[97px]">
                    <Image src={item.icon} alt={item.title} fill className="object-contain" sizes="97px" />
                  </div>
                  <div className="flex flex-col gap-[8px] items-center text-center">
                      <p className="font-dm-sans font-medium text-[20px] lg:text-[24px] text-[#fbf7ee] leading-none capitalize">{item.title}</p>
                      <p className="font-dm-sans text-[14px] lg:text-[16px] text-[#f5ecd4] leading-snug capitalize">{item.desc}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Clinics & Departments */}
          <div className="flex flex-col gap-[80px] items-center w-full">
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">Clinics &amp; Departments</h2>
              <p className="font-dm-sans text-[20px] text-[#594522] w-full">A selected team of experts committed to your health</p>
            </div>

            {loading ? (
              <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-[16px] sm:gap-[20px] xl:grid-cols-4 lg:gap-[24px]">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <>
                {womens.length === 0 && general.length === 0 && (
                  <p className="font-dm-sans text-[18px] text-[#594522] py-[60px] text-center w-full">No departments available at this time.</p>
                )}

                {womens.length > 0 && (
                  <div className="flex flex-col gap-[40px] items-start w-full">
                    <div className="flex flex-col gap-[8px] w-full">
                      <h3 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">Women &amp; Children</h3>
                      <p className="font-dm-sans text-[16px] text-[#594522]">A selected team of experts committed to your health</p>
                    </div>
                    <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-[16px] sm:gap-[20px] xl:grid-cols-4 lg:gap-[24px]">
                      {womens.map(d => <DeptCard key={d.id} dept={d} variant="pink" />)}
                    </div>
                  </div>
                )}

                {general.length > 0 && (
                  <div className="flex flex-col gap-[40px] items-start w-full">
                    <div className="flex flex-col gap-[8px] w-full">
                      <h3 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">General Hospital</h3>
                      <p className="font-dm-sans text-[18px] text-[#594522]">A selected team of experts committed to your health</p>
                    </div>
                    <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-[16px] sm:gap-[20px] xl:grid-cols-4 lg:gap-[24px]">
                      {general.map(d => <DeptCard key={d.id} dept={d} variant="gold" />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
