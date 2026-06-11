'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
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
      className="bg-white flex flex-col gap-[24px] items-center overflow-hidden p-[24px] rounded-[16px] shrink-0 w-[300px] hover:shadow-lg transition-shadow cursor-pointer"
      style={{ boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}
    >
      <div
        className="relative rounded-full overflow-hidden shrink-0 size-[120px]"
        style={{
          background: isPink
            ? 'linear-gradient(180deg, rgba(255,244,249,0.4) 0%, rgba(242,135,180,0.4) 100%)'
            : '#fbf7ee',
          boxShadow: isPink
            ? '0px 4px 30px 12px rgba(242,135,180,0.2)'
            : '0px 4px 30px 12px rgba(184,145,72,0.2)',
        }}
      >
        <Image src={icon} alt={dept.name} fill className="object-contain mix-blend-multiply" sizes="120px" unoptimized />
      </div>
      <div className="flex flex-col gap-[24px] items-center w-full">
        <p className={`font-cormorant font-medium text-[24px] text-center capitalize leading-none whitespace-nowrap ${isPink ? 'text-[#4f1b31]' : 'text-[#3b2d17]'}`}>
          {dept.name}
        </p>
        <div className={`flex items-center h-[32px] px-[12px] py-[8px] border-[1.5px] rounded-[12px] gap-[4px] ${isPink ? 'border-[#f6a3c6]' : 'border-[#b89148]'}`}>
          <span className="font-dm-sans text-[16px] text-[#5c4924] px-[8px]">Learn More</span>
          <ArrowRight size={16} className="text-[#5c4924]" />
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return <div className="rounded-[16px] bg-[#f0ebe0] animate-pulse shrink-0 w-[300px] h-[248px]" />
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
        <div className="max-w-[1512px] mx-auto w-full flex flex-col gap-[80px] items-center pb-[120px] px-4 sm:px-8 lg:px-[80px] pt-[100px] lg:pt-[212px]">

          {/* Hero slider */}
          <div className="flex gap-[16px] h-[472px] items-center justify-center w-full">
            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronLeft size={40} />
            </button>
            <div className="bg-white flex h-[472px] items-center overflow-hidden rounded-[16px] flex-1 max-w-[1352px]">
              <div className="flex flex-col gap-[40px] items-start pl-[58px] shrink-0 w-[618px]">
                <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">Orienda International Hospital</h1>
                <div className="font-dm-sans font-light text-[24px] text-[#594522] leading-[1.4]">
                  <p className="mb-[12px]">We dedicated to providing safe and reliable medical services.</p>
                  <p>Schedule an appointment to experience world-class healthcare.</p>
                </div>
                <Link href="/about" className="flex items-center h-[48px] px-[20px] py-[14px] border-[1.5px] border-[#b89148] rounded-[12px] gap-[4px]">
                  <span className="font-dm-sans text-[18px] text-[#5c4924] px-[8px]">Learn More</span>
                  <ArrowRight size={20} className="text-[#5c4924]" />
                </Link>
              </div>
              <div className="relative h-[448px] flex-1 overflow-hidden mr-[12px] rounded-[16px]">
                <Image src="/images/about/about-hero-3.jpg" alt="Orienda International Hospital" fill className="object-cover" sizes="700px" priority />
              </div>
            </div>
            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronRight size={40} />
            </button>
          </div>

          {/* Gold info banner */}
          <div className="w-full max-w-[1352px] h-[200px] rounded-[16px] overflow-hidden flex items-center justify-center" style={{ background: 'rgba(184,145,72,0.8)', boxShadow: '0px 4px 24px 3px rgba(184,145,72,0.2)' }}>
            <div className="flex items-center justify-center w-full h-full">
              {BANNER_ITEMS.map((item, i) => (
                <div key={i} className={`flex flex-col gap-[16px] items-center justify-center h-full flex-1 ${i < BANNER_ITEMS.length - 1 ? 'border-r-2 border-[#f5ecd4]' : ''}`}>
                  <div className="relative size-[97px]">
                    <Image src={item.icon} alt={item.title} fill className="object-contain" sizes="97px" />
                  </div>
                  <div className="flex flex-col gap-[8px] items-center text-center">
                    <p className="font-dm-sans font-medium text-[24px] text-[#fbf7ee] leading-none capitalize">{item.title}</p>
                    <p className="font-dm-sans text-[16px] text-[#f5ecd4] leading-none capitalize">{item.desc}</p>
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
              <div className="flex flex-wrap gap-[40px] justify-center w-full">
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
                    <div className="flex flex-wrap gap-[40px] items-center justify-center w-full">
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
                    <div className="flex flex-wrap gap-[40px] items-center justify-center w-full">
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
