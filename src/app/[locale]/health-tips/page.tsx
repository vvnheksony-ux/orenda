'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import SiteLayout from '@/components/layout/SiteLayout'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface HealthTip {
  id: string
  title: string
  slug: string
  excerpt: string
  thumbnail: string | null
  publishedAt: string
  category: string
  readingTime: number | null
}

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Nutrition', value: 'nutrition' },
  { label: 'Exercise', value: 'exercise' },
  { label: 'Mental Health', value: 'mentalHealth' },
  { label: 'Preventive Care', value: 'preventiveCare' },
  { label: 'Chronic Disease', value: 'chronicDisease' },
]

const POPULAR = [
  { rank: 1, title: '8h Sleep', desc: 'Getting 8 hours of sleep is essential for feeling refreshed and energized.' },
  { rank: 2, title: 'Morning Exercise', desc: 'Engaging in 30 minutes of morning exercise boosts metabolism and mood.' },
  { rank: 3, title: 'Healthy Breakfast', desc: 'Eating a balanced breakfast helps maintain energy levels throughout the day.' },
  { rank: 4, title: 'Hydration', desc: 'Drinking at least 8 glasses of water daily supports overall health and focus.' },
  { rank: 5, title: 'Mindfulness Practice', desc: 'Spending 10 minutes on mindfulness or meditation reduces stress and improves clarity.' },
]

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

