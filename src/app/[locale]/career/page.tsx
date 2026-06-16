'use client'

import Image from 'next/image'
import SiteLayout from '@/components/layout/SiteLayout'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import { Link } from '@/i18n/routing'
import { ChevronRight } from 'lucide-react'
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
        <div className="content-shell flex flex-col gap-20">

          {/* Hero banner */}
          <PromotionStyleHero
            slides={[
              { src: '/images/career-hero-bg.jpg', alt: 'Orienda Hospital career opportunities' },
              { src: '/images/career-hero-overlay2.jpg', alt: 'Orienda Hospital career opportunities' },
            ]}
            title="Orienda International Hospital"
            lines={[
              'We dedicated to providing safe and reliable medical services.',
              'Schedule and appointment to experience world-class healthcare.',
            ]}
          />

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-8">
              {careers.map((career) => (
                <div
                  key={career.id}
                  className="bg-white rounded-[12px] overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] flex flex-col h-[300px] sm:h-[360px] lg:h-[386px] max-w-[260px] sm:max-w-none mx-auto w-full"
                >
                  <div className="relative h-[145px] sm:h-[185px] lg:h-[200px] shrink-0 overflow-hidden bg-[#f9f9f9]">
                    <Image
                      src={career.thumbnail || '/images/career-hero-bg.jpg'}
                      alt={career.title}
                      fill
                      className="object-cover object-top"
                      sizes="300px"
                      unoptimized={!!career.thumbnail}
                    />
                  </div>
                  <div className="flex flex-col flex-1 justify-between px-3.5 sm:px-5 lg:px-6 pt-3 pb-3.5 sm:pb-5 lg:pb-6 gap-3 sm:gap-5">
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <p className="font-dm-sans font-light text-[10px] text-gold-900/70">
                        Deadline: {formatDeadline(career.applicationDeadline)}
                      </p>
                      <div className="flex flex-col gap-2">
                        <p className="font-dm-sans font-medium text-[13px] sm:text-[15px] lg:text-[16px] text-gold-900 line-clamp-2">
                          {career.title}
                        </p>
                        {career.requirements && (
                          <p className="font-dm-sans text-[10px] sm:text-[12px] text-gold-900 leading-[1.4] line-clamp-3">
                            {career.requirements}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/career/${career.slug}` as '/'}
                      className="self-end flex items-center gap-1 px-2.5 py-1 rounded-[12px] border border-gold-500 font-dm-sans text-[10px] sm:text-[12px] text-gold-800 hover:bg-gold-50 transition-colors"
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
