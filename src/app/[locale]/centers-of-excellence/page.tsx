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
      <div className="bg-[#fbf7ee] w-full">
        <div className="max-w-[1512px] mx-auto w-full flex flex-col gap-[96px] items-center pb-[120px] px-4 sm:px-8 lg:px-[80px] pt-[100px] lg:pt-[212px]">

          {/* ── Hero ── */}
          <div className="flex flex-col gap-[56px] w-full">

            {/* Breadcrumb + Title + Image row */}
            <div className="flex items-start justify-between w-full gap-[48px]">
              <div className="flex flex-col gap-[24px] flex-1 min-w-0">
                {/* Breadcrumb */}
                <Link href="/departments" className="flex items-center gap-[12px] text-[#594522] hover:opacity-70 transition-opacity w-fit">
                  <ArrowLeft size={24} strokeWidth={1.5} />
                  <span className="font-dm-sans text-[18px] leading-none">Centers of Excellence</span>
                </Link>

                {/* Title */}
                <h1 className="font-cormorant font-bold text-[64px] text-[#3b2d17] leading-none">
                  Neurosurgery
                </h1>

                {/* Description */}
                <p className="font-dm-sans text-[20px] text-[#3b2d17] leading-relaxed max-w-[640px]">
                  Our Neurosurgery Center of Excellence combines world-class surgical expertise with groundbreaking technology to treat complex conditions of the brain, spine, and nervous system. Here, advanced precision meets compassionate healing to help you reclaim your quality of life.
                </p>
              </div>

              {/* Brain illustration */}
              <div className="relative shrink-0 w-[480px] h-[420px] rounded-[24px] overflow-hidden">
                <Image
                  src="/images/centers/neurosurgery.jpg"
                  alt="Neurosurgery"
                  fill
                  className="object-cover"
                  sizes="480px"
                  priority
                />
              </div>
            </div>

            {/* Stats + CTA */}
            <div className="flex flex-col gap-[40px] items-start">
              <div className="flex gap-[24px] items-stretch">
                {stats.map(s => (
                  <div
                    key={s.label}
                    className="flex flex-col gap-[12px] items-center justify-center w-[200px] h-[160px] rounded-xl bg-[#F9F5EE] shadow-[inset_0px_3px_16px_rgba(184,145,72,0.10),0px_4px_16px_4px_rgba(0,0,0,0.08)] hover:shadow-[inset_0px_3px_24px_rgba(184,145,72,0.14),0px_8px_24px_6px_rgba(0,0,0,0.12)] hover:bg-[#F4EEDF] transition-all duration-300 group"
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
                className="flex items-center justify-center px-[32px] py-[16px] rounded-[12px] bg-[#b89148] hover:bg-[#9a7a3c] transition-colors font-dm-sans font-semibold text-[20px] text-[#fbf7ee]"
              />
            </div>
          </div>

          {/* ── Patient Testimonials ── */}
          <div className="flex flex-col gap-[52px] items-center w-full">
            <div className="flex flex-col gap-[12px] text-center">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">Patient Testimonials</h2>
              <p className="font-dm-sans text-[20px] text-[#594522]">Hear from those we&apos;ve had the privilege to care for.</p>
            </div>

            {/* 2-column staggered grid */}
            <div className="grid grid-cols-2 gap-[24px] w-full">
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
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">Meet Our Specialist</h2>
              <p className="font-dm-sans text-[20px] text-[#594522]">Meet Our Specialists in This Department</p>
            </div>

            <div className="flex gap-[28px] items-stretch justify-center flex-wrap w-full">
              {doctorsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-[300px] h-[400px] rounded-[16px] bg-[#F9F5EE] animate-pulse shadow-[inset_0px_3px_16px_rgba(184,145,72,0.10),0px_4px_16px_4px_rgba(0,0,0,0.08)]" />
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
      className="relative flex flex-col gap-0 items-center overflow-hidden rounded-[16px] w-[300px] shrink-0 bg-[#F9F5EE]"
      style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.15)' }}
    >
      {/* Gold gradient header band */}
      <div
        className="w-full h-[180px] shrink-0"
        style={{ background: 'linear-gradient(133deg, rgba(234,214,164,0.6) 0%, rgba(184,145,72,0.85) 50%, rgba(234,214,164,0.6) 100%)' }}
      />

      {/* Doctor avatar — overlapping the band */}
      <div
        className="absolute top-[46px] rounded-full overflow-hidden size-[148px] border-[4px] border-[#fbf7ee]"
        style={{ boxShadow: '0px 4px 20px rgba(184,145,72,0.25)' }}
      >
        {doctor.image_url ? (
          <Image src={doctor.image_url} alt={doctor.name} fill className="object-cover" sizes="148px" unoptimized />
        ) : (
          <div className="w-full h-full bg-[#e8d9b8] flex items-center justify-center">
            <span className="font-cormorant text-[48px] text-[#b89148] font-bold">
              {doctor.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex flex-col gap-[16px] items-center text-center px-[20px] pt-[88px] pb-[28px] w-full">
        <div className="flex flex-col gap-[8px] items-center">
          <p className="font-cormorant font-bold text-[22px] text-[#3b2d17] leading-snug capitalize">{doctor.name}</p>
          <p className="font-dm-sans text-[14px] text-[#7a5f2c] leading-snug capitalize">{doctor.specialty}</p>
        </div>
        <Link
          href={`/doctors/${doctor.id}` as any}
          className="flex items-center justify-center bg-[#b89148] hover:bg-[#9a7a3c] transition-colors h-[36px] px-[20px] rounded-[10px] w-full max-w-[160px]"
          style={{ boxShadow: '0px 2px 8px rgba(184,145,72,0.3)' }}
        >
          <span className="font-dm-sans text-[13px] text-[#fbf7ee]">View Profile</span>
        </Link>
      </div>
    </div>
  )
}
