'use client'

import Image from 'next/image'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { useState, useEffect, use } from 'react'
import { useLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import BookAppointmentButton from '@/components/shared/BookAppointmentButton'
import { useBranch } from '@/lib/branch-context'

interface Department {
  id: string; name: string; slug: string; icon: string | null; description?: string
}
interface HealthTip {
  id: string; title: string; slug: string; excerpt?: string; thumbnail?: string | null; category?: string; publishedAt?: string
}

function formatDate(d?: string) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return '' }
}

export default function DepartmentDetailPage({ params }: { params: Promise<{ departmentId: string }> }) {
  const { departmentId } = use(params)
  const locale = useLocale()
  const { selectedBranch, ready } = useBranch()
  const [dept, setDept] = useState<Department | null>(null)
  const [others, setOthers] = useState<Department[]>([])
  const [tips, setTips] = useState<HealthTip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for the branch to resolve, then fetch departments for THIS branch only —
    // the detail page and its "Discover Other Clinic" cards must stay branch-specific.
    // (Health tips are global, so they're not branch-filtered.)
    if (!ready) return
    let active = true
    setLoading(true)
    const branchParam = selectedBranch ? `&branch=${selectedBranch.id}` : ''
    Promise.all([
      fetch(`/api/departments?locale=${locale}${branchParam}`).then(r => r.json()).catch(() => null),
      fetch(`/api/health-tips?locale=${locale}&limit=8`).then(r => r.json()).catch(() => null),
    ]).then(([deptData, tipData]) => {
      if (!active) return
      const depts: Department[] = (deptData?.docs || []).filter((dep: any) => dep.icon)
      const found = depts.find(dep => dep.slug === departmentId || dep.id === departmentId)
      setDept(found ?? null)
      setOthers(depts.filter(dep => dep.id !== found?.id).slice(0, 4))
      const arr = tipData?.docs || (Array.isArray(tipData) ? tipData : [])
      setTips(arr.slice(0, 8))
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [locale, departmentId, selectedBranch, ready])

  if (loading) return (
    <SiteLayout>
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#b89148] border-t-transparent rounded-full animate-spin" />
      </div>
    </SiteLayout>
  )

  if (!dept) return notFound()

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">
        <div className="page-shell flex flex-col gap-[80px] items-center pb-[120px] pt-[100px] lg:pt-[212px]">

          {/* Hero */}
          <PromotionStyleHero
            imageSrc="/images/about/about-hero-3.jpg"
            imageAlt="Orienda International Hospital"
            title="Orienda International Hospital"
            lines={[
              'We dedicated to providing safe and reliable medical services.',
              'Schedule an appointment to experience world-class healthcare.',
            ]}
          />

          {/* Department detail — description only. The Figma's left photo is left blank
              until a `photo` field is added to the Clinics/Departments collection in Payload. */}
          <div className="flex w-full max-w-[860px] flex-col items-center gap-[28px] text-center">
            <h2 className="font-cormorant text-[36px] font-bold capitalize leading-none text-[#3b2d17] sm:text-[42px] lg:text-[48px]">
              {dept.name}
            </h2>
            <p className="font-dm-sans text-[16px] leading-[1.7] text-[#594522] sm:text-[18px] lg:text-[20px]">
              {dept.description
                || `Orienda International Hospital provides comprehensive ${dept.name} services with a dedicated team of specialists.`}
            </p>
            <BookAppointmentButton
              defaultService={dept.name}
              className="flex w-fit items-center gap-2 rounded-[12px] bg-[#b89148] px-6 py-3 font-dm-sans text-[16px] text-white transition-colors hover:bg-[#9a7a3c]"
              label="Book Appointment"
            />
          </div>

          {/* Discover Other Clinic */}
          {others.length > 0 && (
            <div className="flex w-full max-w-[1352px] flex-col items-center gap-[40px]">
              <div className="flex flex-col items-center gap-[12px] text-center">
                <h3 className="font-cormorant text-[36px] font-bold leading-none text-[#3b2d17] lg:text-[40px]">Discover Other Clinic</h3>
                <p className="font-dm-sans text-[16px] text-[#594522] lg:text-[18px]">Meet our specialists in this department</p>
              </div>
              <div className="grid w-full grid-cols-2 gap-[16px] sm:gap-[20px] lg:gap-[24px] xl:grid-cols-4">
                {others.map(other => (
                  <Link
                    key={other.id}
                    href={`/departments/${other.slug || other.id}` as any}
                    className="group flex w-full flex-col items-center gap-4 rounded-[16px] bg-white p-4 text-center transition-shadow hover:shadow-lg sm:gap-5 sm:p-5 lg:gap-6 lg:p-6"
                    style={{ boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}
                  >
                    {other.icon && (
                      <div
                        className="relative size-[88px] shrink-0 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105 sm:size-[104px] lg:size-[120px]"
                        style={{ background: 'var(--background)', boxShadow: '0px 4px 30px 12px rgba(184,145,72,0.2)' }}
                      >
                        <Image src={other.icon} alt={other.name} fill className="object-contain mix-blend-multiply" sizes="120px" unoptimized />
                      </div>
                    )}
                    <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
                      <p className="font-cormorant text-[18px] font-medium capitalize leading-none text-balance text-[#3b2d17] sm:text-[20px] lg:text-[24px]">{other.name}</p>
                      <div className="flex items-center gap-[4px] rounded-[12px] border-[1.5px] border-[#b89148] px-[12px] py-[8px] transition-colors group-hover:bg-[rgba(184,145,72,0.06)]">
                        <span className="px-[6px] font-dm-sans text-[14px] text-[#5c4924] sm:px-[8px] sm:text-[16px]">Learn More</span>
                        <ArrowRight size={16} className="text-[#5c4924]" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/departments"
                className="rounded-[32px] border-[1.5px] border-[#b89148] px-8 py-3 font-dm-sans text-[16px] text-[#5c4924] transition-colors hover:bg-[#b89148]/10"
              >
                See More
              </Link>
            </div>
          )}

          {/* Health Tips */}
          {tips.length > 0 && (
            <div className="flex w-full max-w-[1352px] flex-col items-center gap-[40px]">
              <div className="flex flex-col items-center gap-[12px] text-center">
                <h3 className="font-cormorant text-[36px] font-bold leading-none text-[#3b2d17] lg:text-[40px]">Health Tips</h3>
                <p className="font-dm-sans text-[16px] text-[#594522] lg:text-[18px]">Articles for health care tips</p>
              </div>
              {/* Auto-scrolling row (cards duplicated so the loop is seamless) */}
              <div className="w-full overflow-hidden">
                <div className="flex w-max health-tips-scroll">
                  {[...tips, ...tips].map((tip, i) => (
                    <div
                      key={`${tip.id}-${i}`}
                      className="mr-[24px] flex w-[280px] shrink-0 flex-col overflow-hidden rounded-[12px] bg-white shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] sm:w-[320px] lg:mr-[40px]"
                    >
                      <div className="relative h-[200px] shrink-0 overflow-hidden bg-[#f9f9f9]">
                        {tip.thumbnail ? (
                          <Image src={tip.thumbnail} alt={tip.title} fill className="object-cover" sizes="320px" unoptimized />
                        ) : (
                          <div className="h-full w-full bg-[#ead6a4]/30" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-[16px] p-[24px]">
                        <div className="flex flex-col gap-[12px]">
                          {tip.publishedAt && (
                            <p className="font-dm-sans text-[10px] font-light text-[rgba(59,45,23,0.7)]">{formatDate(tip.publishedAt)}</p>
                          )}
                          <p className="font-dm-sans text-[16px] font-medium leading-snug text-[#3b2d17] line-clamp-2">{tip.title}</p>
                        </div>
                        <Link
                          href={`/health-tips/${tip.slug}` as any}
                          className="flex h-[32px] shrink-0 items-center gap-1 self-end rounded-[12px] border border-[#b89148] px-[12px] py-[8px] font-dm-sans text-[12px] text-[#594522] transition-colors hover:bg-[var(--background)]"
                        >
                          Read More
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </SiteLayout>
  )
}
