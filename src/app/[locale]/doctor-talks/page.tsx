'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import SiteLayout from '@/components/layout/SiteLayout'
import { ChevronLeft, ChevronRight, Search, Play } from 'lucide-react'

interface DoctorTalk {
  id: string
  title: string
  slug: string
  talkTopic: string
  eventDate: string
  isVirtual: boolean
  meetingLink: string
  thumbnail: string | null
  excerpt: string
  featuredDoctor: { name: string } | null
}

interface DepartmentOption {
  name?: string
}

const HERO_SLIDES = [
  {
    image: '/images/about/about-hero-3.jpg',
    title: 'Orienda International Hospital',
    lines: [
      'We dedicated to providing safe and reliable medical services.',
      'Schedule and appointment to experience world-class healthcare.',
    ],
  },
  {
    image: '/images/about/about-hero-2.jpg',
    title: 'Orienda International Hospital',
    lines: [
      'We dedicated to providing safe and reliable medical services.',
      'Schedule and appointment to experience world-class healthcare.',
    ],
  },
] as const


function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DoctorTalksPage() {
  const locale = useLocale()
  const [talks, setTalks] = useState<DoctorTalk[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    fetch(`/api/doctor-talks?locale=${locale}&limit=20`)
      .then(r => r.json())
      .then(d => { if (d?.docs) setTalks(d.docs) })
      .catch(() => {})
      .finally(() => setLoading(false))
    fetch(`/api/departments?locale=${locale}&limit=20`)
      .then(r => r.json())
      .then(d => setCategories((d.docs || []).map((dept: DepartmentOption) => dept.name).filter(Boolean)))
      .catch(() => {})
  }, [locale])

  const displayed = talks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.talkTopic.toLowerCase().includes(search.toLowerCase())
  )
  const activeHero = HERO_SLIDES[heroIndex]

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: 'var(--background)' }}>
        <div className="page-shell flex flex-col gap-[32px] lg:gap-[40px]">

          {/* Hero banner */}
          <div className="relative w-full">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => setHeroIndex(current => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="absolute left-[-18px] top-1/2 z-10 hidden -translate-y-1/2 text-[#b89148] xl:flex"
            >
              <ChevronLeft size={28} strokeWidth={1.5} />
            </button>

            <div className="overflow-hidden rounded-[24px] bg-white p-[16px] shadow-[0px_4px_30px_12px_rgba(220,189,114,0.10)] lg:p-[20px]">
              <div className="flex flex-col-reverse gap-[20px] lg:flex-row lg:items-stretch lg:gap-[24px]">
                <div className="flex flex-1 flex-col justify-center px-[12px] py-[8px] lg:max-w-[46%] lg:px-[24px]">
                  <div className="flex flex-col gap-[18px] lg:gap-[24px]">
                    <h1 className="font-cormorant text-[36px] font-bold leading-[0.95] text-[#3b2d17] lg:text-[56px]">
                      {activeHero.title}
                    </h1>
                    <div className="flex flex-col gap-[14px] font-dm-sans text-[16px] leading-[1.35] text-[#594522] lg:text-[20px]">
                      <p>{activeHero.lines[0]}</p>
                      <p>{activeHero.lines[1]}</p>
                    </div>
                    <div className="pt-[6px]">
                      <Link
                        href="/about"
                        className="inline-flex h-[40px] items-center gap-[8px] rounded-[12px] border border-[#b89148] px-[18px] font-dm-sans text-[14px] text-[#5c4924] transition-colors hover:bg-[var(--background)] lg:h-[52px] lg:px-[24px]"
                      >
                        Learn More
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="relative h-[240px] overflow-hidden rounded-[18px] sm:h-[320px] lg:h-[390px] lg:flex-1">
                  <Image
                    src={activeHero.image}
                    alt={activeHero.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    priority
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label="Next slide"
              onClick={() => setHeroIndex(current => (current + 1) % HERO_SLIDES.length)}
              className="absolute right-[-18px] top-1/2 z-10 hidden -translate-y-1/2 text-[#b89148] xl:flex"
            >
              <ChevronRight size={28} strokeWidth={1.5} />
            </button>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-[32px] lg:gap-[40px] items-start">

            {/* Left sidebar: 332px */}
            <div className="shrink-0 w-full lg:w-[332px] flex flex-col gap-[24px] lg:gap-[40px]">

              {/* Search */}
              <div className="bg-white flex items-center gap-[12px] h-[42px] px-[12px] py-[8px] rounded-[12px] shadow-[0px_4px_15px_rgba(220,189,114,0.12)]">
                <input
                  className="flex-1 font-dm-sans text-[12px] text-[#3b2d17] placeholder:text-[rgba(89,69,34,0.3)] bg-transparent outline-none"
                  placeholder="What are we looking for?"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <Search size={16} className="text-[rgba(89,69,34,0.4)] shrink-0" />
              </div>

              {/* Category list */}
              {categories.length > 0 && (
                <div className="bg-white rounded-[16px] shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] overflow-hidden">
                  {(showMore ? categories : categories.slice(0, 5)).map((cat, i, arr) => (
                    <button
                      key={cat}
                      type="button"
                      className={`w-full flex items-center gap-[12px] p-[24px] font-dm-sans text-[16px] text-[#3b2d17] text-left ${
                        i < arr.length - 1 ? 'border-b border-[#ead6a4]/50' : ''
                      } hover:bg-[var(--background)] cursor-pointer`}
                    >
                      {cat}
                    </button>
                  ))}
                  {categories.length > 5 && (
                    <button
                      onClick={() => setShowMore(!showMore)}
                      className="w-full flex items-center justify-between p-[24px] bg-[rgba(184,145,72,0.6)] font-dm-sans text-[16px] text-[#3b2d17]"
                    >
                      <span>{showMore ? 'Show Less' : 'See More'}</span>
                      <ChevronRight size={16} className={`transition-transform ${showMore ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>
              )}

              {/* Popular articles — first 5 talks */}
              {talks.length > 0 && (
                <div className="bg-white rounded-[16px] shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] p-[24px] flex flex-col gap-[12px]">
                  <h3 className="font-cormorant font-semibold text-[24px] text-[#3b2d17] leading-none">Popular Talk</h3>
                  <div className="flex flex-col">
                    {talks.slice(0, 5).map((talk, i) => (
                      <div key={talk.id} className="flex gap-[8px] items-start py-[16px] border-b border-[#ead6a4]/30 last:border-0">
                        <span className="font-dm-sans font-semibold text-[24px] text-[#3b2d17] w-[24px] text-center shrink-0 leading-none">
                          {i + 1}
                        </span>
                        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                          <p className="font-dm-sans font-semibold text-[16px] text-[#3b2d17] leading-normal line-clamp-2">{talk.title}</p>
                          {talk.talkTopic && (
                            <p className="font-dm-sans text-[12px] text-[#7a5f2c] leading-normal">{talk.talkTopic}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 flex flex-col gap-[40px]">
              {/* Section heading */}
              <div className="flex flex-col gap-[12px]">
                <h2 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">Doctor Talk</h2>
                <p className="font-dm-sans text-[16px] text-[#594522]">Article for health care tips</p>
              </div>

              {/* Cards grid — 2 columns */}
              {loading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-[24px] lg:gap-[40px]">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-[320px] rounded-[12px] bg-[#f0ebe0] animate-pulse" />
                  ))}
                </div>
              ) : displayed.length === 0 ? (
                <p className="font-dm-sans text-[#594522] text-[16px] py-[60px] text-center">No talks available.</p>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-[24px] lg:gap-[40px]">
                  {displayed.map(talk => {
                    const watchUrl = talk.meetingLink || '#'
                    return (
                      <div
                        key={talk.id}
                        className="bg-white rounded-[12px] overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] flex flex-col"
                      >
                        {/* Video thumbnail with play overlay */}
                        <div className="h-[219px] bg-[#f9f9f9] overflow-hidden shrink-0 relative group">
                          {talk.thumbnail ? (
                            <Image
                              src={talk.thumbnail}
                              alt={talk.title}
                              fill
                              className="object-cover"
                              sizes="480px"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-[#ead6a4]/30" />
                          )}
                          {/* Play button overlay */}
                          <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black/12 group-hover:bg-black/20 transition-colors"
                          >
                            <div className="flex h-[72px] w-[116px] items-center justify-center rounded-[18px] bg-[#ff3b30] shadow-[0px_18px_32px_rgba(255,59,48,0.22)]">
                              <Play size={34} className="ml-1 text-white" fill="white" />
                            </div>
                          </a>
                        </div>

                        {/* Card footer: date+title left, Watch right */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[16px] sm:gap-[23px] p-[18px_22px_20px]">
                          <div className="flex flex-col gap-[12px] flex-1 min-w-0">
                            <p className="font-dm-sans font-light text-[10px] text-[rgba(59,45,23,0.7)]">
                              {formatDate(talk.eventDate)}
                            </p>
                            <p className="font-dm-sans font-medium text-[16px] text-[#3b2d17] leading-snug line-clamp-2">
                              {talk.title}
                            </p>
                          </div>
                          <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-[12px] py-[8px] h-[32px] rounded-[12px] border border-[#b89148] font-dm-sans text-[12px] text-[#594522] hover:bg-[var(--background)] transition-colors shrink-0"
                          >
                            Watch
                            <ChevronRight size={14} />
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
