'use client'

import Image from 'next/image'
import { useState, useEffect, use } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowLeft } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import BookAppointmentButton from '@/components/shared/BookAppointmentButton'

interface Doctor {
  id: string
  name: string
  specialty: string
  department: string
  department_payload_id: string
  branch_id: string
  image_url: string | null
  bio: string
  phone: string
  email: string
  nationality: string
  position_title: string
  employment_type: string
  total_experience_years: number | null
  specialist_experience_years: number | null
  sex: string
  education: string[]
  languages: string[]
}

export default function DoctorProfilePage({ params }: { params: Promise<{ doctorId: string }> }) {
  const { doctorId } = use(params)
  const locale = useLocale()
  const t = useTranslations('DoctorDetail')
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/doctors?id=${doctorId}&locale=${locale}`)
      .then(r => r.json())
      .then(d => { if (d) setDoctor(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [doctorId, locale])

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">

        {loading && (
          <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-[#b89148] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !doctor && (
          <div className="text-center py-[120px]">
            <p className="font-cormorant text-[32px] text-[#3b2d17]">{t('notFound')}</p>
            <Link href="/doctors" className="font-dm-sans text-[#b89148] underline mt-4 block">{t('backToDoctors')}</Link>
          </div>
        )}

        {!loading && doctor && (
          <>
            {/* Back arrow */}
            <div className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-[80px] pt-[100px] lg:pt-[160px] pb-[12px]">
              <Link href="/doctors"
                className="inline-flex items-center gap-[10px] font-dm-sans text-[16px] lg:text-[18px] text-[#3b2d17] opacity-70 hover:opacity-100 transition-opacity px-3 py-2">
                <ArrowLeft size={28} />
                <span>{t('back')}</span>
              </Link>
            </div>

            {/* Gold header banner */}
            <div className="relative w-full bg-[#ead6a4] lg:h-[221px]">
              {/* Doctor card floating — center aligned with px-4 sm:px-8 md:px-12 lg:px-[80px] */}
              <div className="relative lg:absolute left-1/2 lg:-translate-x-1/2 top-0 lg:-top-[54px] flex flex-col sm:flex-row gap-6 lg:gap-[239px] items-center sm:items-start lg:items-center px-4 sm:px-8 md:px-12 lg:px-[80px] py-8 lg:py-[40px] w-full">
                {/* Photo */}
                <div className="bg-white rounded-[24px] shrink-0 overflow-hidden relative"
                  style={{ width: 250, height: 250, boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}>
                  {doctor.image_url
                    ? <Image src={doctor.image_url} alt={doctor.name} fill className="object-cover object-top" sizes="250px" unoptimized />
                    : <div className="w-full h-full flex items-center justify-center text-[#ead6a4]">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                  }
                </div>

                {/* Name + specialty */}
                <div className="flex flex-col gap-[16px] items-center sm:items-start justify-center capitalize overflow-hidden text-[#2a2620] text-center sm:text-left min-w-0">
                  <p className="font-cormorant font-medium text-[34px] sm:text-[40px] lg:text-[48px] leading-none break-words">{doctor.name}</p>
                  <p className="font-dm-sans font-normal text-[22px] sm:text-[26px] lg:text-[32px] leading-normal break-words">{doctor.specialty}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row gap-[32px] lg:gap-[40px] items-start px-5 sm:px-8 md:px-16 lg:px-[120px] py-24 lg:py-[80px]">

              {/* Left 60% */}
              <div className="flex flex-col gap-[32px] lg:gap-[40px] items-end text-[#2a2620] w-full lg:w-auto" style={{ flex: '0 0 58%' }}>

                {/* Education */}
                {doctor.education?.length > 0 && (
                  <div className="flex flex-col gap-[24px] items-start w-full">
                    <p className="font-cormorant font-bold text-[24px] leading-none w-full">{t('education')}</p>
                    <ul className="font-dm-sans text-[16px] leading-[1.5] list-disc w-full">
                      {doctor.education.map((e, i) => (
                        <li key={i} className="mb-[12px] last:mb-0 ms-[24px]">{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Bio */}
                {doctor.bio && (
                  <div className="flex flex-col gap-[24px] items-start w-full">
                    <p className="font-cormorant font-bold text-[24px] leading-none w-full">{t('about')}</p>
                    <div className="font-dm-sans text-[16px] leading-[1.5] w-full text-[#2a2620]">
                      {(typeof doctor.bio === 'string' ? doctor.bio : '').split('\n').filter(Boolean).map((p, i) => (
                        <p key={i} className="mb-[12px] last:mb-0">{p}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {(doctor.total_experience_years || doctor.specialist_experience_years) && (
                  <div className="flex flex-col gap-[24px] items-start w-full">
                    <p className="font-cormorant font-bold text-[24px] leading-none w-full">{t('experience')}</p>
                    <ul className="font-dm-sans text-[16px] leading-[1.5] list-disc w-full">
                      {doctor.total_experience_years && (
                        <li className="mb-[12px] ms-[24px]">{t('totalExperience', { years: doctor.total_experience_years })}</li>
                      )}
                      {doctor.specialist_experience_years && (
                        <li className="ms-[24px]">{t('specialistExperience', { years: doctor.specialist_experience_years, specialty: doctor.specialty })}</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Details */}
                <div className="flex flex-col gap-[16px] items-start w-full">
                  {doctor.position_title && (
                    <div className="flex flex-col sm:flex-row gap-[8px] sm:gap-[16px]">
                      <span className="font-cormorant font-bold text-[18px] text-[#3b2d17] shrink-0">{t('position')}</span>
                      <span className="font-dm-sans text-[16px] text-[#2a2620]">{doctor.position_title}</span>
                    </div>
                  )}
                  {doctor.nationality && (
                    <div className="flex flex-col sm:flex-row gap-[8px] sm:gap-[16px]">
                      <span className="font-cormorant font-bold text-[18px] text-[#3b2d17] shrink-0">{t('nationality')}</span>
                      <span className="font-dm-sans text-[16px] text-[#2a2620]">{doctor.nationality}</span>
                    </div>
                  )}
                  {doctor.employment_type && (
                    <div className="flex flex-col sm:flex-row gap-[8px] sm:gap-[16px]">
                      <span className="font-cormorant font-bold text-[18px] text-[#3b2d17] shrink-0">{t('employment')}</span>
                      <span className="font-dm-sans text-[16px] text-[#2a2620]">{doctor.employment_type}</span>
                    </div>
                  )}
                  {doctor.email && (
                    <div className="flex flex-col sm:flex-row gap-[8px] sm:gap-[16px] break-all">
                      <span className="font-cormorant font-bold text-[18px] text-[#3b2d17] shrink-0">{t('email')}</span>
                      <a href={`mailto:${doctor.email}`} className="font-dm-sans text-[16px] text-[#b89148] hover:underline">{doctor.email}</a>
                    </div>
                  )}
                  {doctor.phone && (
                    <div className="flex flex-col sm:flex-row gap-[8px] sm:gap-[16px]">
                      <span className="font-cormorant font-bold text-[18px] text-[#3b2d17] shrink-0">{t('phone')}</span>
                      <a href={`tel:${doctor.phone}`} className="font-dm-sans text-[16px] text-[#b89148] hover:underline">{doctor.phone}</a>
                    </div>
                  )}
                </div>

                {/* Fallback if no data */}
                {!doctor.bio && !doctor.total_experience_years && !doctor.position_title && (
                  <p className="font-dm-sans text-[16px] text-[#594522] leading-[1.5]">
                    {t('fallbackBio', { name: (doctor.name ?? '').replace(/^Dr\.\s*/i, ''), specialty: doctor.specialty ?? '' })}
                  </p>
                )}

              </div>

              {/* Right: sidebar */}
              {/* Right 40% */}
              <div className="flex flex-col gap-[26px] items-start w-full lg:w-auto" style={{ flex: '0 0 38%' }}>

                {/* Language card */}
                {doctor.languages?.length > 0 && (
                  <div className="bg-white flex flex-col gap-[21px] items-start p-[24px] rounded-[12px] w-full"
                    style={{ boxShadow: '0px 4px 8px rgba(122,95,44,0.12)' }}>
                    <p className="font-cormorant font-medium text-[24px] text-[#3b2d17] leading-none">{t('language')}</p>
                    <div className="flex gap-[16px] items-center flex-wrap">
                      {doctor.languages.map(lang => (
                        <div key={lang} className="bg-[#f5ecd4] flex items-center justify-center px-[24px] py-[10px] rounded-[12px]">
                          <p className="font-dm-sans text-[16px] text-[#2a2620] whitespace-nowrap">{lang}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Appointment card */}
                <div className="bg-white flex flex-col gap-[21px] items-start p-[24px] rounded-[12px] w-full"
                  style={{ boxShadow: '0px 4px 8px rgba(122,95,44,0.12)' }}>
                  <p className="font-cormorant font-medium text-[24px] text-[#3b2d17] leading-none">{t('bookAppointment')}</p>
                  <p className="font-dm-sans text-[16px] text-[#2a2620] leading-[1.5]">
                    {t('chooseTime')}
                  </p>
                  <BookAppointmentButton
                    defaultDoctorId={doctor.id}
                    defaultDepartmentId={doctor.department_payload_id}
                    defaultBranchId={doctor.branch_id}
                    className="bg-[#b89148] flex gap-[10px] items-center justify-center px-[32px] py-[16px] rounded-[12px] w-full font-dm-sans text-[18px] text-[#fbf7ee] hover:bg-[#c8a25a] transition-colors"
                    label={t('bookNow')}
                  />
                </div>

              </div>
            </div>
          </>
        )}

      </div>
    </SiteLayout>
  )
}
