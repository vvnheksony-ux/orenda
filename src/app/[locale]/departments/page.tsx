'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import { useState, useEffect } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'
import Reveal from '@/components/shared/Reveal'
import { Link } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { useBranch } from '@/lib/branch-context'

interface Department {
  id: string
  name: string
  slug: string
  icon: string | null
}

const WOMENS_KEYWORDS = ['obstetric','gynecolog','gynaecolog','pediatric','paediatric','women','child','neonat','maternity']

function isWomens(dept: Department) {
  const lower = dept.name.toLowerCase()
  return WOMENS_KEYWORDS.some(k => lower.includes(k))
}

const BANNER_ITEMS = [
  { icon: '/images/clinics/banner-icon1.png', titleKey: 'banner1Title' as const,  descKey: 'banner1Desc' as const },
  { icon: '/images/clinics/banner-icon2.png', titleKey: 'banner2Title' as const,  descKey: 'banner2Desc' as const },
  { icon: '/images/clinics/banner-icon3.png', titleKey: 'banner3Title' as const,  descKey: 'banner3Desc' as const },
]

function DeptCard({ dept, variant, learnMoreLabel }: { dept: Department; variant: 'pink' | 'gold'; learnMoreLabel: string }) {
  const icon = dept.icon || '/images/specialty-obstetric.png'
  const isPink = variant === 'pink'

  return (
    <Link
      href={`/departments/${dept.slug || dept.id}` as any}
      className="group flex w-full flex-col items-center gap-4 overflow-hidden rounded-[16px] bg-white p-4 text-center transition-shadow hover:shadow-lg sm:gap-5 sm:p-5 lg:gap-6 lg:p-6"
      style={{ boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}
    >
      <div
        className="relative size-[88px] shrink-0 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105 sm:size-[104px] lg:size-[120px]"
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
      <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
        <p className={`font-cormorant text-[18px] font-medium capitalize leading-none text-balance sm:text-[20px] lg:text-[24px] ${isPink ? 'text-[#4f1b31]' : 'text-[#3b2d17]'}`}>
          {dept.name}
        </p>
        <div className={`flex items-center gap-[4px] rounded-[12px] border-[1.5px] px-[12px] py-[8px] transition-colors group-hover:bg-[rgba(184,145,72,0.06)] ${isPink ? 'border-[#f6a3c6]' : 'border-[#b89148]'}`}>
                          <span className="px-[6px] font-dm-sans text-[14px] text-[#5c4924] sm:px-[8px] sm:text-[16px]">{learnMoreLabel}</span>
          <ArrowRight size={16} className="text-[#5c4924]" />
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return <div className="aspect-square w-full rounded-[16px] bg-[rgba(245,236,212,0.2)] animate-pulse" />
}

export default function DepartmentsPage() {
  const locale = useLocale()
  const t = useTranslations('Departments')
  const { selectedBranch, ready } = useBranch()
  const [depts, setDepts] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait until the branch is resolved, then fire exactly one fetch. Firing before
    // `ready` would run a no-branch "all departments" request that races the real
    // branch request — the non-deterministic cause of Women & Children flickering.
    if (!ready) return
    let active = true
    setLoading(true)
    const branchParam = selectedBranch ? `&branch=${selectedBranch.id}` : ''
    fetch(`/api/departments?locale=${locale}${branchParam}`)
      .then(r => r.json())
      .then(d => {
        if (!active) return
        if (d?.docs?.length) {
          setDepts(
            d.docs
              .filter((dept: any) => dept.name)
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
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [locale, selectedBranch, ready])

  const womens  = depts.filter(d => isWomens(d))
  const general = depts.filter(d => !isWomens(d))

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">
        <div className="page-shell flex flex-col gap-[80px] items-center pb-[120px] pt-[90px] lg:pt-[150px]">

          {/* Hero slider */}
          <PromotionStyleHero
            imageSrc="/images/about/about-hero-3.jpg"
            imageAlt="Orienda International Hospital"
            title={t('heroTitle')}
            lines={[
              t('heroLine1'),
              t('heroLine2'),
            ]}
          />

          {/* Gold info banner */}
          <div className="w-full max-w-[1352px] rounded-[16px] overflow-hidden flex items-center justify-center px-4 py-6 lg:p-0" style={{ background: 'rgba(184,145,72,0.8)', boxShadow: '0px 4px 24px 3px rgba(184,145,72,0.2)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 items-stretch justify-center w-full h-full">
              {BANNER_ITEMS.map((item, i) => (
                <div key={i} className={`flex flex-col gap-[16px] items-center justify-center h-full px-4 py-5 ${i < BANNER_ITEMS.length - 1 ? 'md:border-r-2 md:border-b-0 border-b border-[#f5ecd4]' : ''}`}>
                  <div className="relative size-[97px]">
                    <Image src={item.icon} alt={t(item.titleKey)} fill className="object-contain" sizes="97px" />
                  </div>
                  <div className="flex flex-col gap-[8px] items-center text-center">
                      <p className="font-dm-sans font-medium text-[20px] lg:text-[24px] text-[#fbf7ee] leading-none capitalize">{t(item.titleKey)}</p>
                      <p className="font-dm-sans text-[14px] lg:text-[16px] text-[#f5ecd4] leading-snug capitalize">{t(item.descKey)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Clinics & Departments */}
          <div className="flex flex-col gap-[80px] items-center w-full">
            <Reveal className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">{t('heading')}</h2>
              <p className="font-dm-sans text-[20px] text-[#594522] w-full">{t('subtitle')}</p>
            </Reveal>

            {loading ? (
              <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-[16px] sm:gap-[20px] md:grid-cols-4 lg:gap-[24px]">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : depts.length === 0 ? (
                <p className="font-dm-sans text-[18px] text-[#594522] py-[60px] text-center w-full">{t('noDepartments')}</p>
              ) : (
                <>
                  {/* Women & Children — heading always shown; cards only when this branch has them */}
                  <div className="flex flex-col gap-[40px] items-start w-full">
                    <div className="flex flex-col gap-[8px] w-full">
                      <h3 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">{t('womensHealth')}</h3>
                      <p className="font-dm-sans text-[16px] text-[#594522]">{t('womensSub')}</p>
                    </div>
                    {womens.length > 0 && (
                      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-[16px] sm:gap-[20px] md:grid-cols-4 lg:gap-[24px]">
                        {womens.map(d => <DeptCard key={d.id} dept={d} variant="pink" learnMoreLabel={t('learnMore')} />)}
                      </div>
                    )}
                  </div>

                  {/* General Hospital — heading always shown; cards only when this branch has them */}
                  <div className="flex flex-col gap-[40px] items-start w-full">
                    <div className="flex flex-col gap-[8px] w-full">
                      <h3 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">{t('generalHospital')}</h3>
                      <p className="font-dm-sans text-[18px] text-[#594522]">{t('generalSub')}</p>
                    </div>
                    {general.length > 0 && (
                      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-[16px] sm:gap-[20px] md:grid-cols-4 lg:gap-[24px]">
                        {general.map(d => <DeptCard key={d.id} dept={d} variant="gold" learnMoreLabel={t('learnMore')} />)}
                      </div>
                    )}
                  </div>
                </>
              )}
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