export default function HealthTipsPage() {
  const locale = useLocale()
  const [tips, setTips] = useState<HealthTip[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams({ locale, limit: '20' })
    if (category) params.set('category', category)
    fetch(`/api/health-tips?${params}`)
      .then(r => r.json())
      .then(d => { if (d?.docs) setTips(d.docs) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locale, category])

  const displayed = tips.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  )

  const visibleCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 6)
  const activeHero = HERO_SLIDES[heroIndex]

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: '#fbf7ee' }}>
        <div className="page-shell flex flex-col gap-[32px] lg:gap-[40px]">

          {/* Hero banner */}
          <div className="relative w-full">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => setHeroIndex(current => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="absolute left-[-20px] top-1/2 z-10 hidden -translate-y-1/2 text-[#b89148] xl:flex"
            >
              <ChevronLeft size={28} strokeWidth={1.5} />
            </button>

            <div className="overflow-hidden rounded-[24px] bg-white p-[16px] shadow-[0px_4px_30px_12px_rgba(220,189,114,0.10)] lg:p-[20px]">
              <div className="flex flex-col-reverse gap-[20px] lg:flex-row lg:items-stretch lg:gap-[24px]">
                <div className="flex flex-1 flex-col justify-center px-[12px] py-[8px] lg:max-w-[46%] lg:px-[24px]">
                  <div className="flex flex-col gap-[18px] lg:gap-[28px]">
                    <h1 className="font-cormorant text-[36px] font-bold leading-[0.95] text-[#3b2d17] lg:text-[56px]">
                      {activeHero.title}
                    </h1>
                    <div className="flex flex-col gap-[14px] font-dm-sans text-[16px] leading-[1.35] text-[#594522] lg:text-[20px]">
                      <p>{activeHero.lines[0]}</p>
                      <p>{activeHero.lines[1]}</p>
                    </div>
                    <div className="flex items-center gap-[12px] pt-[8px]">
                      <Link
                        href="/about"
                        className="inline-flex h-[40px] items-center gap-[8px] rounded-[12px] border border-[#b89148] px-[18px] font-dm-sans text-[14px] text-[#5c4924] transition-colors hover:bg-[#fbf7ee] lg:h-[52px] lg:px-[24px]"
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
              className="absolute right-[-20px] top-1/2 z-10 hidden -translate-y-1/2 text-[#b89148] xl:flex"
            >
              <ChevronRight size={28} strokeWidth={1.5} />
            </button>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-[32px] lg:gap-[40px] items-start">

            {/* Left sidebar: 332px */}
            <div className="shrink-0 w-full lg:w-[332px] flex flex-col gap-[24px] lg:gap-[28px]">

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
              <div className="bg-white rounded-[16px] shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] overflow-hidden">
                {visibleCategories.slice(1).map((cat, i) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value === category ? '' : cat.value)}
                    className={`w-full flex items-center gap-[12px] p-[24px] font-dm-sans text-[16px] text-[#3b2d17] text-left transition-colors ${
                      i < CATEGORIES.length - 2 ? 'border-b border-[#ead6a4]/50' : ''
                    } ${cat.value === category ? 'bg-[rgba(184,145,72,0.12)]' : 'hover:bg-[#fbf7ee]'}`}
                  >
                    {cat.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full flex items-center justify-between p-[24px] bg-[rgba(184,145,72,0.6)] font-dm-sans text-[16px] text-[#3b2d17]"
                >
                  <span>{showAllCategories ? 'Show Less' : 'See More'}</span>
                  <ChevronRight size={16} className={`transition-transform ${showAllCategories ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Popular articles */}
              <div className="bg-white rounded-[16px] shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] p-[24px] flex flex-col gap-[12px]">
                <h3 className="font-cormorant font-semibold text-[24px] text-black leading-none">Popular Article</h3>
                <div className="flex flex-col">
                  {POPULAR.map((item) => (
                    <div key={item.rank} className="flex gap-[8px] items-start py-[16px] border-b border-[#ead6a4]/30 last:border-0">
                      <span className="font-dm-sans font-semibold text-[24px] text-[#3b2d17] w-[24px] text-center shrink-0 leading-none">
                        {item.rank}
                      </span>
                      <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                        <p className="font-dm-sans font-semibold text-[16px] text-[#3b2d17] leading-normal">{item.title}</p>
                        <p className="font-dm-sans text-[12px] text-[#7a5f2c] leading-normal">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 flex flex-col gap-[40px]">
              {/* Section heading */}
              <div className="flex flex-col gap-[12px]">
                <h2 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">Health Tips</h2>
                <p className="font-dm-sans text-[16px] text-[#594522]">Article for health care tips</p>
              </div>

              {/* Cards grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[24px] lg:gap-[40px]">
                  {Array(9).fill(0).map((_, i) => (
                    <div key={i} className="h-[360px] rounded-[12px] bg-[#f0ebe0] animate-pulse" />
                  ))}
                </div>
              ) : displayed.length === 0 ? (
                <p className="font-dm-sans text-[#594522] text-[16px] py-[60px] text-center">No articles found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[24px] lg:gap-[40px]">
                  {displayed.map(tip => (
                    <div
                      key={tip.id}
                      className="bg-white rounded-[12px] overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] flex flex-col"
                    >
                      <div className="h-[219px] bg-[#f9f9f9] overflow-hidden shrink-0 relative">
                        {tip.thumbnail ? (
                          <Image
                            src={tip.thumbnail}
                            alt={tip.title}
                            fill
                            className="object-cover"
                            sizes="300px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-[#ead6a4]/30" />
                        )}
                      </div>
                      <div className="flex flex-col justify-between gap-[16px] p-[24px] flex-1">
                        <div className="flex flex-col gap-[12px]">
                          <p className="font-dm-sans font-light text-[10px] text-[rgba(59,45,23,0.7)]">
                            {formatDate(tip.publishedAt)}
                          </p>
                          <p className="font-dm-sans font-medium text-[16px] text-[#3b2d17] leading-snug line-clamp-2">
                            {tip.title}
                          </p>
                        </div>
                        <Link
                          href={`/health-tips/${tip.slug}` as '/'}
                          className="flex items-center gap-1 px-[12px] py-[8px] h-[32px] rounded-[12px] border border-[#b89148] font-dm-sans text-[12px] text-[#594522] hover:bg-[#fbf7ee] transition-colors shrink-0 self-end"
                        >
                          Read More
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
