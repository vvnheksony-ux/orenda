'use client'

import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import BookAppointmentButton from '@/components/shared/BookAppointmentButton'


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
        <div className="page-shell flex flex-col gap-[72px] lg:gap-[96px] items-center pb-[120px] pt-[100px] lg:pt-[212px]">

          {/* ── Hero ── */}
          <div className="flex flex-col gap-[56px] w-full">

            {/* Breadcrumb + Title + Image row */}
            <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-8 lg:gap-[48px]">
              <div className="flex flex-col gap-[24px] flex-1 min-w-0">
                {/* Breadcrumb */}
                <Link href="/departments" className="flex items-center gap-[12px] text-[#594522] hover:opacity-70 transition-opacity w-fit">
                  <ArrowLeft size={24} strokeWidth={1.5} />
                  <span className="font-dm-sans text-[18px] leading-none">Centers of Excellence</span>
                </Link>

                {/* Title */}
                <h1 className="font-cormorant font-bold text-[42px] sm:text-[52px] lg:text-[64px] text-[#3b2d17] leading-none">
                  Neurosurgery
                </h1>

                {/* Description */}
                <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#3b2d17] leading-relaxed max-w-[640px]">
                  Our Neurosurgery Center of Excellence combines world-class surgical expertise with groundbreaking technology to treat complex conditions of the brain, spine, and nervous system. Here, advanced precision meets compassionate healing to help you reclaim your quality of life.
                </p>
              </div>

              {/* Brain illustration */}
              <div className="relative shrink-0 w-full lg:w-[480px] h-[260px] sm:h-[340px] lg:h-[420px] rounded-[24px] overflow-hidden">
                <Image
                  src="/images/centers/neurosurgery.jpg"
                  alt="Neurosurgery"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                  priority
                />
              </div>
            </div>

            {/* Stats + CTA */}
            <div className="flex flex-col gap-[40px] items-start">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px] lg:gap-[24px] items-stretch w-full">
                {stats.map(s => (
                  <div
                    key={s.label}
                    className="flex flex-col gap-[12px] items-center justify-center w-full sm:min-h-[160px] rounded-xl bg-[#F9F5EE] shadow-[inset_0px_3px_16px_rgba(184,145,72,0.10),0px_4px_16px_4px_rgba(0,0,0,0.08)] hover:shadow-[inset_0px_3px_24px_rgba(184,145,72,0.14),0px_8px_24px_6px_rgba(0,0,0,0.12)] hover:bg-[#F4EEDF] transition-all duration-300 group px-4 py-6"
                  >
                    <p className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none group-hover:scale-105 transition-transform duration-300">
                      {s.value}
                    </p>
                    <p className="font-dm-sans text-[16px] text-[#7a5f2c] leading-none">{s.label}</p>
                  </div>
                ))}
              </div>
              <BookAppointmentButton
                label="Book Appointment"
                className="flex items-center justify-center px-[24px] lg:px-[32px] py-[16px] rounded-[12px] bg-[#b89148] hover:bg-[#9a7a3c] transition-colors font-dm-sans font-semibold text-[18px] lg:text-[20px] text-[#fbf7ee]"
              />
            </div>
          </div>

          {/* ── Patient Testimonials ── */}
          <div className="flex flex-col gap-[52px] items-center w-full">
            <div className="flex flex-col gap-[12px] text-center">
              <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none">Patient Testimonials</h2>
              <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522]">Hear from those we&apos;ve had the privilege to care for.</p>
            </div>

            {/* 2-column staggered grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] w-full">
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
            <div className="flex flex-col gap-[12px] text-center">
              <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none">Meet Our Specialist</h2>
              <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522]">Meet Our Specialists in This Department</p>
            </div>

            <div className="grid w-full grid-cols-2 justify-items-center gap-[12px] sm:gap-[20px] lg:grid-cols-4 lg:gap-[28px]">
              {doctorsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] w-full max-w-[168px] sm:max-w-[240px] lg:max-w-[300px] rounded-[16px] bg-[#F9F5EE] animate-pulse shadow-[inset_0px_3px_16px_rgba(184,145,72,0.10),0px_4px_16px_4px_rgba(0,0,0,0.08)]" />
                  ))
                : doctors.length > 0
                ? doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)
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

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div
      className="relative flex w-full max-w-[168px] flex-col items-center overflow-hidden rounded-[16px] bg-[#F9F5EE] sm:max-w-[240px] lg:max-w-[300px]"
      style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.15)' }}
    >
      {/* Gold gradient header band */}
      <div
        className="h-[110px] w-full shrink-0 sm:h-[150px] lg:h-[180px]"
        style={{ background: 'linear-gradient(133deg, rgba(234,214,164,0.6) 0%, rgba(184,145,72,0.85) 50%, rgba(234,214,164,0.6) 100%)' }}
      />

      {/* Doctor avatar — overlapping the band */}
      <div
        className="absolute top-[28px] size-[84px] rounded-full overflow-hidden border-[3px] border-[#fbf7ee] sm:top-[34px] sm:size-[120px] sm:border-[4px] lg:top-[46px] lg:size-[148px]"
        style={{ boxShadow: '0px 4px 20px rgba(184,145,72,0.25)' }}
      >
        {doctor.image_url ? (
          <Image src={doctor.image_url} alt={doctor.name} fill className="object-cover" sizes="(max-width: 640px) 84px, (max-width: 1024px) 120px, 148px" unoptimized />
        ) : (
          <div className="w-full h-full bg-[#e8d9b8] flex items-center justify-center">
            <span className="font-cormorant text-[30px] font-bold text-[#b89148] sm:text-[40px] lg:text-[48px]">
              {doctor.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex w-full flex-col items-center gap-[12px] px-[10px] pb-[16px] pt-[48px] text-center sm:gap-[16px] sm:px-[16px] sm:pb-[24px] sm:pt-[72px] lg:px-[20px] lg:pb-[28px] lg:pt-[88px]">
        <div className="flex flex-col gap-[6px] items-center sm:gap-[8px]">
          <p className="font-cormorant font-bold text-[16px] text-[#3b2d17] leading-snug capitalize sm:text-[20px] lg:text-[22px]">{doctor.name}</p>
          <p className="font-dm-sans text-[11px] text-[#7a5f2c] leading-snug capitalize sm:text-[13px] lg:text-[14px]">{doctor.specialty}</p>
        </div>
        <Link
          href={`/doctors/${doctor.id}` as any}
          className="flex h-[30px] w-full max-w-[112px] items-center justify-center rounded-[9px] bg-[#b89148] px-[12px] transition-colors hover:bg-[#9a7a3c] sm:h-[34px] sm:max-w-[140px] sm:px-[18px] lg:h-[36px] lg:max-w-[160px] lg:px-[20px]"
          style={{ boxShadow: '0px 2px 8px rgba(184,145,72,0.3)' }}
        >
          <span className="font-dm-sans text-[11px] text-[#fbf7ee] sm:text-[12px] lg:text-[13px]">View Profile</span>
        </Link>
      </div>
    </div>
  )
}
