'use client'

import Image from 'next/image'
import { Link } from '@/i18n/routing'
import SiteLayout from '@/components/layout/SiteLayout'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'

interface Career {
  id: string; title: string; slug: string; department: string;
  employmentType: string; applicationDeadline: string | null; requirements: string;
  thumbnail: string | null;
}

function formatDeadline(iso: string | null) {
  if (!iso) return 'Open'
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CareerPage() {
  const locale = useLocale()
  const [careers, setCareers] = useState<Career[]>([])

  useEffect(() => {
    fetch(`/api/careers?locale=${locale}&limit=50`)
      .then(r => r.json())
      .then(d => setCareers(d.docs || []))
      .catch(() => {})
  }, [locale])

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: '#fbf7ee' }}>
        <div className="max-w-[1352px] mx-auto px-5 xl:px-0 flex flex-col gap-20">

          {/* Hero banner */}
          <div className="relative bg-white rounded-[16px] overflow-hidden h-[320px] md:h-[400px] xl:h-[472px] shadow-[0px_4px_16px_rgba(122,95,44,0.08)]">
            {/* Right: hospital images */}
            <div className="absolute right-3 top-3 bottom-3 w-[43%] rounded-[12px] overflow-hidden">
              <Image
                src="/images/career-hero-overlay2.jpg"
                alt="Orienda Hospital"
                fill
                className="object-cover"
                sizes="650px"
                priority
              />
              <div className="absolute inset-0 rounded-[12px] overflow-hidden">
                <Image
                  src="/images/career-hero-overlay1.jpg"
                  alt=""
                  fill
                  className="object-cover opacity-60 mix-blend-multiply"
                  sizes="650px"
                />
              </div>
            </div>

            {/* Left chevron */}
            <button className="absolute left-3 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full hover:bg-gold-50 transition-colors z-10">
              <ChevronLeft size={24} className="text-gold-700" />
            </button>

            {/* Right chevron */}
            <button className="absolute right-[44%] top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full hover:bg-gold-50 transition-colors z-10">
              <ChevronRight size={24} className="text-gold-700" />
            </button>

            {/* Left: text content */}
            <div className="absolute left-[58px] top-1/2 -translate-y-1/2 flex flex-col gap-8 w-[min(618px,48%)]">
              <h1 className="font-cormorant font-bold text-[32px] md:text-[40px] xl:text-[48px] text-gold-900 leading-none">
                Orienda International Hospital
              </h1>
              <div className="font-dm-sans font-light text-[16px] xl:text-[24px] text-gold-800 flex flex-col gap-3 leading-normal">
                <p>We dedicated to providing safe and reliable medical services.</p>
                <p>Schedule and appointment to experience world-class healthcare.</p>
              </div>
              <Link
                href="/about"
                className="self-start flex items-center gap-1 px-5 py-3 rounded-[12px] border-[1.5px] border-gold-500 font-dm-sans text-[16px] xl:text-[18px] text-gold-800 hover:bg-gold-50 transition-colors"
              >
                Learn More
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          {/* Career Opportunities */}
          <div className="flex flex-col gap-12">
            <div className="text-center flex flex-col gap-3">
              <h2 className="font-cormorant font-bold text-[36px] xl:text-[48px] text-gold-900 leading-none">
                Career Opportunities
              </h2>
              <p className="font-dm-sans text-[16px] xl:text-[20px] text-gold-800">
                Join our team
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {careers.map((career) => (
                <div
                  key={career.id}
                  className="bg-white rounded-[12px] overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] flex flex-col h-[386px]"
                >
                  <div className="relative h-[200px] shrink-0 overflow-hidden bg-[#f9f9f9]">
                    <Image
                      src={career.thumbnail || '/images/career-hero-bg.jpg'}
                      alt={career.title}
                      fill
                      className="object-cover object-top"
                      sizes="300px"
                      unoptimized={!!career.thumbnail}
                    />
                  </div>
                  <div className="flex flex-col flex-1 justify-between px-6 pt-3 pb-6 gap-5">
                    <div className="flex flex-col gap-3">
                      <p className="font-dm-sans font-light text-[10px] text-gold-900/70">
                        Deadline: {formatDeadline(career.applicationDeadline)}
                      </p>
                      <div className="flex flex-col gap-2">
                        <p className="font-dm-sans font-medium text-[16px] text-gold-900 truncate">
                          {career.title}
                        </p>
                        {career.requirements && (
                          <p className="font-dm-sans text-[12px] text-gold-900 leading-[1.5] line-clamp-3">
                            {career.requirements}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/career/${career.slug}` as '/'}
                      className="self-end flex items-center gap-1 px-3 py-1.5 rounded-[12px] border border-gold-500 font-dm-sans text-[12px] text-gold-800 hover:bg-gold-50 transition-colors"
                    >
                      Apply Now
                      <ChevronRight size={14} />
                    </Link>
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
