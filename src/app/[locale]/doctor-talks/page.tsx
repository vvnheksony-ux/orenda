'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import SiteLayout from '@/components/layout/SiteLayout'
import { ChevronRight, ChevronLeft, Search, Play } from 'lucide-react'

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

  useEffect(() => {
    setLoading(true)
    fetch(`/api/doctor-talks?locale=${locale}&limit=20`)
      .then(r => r.json())
      .then(d => { if (d?.docs) setTalks(d.docs) })
      .catch(() => {})
      .finally(() => setLoading(false))
    fetch(`/api/departments?locale=${locale}&limit=20`)
      .then(r => r.json())
      .then(d => setCategories((d.docs || []).map((dept: any) => dept.name).filter(Boolean)))
      .catch(() => {})
  }, [locale])

  const displayed = talks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.talkTopic.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: '#fbf7ee' }}>
        <div className="max-w-[1512px] mx-auto px-4 sm:px-8 lg:px-[80px]">

          {/* Hero banner */}
          <div className="relative bg-white rounded-[16px] overflow-hidden h-[472px] shadow-[0px_4px_16px_rgba(122,95,44,0.08)] mb-[60px]">
            <div className="absolute right-3 top-3 bottom-3 w-[43%] rounded-[12px] overflow-hidden">
              <div className="absolute inset-0 bg-[#d4c9b0]" />
            </div>

            <button className="absolute left-3 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full hover:bg-[#fbf7ee] transition-colors z-10">
              <ChevronLeft size={24} className="text-[#7a5f2c]" />
            </button>
            <button className="absolute right-[44%] top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full hover:bg-[#fbf7ee] transition-colors z-10">
              <ChevronRight size={24} className="text-[#7a5f2c]" />
            </button>

            <div className="absolute left-[58px] top-1/2 -translate-y-1/2 flex flex-col gap-8 w-[min(618px,48%)]">
              <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">
                Orienda International Hospital
              </h1>
              <div className="font-dm-sans font-light text-[24px] text-[#594522] flex flex-col gap-3 leading-normal">
                <p>We dedicated to providing safe and reliable medical services.</p>
                <p>Schedule and appointment to experience world-class healthcare.</p>
              </div>
              <Link
                href="/about"
                className="self-start flex items-center gap-2 px-5 py-3 rounded-[12px] border-[1.5px] border-[#b89148] font-dm-sans text-[18px] text-[#5c4924] hover:bg-[#fbf7ee] transition-colors"
              >
                Learn More
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex gap-[40px] items-start">

            {/* Left sidebar: 332px */}
            <div className="shrink-0 w-[332px] flex flex-col gap-[40px]">

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
                    <div
                      key={cat}
                      className={`w-full flex items-center gap-[12px] p-[24px] font-dm-sans text-[16px] text-[#3b2d17] text-left ${
                        i < arr.length - 1 ? 'border-b border-[#ead6a4]/50' : ''
                      } hover:bg-[#fbf7ee] cursor-pointer`}
                    >
                      {cat}
                    </div>
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
                  <h3 className="font-cormorant font-semibold text-[24px] text-black leading-none">Popular Talk</h3>
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
                <div className="grid grid-cols-2 gap-[40px]">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-[320px] rounded-[12px] bg-[#f0ebe0] animate-pulse" />
                  ))}
                </div>
              ) : displayed.length === 0 ? (
                <p className="font-dm-sans text-[#594522] text-[16px] py-[60px] text-center">No talks available.</p>
              ) : (
                <div className="grid grid-cols-2 gap-[40px]">
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
                            className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors"
                          >
                            <div className="size-[56px] rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <Play size={24} className="text-[#b89148] ml-1" fill="#b89148" />
                            </div>
                          </a>
                        </div>

                        {/* Card footer: date+title left, Watch right */}
                        <div className="flex items-end justify-between gap-[23px] p-[24px]">
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
                            className="flex items-center gap-1 px-[12px] py-[8px] h-[32px] rounded-[12px] border border-[#b89148] font-dm-sans text-[12px] text-[#594522] hover:bg-[#fbf7ee] transition-colors shrink-0"
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
