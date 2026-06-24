'use client'

import Image from 'next/image'
import SiteLayout from '@/components/layout/SiteLayout'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import PageState from '@/components/shared/PageState'
import Reveal from '@/components/shared/Reveal'
import { Link } from '@/i18n/routing'
import { ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'

interface Career {
  id: string; title: string; slug: string; department: string;
  employmentType: string; experienceLevel: string; salaryRange: string;
  applicationDeadline: string | null; requirements: string;
  thumbnail: string | null;
}

function formatDeadline(iso: string | null) {
  if (!iso) return 'Open'
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

const EMPLOYMENT_LABELS: Record<string, string> = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', visiting: 'Visiting' }
const LEVEL_LABELS: Record<string, string> = { entry: 'Entry level', mid: 'Mid level', senior: 'Senior level' }

function CareerCardSkeleton() {
  return (
    <div
      className="bg-white rounded-[12px] overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] flex flex-col h-[300px] sm:h-[360px] lg:h-[386px] max-w-[260px] sm:max-w-none mx-auto w-full"
      aria-hidden="true"
    >
      <div className="h-[145px] sm:h-[185px] lg:h-[200px] shrink-0 bg-[#ece3d2] animate-pulse" />
      <div className="flex flex-col flex-1 justify-between px-3.5 sm:px-5 lg:px-6 pt-3 pb-3.5 sm:pb-5 lg:pb-6 gap-3 sm:gap-5">
        <div className="flex flex-col gap-3">
          <div className="h-3 w-24 rounded-full bg-[#e7dcc7] animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-full rounded-full bg-[#e7dcc7] animate-pulse" />
            <div className="h-4 w-3/4 rounded-full bg-[#e7dcc7] animate-pulse" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-full rounded-full bg-[#eee6d8] animate-pulse" />
            <div className="h-3 w-5/6 rounded-full bg-[#eee6d8] animate-pulse" />
            <div className="h-3 w-2/3 rounded-full bg-[#eee6d8] animate-pulse" />
          </div>
        </div>
        <div className="self-end h-[26px] w-[94px] rounded-[12px] border border-gold-200 bg-gold-50 animate-pulse" />
      </div>
    </div>
  )
}

export default function CareerPage() {
  const locale = useLocale()
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch(`/api/careers?locale=${locale}&limit=50`)
      .then(async (r) => {
        if (!r.ok) throw new Error('We could not load career opportunities right now.')
        return r.json()
      })
      .then(d => {
        if (!active) return
        setCareers(d.docs || [])
        setError('')
      })
      .catch((err: unknown) => {
        if (!active) return
        setCareers([])
        setError(err instanceof Error ? err.message : 'We could not load career opportunities right now.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => {
      active = false
    }
  }, [locale])

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[90px] lg:pt-[150px] pb-[120px]" style={{ background: 'var(--background)' }}>
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
            <Reveal className="text-center flex flex-col gap-3">
              <h2 className="font-cormorant font-bold text-[36px] xl:text-[48px] text-gold-900 leading-none">
                Career Opportunities
              </h2>
              <p className="font-dm-sans text-[16px] xl:text-[20px] text-gold-800">
                Join our team
              </p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8">
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <CareerCardSkeleton key={i} />
              )) : error ? (
                <div className="col-span-full">
                  <PageState
                    title="Careers unavailable"
                    message={error}
                  />
                </div>
              ) : careers.length === 0 ? (
                <div className="col-span-full">
                  <PageState
                    title="No openings right now"
                    message="There are no published roles at the moment. Please check back soon for new opportunities."
                  />
                </div>
              ) : careers.map((career) => (
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
                        {(career.employmentType || career.experienceLevel) && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {career.employmentType && (
                              <span className="px-2 py-0.5 rounded-full bg-gold-50 border border-gold-200 font-dm-sans text-[10px] text-gold-800">
                                {EMPLOYMENT_LABELS[career.employmentType] ?? career.employmentType}
                              </span>
                            )}
                            {career.experienceLevel && (
                              <span className="px-2 py-0.5 rounded-full bg-gold-50 border border-gold-200 font-dm-sans text-[10px] text-gold-800">
                                {LEVEL_LABELS[career.experienceLevel] ?? career.experienceLevel}
                              </span>
                            )}
                          </div>
                        )}
                        {career.salaryRange && (
                          <p className="font-dm-sans font-medium text-[11px] sm:text-[12px] text-gold-800">{career.salaryRange}</p>
                        )}
                        {career.requirements && (
                          <p className="font-dm-sans text-[10px] sm:text-[12px] text-gold-900 leading-[1.4] line-clamp-2">
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
