'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
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
        <div className="max-w-[1512px] mx-auto w-full flex flex-col gap-[80px] items-center pb-[120px] px-4 sm:px-8 lg:px-[80px] pt-[100px] lg:pt-[212px]">

          {/* Hero */}
          <div className="flex gap-[16px] h-[472px] items-center justify-center w-full">
            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronLeft size={40} />
            </button>
            <div className="bg-white flex h-[472px] items-center justify-end overflow-hidden relative rounded-[16px] flex-1 max-w-[1352px]">
              <div className="relative h-[448px] rounded-[16px] shrink-0 w-[650px] overflow-hidden mr-[12px]">
                <Image src="/images/about/about-hero-3.jpg" alt={dept.name} fill className="object-cover rounded-[16px]" sizes="650px" priority />
              </div>
              <div className="absolute left-[58px] top-[79px] flex flex-col gap-[40px] items-start" style={{ maxWidth: 'calc(100% - 720px)' }}>
                <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">{dept.name}</h1>
                <div className="font-dm-sans font-light text-[24px] text-[#594522] leading-[1.4]">
                  <p className="mb-[12px]">World-class {dept.name} services at Orienda International Hospital.</p>
                  <p>Book an appointment with our specialist team today.</p>
                </div>
                <BookAppointmentButton
                  defaultService={dept.name}
                  className="flex items-center h-[48px] px-[20px] py-[14px] border-[1.5px] border-[#b89148] rounded-[12px] gap-[4px] font-dm-sans text-[18px] text-[#5c4924] hover:bg-[#b89148] hover:text-white transition-colors"
                  label="Book Appointment"
                />
              </div>
            </div>
            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronRight size={40} />
            </button>
          </div>

          {/* Dept icon + info */}
          <div className="flex gap-[40px] items-center w-full max-w-[1352px]">
            {dept.icon && (
              <div className="bg-white rounded-full overflow-hidden shrink-0 size-[160px]"
                style={{ boxShadow: '0px 4px 30px 12px rgba(184,145,72,0.2)' }}>
                <Image src={dept.icon} alt={dept.name} width={160} height={160} className="object-contain p-[16px]" unoptimized />
              </div>
            )}
            <div className="flex flex-col gap-[16px]">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">{dept.name}</h2>
              <p className="font-dm-sans text-[20px] text-[#594522]">
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
                      <div className="bg-[#f5ecd4] rounded-full size-[80px] overflow-hidden flex items-center justify-center">
                        <Image src={other.icon} alt={other.name} width={80} height={80} className="object-contain p-[8px]" unoptimized />
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
