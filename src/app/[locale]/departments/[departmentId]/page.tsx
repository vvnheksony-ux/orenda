'use client'

import Image from 'next/image'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import { ArrowRight } from 'lucide-react'
import { useState, useEffect, use } from 'react'
import { useLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import BookAppointmentButton from '@/components/shared/BookAppointmentButton'

interface Department {
  id: string; name: string; slug: string; icon: string | null
}

export default function DepartmentDetailPage({ params }: { params: Promise<{ departmentId: string }> }) {
  const { departmentId } = use(params)
  const locale = useLocale()
  const [dept, setDept] = useState<Department | null>(null)
  const [others, setOthers] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/departments?locale=${locale}`)
      .then(r => r.json())
      .then(d => {
        const depts: Department[] = (d?.docs || []).filter((dep: any) => dep.icon)
        const found = depts.find(dep => dep.slug === departmentId || dep.id === departmentId)
        setDept(found ?? null)
        setOthers(depts.filter(dep => dep.id !== found?.id).slice(0, 4))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locale, departmentId])

  if (loading) return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#b89148] border-t-transparent rounded-full animate-spin" />
      </div>
    </SiteLayout>
  )

  if (!dept) return notFound()

  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="page-shell flex flex-col gap-[80px] items-center pb-[120px] pt-[100px] lg:pt-[212px]">

          {/* Hero */}
          <PromotionStyleHero
            imageSrc={dept.icon || '/images/about/about-hero-3.jpg'}
            imageAlt={dept.name}
            title={dept.name}
            lines={[
              `World-class ${dept.name} services at Orienda International Hospital.`,
              'Book an appointment with our specialist team today.',
            ]}
            cta={
              <BookAppointmentButton
                defaultService={dept.name}
                className="self-start flex items-center gap-1 px-3.5 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-3 rounded-[10px] lg:rounded-[12px] border-[1.5px] border-gold-500 font-dm-sans text-[11px] sm:text-[13px] xl:text-[18px] text-gold-800 hover:bg-gold-50 transition-colors"
                label="Book Appointment"
              />
            }
          />

          {/* Dept icon + info */}
          <div className="flex flex-col sm:flex-row gap-[24px] lg:gap-[40px] items-center sm:items-start w-full max-w-[1352px] text-center sm:text-left">
            {dept.icon && (
              <div className="shrink-0 size-[176px] relative">
                <Image src={dept.icon} alt={dept.name} fill className="object-contain" sizes="176px" unoptimized />
              </div>
            )}
            <div className="flex flex-col gap-[16px]">
              <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none">{dept.name}</h2>
              <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522]">
                Orienda International Hospital provides comprehensive {dept.name} services with a dedicated team of specialists.
              </p>
            </div>
          </div>

          {/* Other departments */}
          {others.length > 0 && (
            <div className="flex flex-col gap-[40px] items-center w-full max-w-[1352px]">
              <h3 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">Other Departments</h3>
              <div className="flex gap-[40px] flex-wrap justify-center">
                {others.map(other => (
                  <Link key={other.id} href={`/departments/${other.slug || other.id}` as any}
                    className="bg-white flex flex-col gap-[16px] items-center p-[24px] rounded-[16px] w-[240px] hover:shadow-lg transition-shadow"
                    style={{ boxShadow: '0px 4px 16px rgba(122,95,44,0.10)' }}>
                    {other.icon && (
                      <div className="relative size-[96px] shrink-0">
                        <Image src={other.icon} alt={other.name} fill className="object-contain" sizes="96px" unoptimized />
                      </div>
                    )}
                    <p className="font-cormorant font-bold text-[20px] text-[#3b2d17] text-center leading-tight">{other.name}</p>
                    <div className="flex items-center gap-[4px] font-dm-sans text-[13px] text-[#b89148]">
                      Learn More <ArrowRight size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </SiteLayout>
  )
}
