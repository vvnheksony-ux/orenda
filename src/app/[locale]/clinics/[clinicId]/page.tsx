import React, { use } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import { CLINIC_DETAILS, OTHER_CLINICS, HEALTH_TIPS } from '@/lib/clinics'
import BookAppointmentButton from '@/components/shared/BookAppointmentButton'

export default function ClinicDetailPage({ params }: { params: Promise<{ clinicId: string }> }) {
  const { clinicId } = use(params)
  const clinic = CLINIC_DETAILS.find(c => c.id === clinicId)
  if (!clinic) notFound()

  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="flex flex-col gap-[80px] items-center pb-[120px] px-[80px] pt-[120px] 2xl:pt-[196px]">

          {/* Hero slider */}
          <div className="flex gap-[16px] h-[472px] items-center justify-center w-full">
            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronLeft size={40} />
            </button>
            <div className="bg-white flex h-[472px] items-center justify-end overflow-hidden relative rounded-[16px] flex-1 max-w-[1352px]">
              <div className="relative h-[448px] rounded-[16px] shrink-0 w-[650px] overflow-hidden mr-[12px]">
                <Image src="/images/about/about-hero-3.jpg" alt="Orienda International Hospital" fill className="object-cover rounded-[16px]" sizes="650px" priority />
              </div>
              <div className="absolute left-[58px] top-[79px] flex flex-col gap-[40px] items-start w-[618px]">
                <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">Orienda International Hospital</h1>
                <div className="font-dm-sans font-light text-[24px] text-[#594522] leading-[1.4]">
                  <p className="mb-[12px]">We dedicated to providing safe and reliable medical services.</p>
                  <p>Schedule and appointment to experience world-class healthcare.</p>
                </div>
                <Link href="/about" className="flex items-center h-[48px] px-[20px] py-[14px] border-[1.5px] border-[#b89148] rounded-[12px] gap-[4px]">
                  <span className="font-dm-sans text-[18px] text-[#5c4924] px-[8px]">Learn More</span>
                  <ArrowRight size={20} className="text-[#5c4924]" />
                </Link>
              </div>
            </div>
            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronRight size={40} />
            </button>
          </div>

          {/* Clinic detail — image left, info right */}
          <div className="flex gap-[40px] items-start w-full">
            {/* Photo */}
            <div className="flex-1 min-w-0 h-[636px] overflow-hidden rounded-[12px] bg-[#f3f3f3] relative">
              <Image src={clinic.photo} alt={clinic.name} fill className="object-cover" sizes="50vw" />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-[40px] items-end justify-end shrink-0 w-[760px]">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none text-center w-full">{clinic.name}</h2>

              {/* Description */}
              <div className="font-dm-sans font-normal text-[24px] text-black w-full">
                {clinic.description.map((p, i) => (
                  <p key={i} className="leading-[1.5] mb-[12px] last:mb-0">{p}</p>
                ))}
              </div>

              {/* Services list */}
              <div className="font-dm-sans font-normal text-[24px] text-black w-full">
                <p className="leading-[1.5] mb-[12px]">We are able to provide:</p>
                <ul className="list-disc pl-[36px] flex flex-col gap-[4px]">
                  {clinic.services.map((s, i) => (
                    <li key={i} className="leading-[1.5]">{s}</li>
                  ))}
                </ul>
              </div>

              {/* Book Appointment */}
              <BookAppointmentButton
                defaultService={clinic.name}
                className="flex items-center justify-center h-[64px] px-[24px] rounded-[12px] bg-[#b89148] shrink-0 font-dm-sans text-[20px] text-[#f9f9f9] leading-none"
                style={{ boxShadow: '0px 0px 12px 4px rgba(184,145,72,0.15)' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Discover Other Clinic */}
          <div className="flex flex-col gap-[40px] items-center w-full">
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">Discover Other Clinic</h2>
              <p className="font-dm-sans text-[20px] text-[#594522]">Meet Our Specialists in This Department</p>
            </div>
            <div className="flex gap-[40px] items-center justify-center flex-wrap w-full">
              {OTHER_CLINICS.filter(c => c.id !== clinicId).slice(0, 4).map((c) => (
                <Link key={c.id} href={`/clinics/${c.id}` as any} className="bg-white flex flex-col gap-[24px] items-center overflow-hidden p-[24px] rounded-[16px] shrink-0 w-[300px]" style={{ boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}>
                  <div className="relative rounded-full overflow-hidden shrink-0 size-[120px] bg-[#fbf7ee]" style={{ boxShadow: '0px 4px 30px 12px rgba(184,145,72,0.2)' }}>
                    <Image src={c.icon} alt={c.name} fill className="object-contain p-[10px]" sizes="120px" />
                  </div>
                  <div className="flex flex-col gap-[24px] items-center w-full">
                    <p className="font-cormorant font-medium text-[24px] text-[#3b2d17] text-center capitalize leading-none whitespace-nowrap">{c.name}</p>
                    <div className="flex items-center h-[32px] px-[12px] py-[8px] border-[1.5px] border-[#b89148] rounded-[12px] gap-[4px]">
                      <span className="font-dm-sans text-[16px] text-[#5c4924] px-[8px]">Learn More</span>
                      <ArrowRight size={16} className="text-[#5c4924]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/clinics" className="flex items-center h-[32px] px-[12px] py-[8px] border border-[#b89148] rounded-[12px] gap-[4px] w-[145px] justify-center" style={{ boxShadow: '0px 2px 6px 0px rgba(0,0,0,0.05)' }}>
              <span className="font-dm-sans text-[12px] text-[#5c4924]">See More</span>
              <ArrowRight size={16} className="text-[#5c4924]" />
            </Link>
          </div>

          {/* Health Tips */}
          <div className="flex flex-col gap-[40px] items-center w-full">
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">Health Tips</h2>
              <p className="font-dm-sans text-[20px] text-[#594522] w-full">Article for health care tips</p>
            </div>
            <div className="flex gap-[40px] items-center w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {HEALTH_TIPS.map((tip, i) => (
                <div key={i} className="bg-white flex flex-col items-center overflow-hidden rounded-[16px] shrink-0 w-[300px]" style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}>
                  {/* Image */}
                  <div className="relative h-[170px] w-full bg-[#f9f9f9] overflow-hidden">
                    <Image src={tip.img} alt={tip.title} fill className="object-cover" sizes="300px" />
                  </div>
                  {/* Card body */}
                  <div className="flex flex-col h-[200px] items-end justify-between pb-[24px] pt-[32px] px-[24px] w-full">
                    <p className="font-dm-sans font-medium text-[16px] text-[#3b2d17] leading-[1.5] w-full">{tip.title}</p>
                    <div className="flex items-center h-[32px] px-[12px] py-[8px] border border-[#b89148] rounded-[12px] gap-[4px] shrink-0">
                      <span className="font-dm-sans text-[12px] text-[#594522] px-[8px]">Read More</span>
                      <ArrowRight size={16} className="text-[#594522]" />
                    </div>
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
