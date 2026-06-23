'use client'

import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import SiteLayout from '@/components/layout/SiteLayout'
import Reveal from '@/components/shared/Reveal'
import { Link } from '@/i18n/routing'
import BookAppointmentButton from '@/components/shared/BookAppointmentButton'
import { DoctorProfileCard } from '@/components/shared/DoctorProfileCard'


interface Doctor {
  id: string
  name: string
  specialty: string
  image_url: string | null
}

export default function CentersOfExcellencePage() {
  const locale = useLocale()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorsLoading, setDoctorsLoading] = useState(true)
  const [testimonials, setTestimonials] = useState<Array<{ text: string; author: string }>>([])
  const [stats, setStats] = useState([
    { value: '99%', label: 'Success Rate' },
    { value: '20k+', label: 'Surgeries' },
    { value: '100%', label: 'Satisfaction' },
  ])

  useEffect(() => {
    fetch(`/api/doctors?locale=${locale}`)
      .then(r => r.json())
      .then(d => {
        const docs = Array.isArray(d) ? d : (d?.docs || [])
        setDoctors(docs.slice(0, 4))
      })
      .catch(() => {})
      .finally(() => setDoctorsLoading(false))
    fetch(`/api/testimonials?locale=${locale}`)
      .then(r => r.json())
      .then(d => { if (d.docs?.length) setTestimonials(d.docs) })
      .catch(() => {})
    fetch(`/api/why-stats?locale=${locale}`)
      .then(r => r.json())
      .then(d => { if (d.docs?.length) setStats(d.docs.slice(0, 3)) })
      .catch(() => {})
  }, [locale])

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">
        <div className="page-shell flex flex-col gap-[clamp(72px,6vw,96px)] items-center pb-[120px] pt-[100px] md:pt-[clamp(150px,14vw,212px)]">

          {/* ── Hero ── */}
          <div className="flex flex-col gap-[56px] w-full">

            {/* Breadcrumb + Title + Image row */}
            <div className="flex flex-col min-[980px]:flex-row items-start justify-between w-full gap-8 min-[980px]:gap-[clamp(28px,3.2vw,48px)]">
              <div className="flex flex-col gap-[24px] flex-1 min-w-0">
                {/* Breadcrumb */}
                <Link href="/departments" className="flex items-center gap-[12px] text-[#594522] hover:opacity-70 transition-opacity w-fit">
                  <ArrowLeft size={24} strokeWidth={1.5} />
                  <span className="font-dm-sans text-[18px] leading-none">Centers of Excellence</span>
                </Link>

                {/* Title */}
                <h1 className="font-cormorant font-bold text-[42px] min-[980px]:text-[clamp(52px,4.2vw,64px)] text-[#3b2d17] leading-none">
                  Neurosurgery
                </h1>

                {/* Description */}
                <p className="font-dm-sans text-[16px] min-[980px]:text-[clamp(17px,1.3vw,20px)] text-[#3b2d17] leading-relaxed max-w-[680px]">
                  Our Neurosurgery Center of Excellence combines world-class surgical expertise with groundbreaking technology to treat complex conditions of the brain, spine, and nervous system. Here, advanced precision meets compassionate healing to help you reclaim your quality of life.
                </p>
              </div>

              {/* Brain illustration */}
              <div className="relative shrink-0 w-full min-[980px]:w-[clamp(360px,34vw,520px)] h-[260px] sm:h-[340px] min-[980px]:h-[clamp(340px,29vw,440px)] rounded-[24px] overflow-hidden">
                <Image
                  src="/images/centers/neurosurgery.jpg"
                  alt="Neurosurgery"
                  fill
                  className="object-cover"
                  sizes="(max-width: 979px) 100vw, 34vw"
                  priority
                />
              </div>
            </div>

            {/* Stats + CTA */}
            <div className="flex flex-col gap-[40px] items-start">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] sm:gap-[clamp(16px,1.6vw,24px)] items-stretch w-full max-w-[760px]">
                {stats.map(s => (
                  <div
                    key={s.label}
                    className="flex flex-col gap-[12px] items-center justify-center w-full min-h-[140px] sm:min-h-[clamp(140px,11vw,160px)] rounded-xl bg-[#F9F5EE] shadow-[inset_0px_3px_16px_rgba(184,145,72,0.10),0px_4px_16px_4px_rgba(0,0,0,0.08)] hover:shadow-[inset_0px_3px_24px_rgba(184,145,72,0.14),0px_8px_24px_6px_rgba(0,0,0,0.12)] hover:bg-[#F4EEDF] transition-all duration-300 group px-4 py-6"
                  >
                    <p className="font-cormorant font-bold text-[clamp(42px,3.2vw,48px)] text-[#3b2d17] leading-none group-hover:scale-105 transition-transform duration-300">
                      {s.value}
                    </p>
                    <p className="font-dm-sans text-[16px] text-[#7a5f2c] leading-none">{s.label}</p>
                  </div>
                ))}
              </div>
              <BookAppointmentButton
                label="Book Appointment"
                className="flex items-center justify-center px-[24px] md:px-[clamp(24px,2.1vw,32px)] py-[16px] rounded-[12px] bg-[#b89148] hover:bg-[#9a7a3c] transition-colors font-dm-sans font-semibold text-[18px] md:text-[clamp(18px,1.3vw,20px)] text-[#fbf7ee]"
              />
            </div>
          </div>

          {/* ── Patient Testimonials ── */}
          <div className="flex flex-col gap-[52px] items-center w-full">
            <Reveal className="flex flex-col gap-[12px] text-center">
              <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none">Patient Testimonials</h2>
              <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522]">Hear from those we&apos;ve had the privilege to care for.</p>
            </Reveal>

            {/* 2-column staggered grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full max-w-[1180px]">
              {/* Left column — 3 cards */}
              <div className="flex flex-col gap-[24px]">
                {testimonials.slice(0, 3).map((t, i) => (
                  <TestimonialCard key={i} text={t.text} author={t.author} />
                ))}
              </div>
              {/* Right column — 2 cards (Figma leaves bottom-right empty) */}
              <div className="flex flex-col gap-[24px]">
                {testimonials.slice(3, 5).map((t, i) => (
                  <TestimonialCard key={i} text={t.text} author={t.author} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Meet Our Specialist ── */}
          <div className="flex flex-col gap-[48px] items-center w-full">
            <Reveal className="flex flex-col gap-[12px] text-center">
              <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none">Meet Our Specialist</h2>
              <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522]">Meet Our Specialists in This Department</p>
            </Reveal>

            <div className="grid w-full grid-cols-1 min-[520px]:grid-cols-2 min-[1180px]:grid-cols-4 justify-items-center gap-[18px] min-[1180px]:gap-[clamp(18px,1.85vw,28px)]">
              {doctorsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-[clamp(300px,28vw,400px)] w-full max-w-[300px] rounded-[16px] bg-[var(--background)] animate-pulse" style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }} />
                  ))
                : doctors.length > 0
                ? doctors.map(doc => <DoctorProfileCard key={doc.id} id={doc.id} name={doc.name} specialty={doc.specialty} imageUrl={doc.image_url} />)
                : <p className="font-dm-sans text-[18px] text-[#594522] py-8 text-center w-full">No specialists available.</p>
              }
            </div>

            <Link
              href="/doctors"
              className="flex items-center gap-[8px] h-[44px] px-[24px] py-[10px] border border-[#b89148] rounded-[12px] hover:bg-[#b89148] hover:text-white transition-colors group"
            >
              <span className="font-dm-sans text-[16px] text-[#5c4924] group-hover:text-white transition-colors">See More</span>
              <ArrowRight size={18} className="text-[#5c4924] group-hover:text-white transition-colors" />
            </Link>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}

function TestimonialCard({ text, author }: { text: string; author: string }) {
  return (
    <div className="relative flex flex-col gap-[20px] p-[32px] rounded-xl bg-[#F9F5EE] shadow-[inset_0px_3px_16px_rgba(184,145,72,0.10),0px_4px_16px_4px_rgba(0,0,0,0.08)] hover:shadow-[inset_0px_3px_24px_rgba(184,145,72,0.14),0px_8px_24px_6px_rgba(0,0,0,0.12)] hover:bg-[#F4EEDF] transition-all duration-300">
      {/* Golden quote mark */}
      <div className="text-[#b89148] opacity-50 text-[64px] leading-none font-serif select-none -mb-4">&ldquo;</div>
      <p className="font-dm-sans text-[16px] text-[#3b2d17] leading-relaxed">{text}</p>
      <p className="font-cormorant font-bold text-[20px] text-[#b89148] leading-none">— {author}</p>
    </div>
  )
}
