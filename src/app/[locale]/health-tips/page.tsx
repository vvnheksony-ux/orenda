'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import SiteLayout from '@/components/layout/SiteLayout'
import { ChevronRight, ChevronLeft, Search } from 'lucide-react'
import PageState from '@/components/shared/PageState'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import Reveal from '@/components/shared/Reveal'

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

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PAGE_SIZE = 9

export default function HealthTipsPage() {
  const locale = useLocale()
  const [tips, setTips] = useState<HealthTip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ locale, limit: '20' })
    if (category) params.set('category', category)
    // Reset the UI immediately when locale/filter changes so stale results do not linger.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError('')

    fetch(`/api/health-tips?${params}`, { cache: 'no-store', signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error('We could not load health tips right now.')
        return r.json()
      })
      .then(d => {
        setTips(d?.docs || [])
        setError('')
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setTips([])
        setError(err instanceof Error ? err.message : 'We could not load health tips right now.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [locale, category])

  const displayed = tips.filter(t =>
    !search || [t.title, t.excerpt, t.category].some((value) => value.toLowerCase().includes(search.toLowerCase()))
  )
  const pageCount = Math.max(1, Math.ceil(displayed.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const pagedTips = displayed.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  const filterCategories = CATEGORIES.slice(1)
  const visibleCategories = showAllCategories ? filterCategories : filterCategories.slice(0, 5)

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[90px] lg:pt-[150px] pb-[120px]" style={{ background: 'var(--background)' }}>
        <div className="page-shell flex flex-col gap-[32px] lg:gap-[40px]">

          {/* Hero banner */}
          <PromotionStyleHero
            title="Orienda International Hospital"
            lines={[
              'We dedicated to providing safe and reliable medical services.',
              'Schedule and appointment to experience world-class healthcare.',
            ]}
          />

          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row gap-[32px] lg:gap-[40px] items-start">

            {/* Left sidebar: 332px */}
            <div className="shrink-0 w-full md:w-[332px] flex flex-col gap-[24px] lg:gap-[28px]">

              {/* Search */}
              <div className="bg-white flex items-center gap-[12px] h-[42px] px-[12px] py-[8px] rounded-[12px] shadow-[0px_4px_15px_rgba(220,189,114,0.12)]">
                <input
                  className="flex-1 font-dm-sans text-[12px] text-[#3b2d17] placeholder:text-[rgba(89,69,34,0.3)] bg-transparent outline-none"
                  placeholder="What are we looking for?"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0) }}
                />
                <Search size={16} className="text-[rgba(89,69,34,0.4)] shrink-0" />
              </div>

              {/* Category list */}
              <div className="bg-white rounded-[16px] shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] overflow-hidden">
                {visibleCategories.map((cat, i) => (
                  <button
                    key={cat.value}
                    onClick={() => { setCategory(cat.value === category ? '' : cat.value); setPage(0) }}
                    className={`w-full flex items-center gap-[12px] p-[24px] font-dm-sans text-[16px] text-[#3b2d17] text-left transition-colors ${
                      i < visibleCategories.length - 1 ? 'border-b border-[#ead6a4]/50' : ''
                    } ${cat.value === category ? 'bg-[rgba(184,145,72,0.12)]' : 'hover:bg-[var(--background)]'}`}
                  >
                    {cat.label}
                  </button>
                ))}
                {filterCategories.length > 5 && (
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="w-full flex items-center justify-between p-[24px] bg-[rgba(184,145,72,0.6)] font-dm-sans text-[16px] text-[#3b2d17]"
                  >
                    <span>{showAllCategories ? 'Show Less' : 'See More'}</span>
                    <ChevronRight size={16} className={`transition-transform ${showAllCategories ? 'rotate-90' : ''}`} />
                  </button>
                )}
              </div>

              {/* Popular articles */}
              <div className="bg-white rounded-[16px] shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] p-[24px] flex flex-col gap-[12px]">
                <h3 className="font-cormorant font-semibold text-[24px] text-[#3b2d17] leading-none">Popular Article</h3>
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
              <Reveal className="flex flex-col gap-[12px]">
                <h2 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">Health Tips</h2>
                <p className="font-dm-sans text-[16px] text-[#594522]">Article for health care tips</p>
              </Reveal>

              {/* Cards grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[24px] lg:gap-[40px]">
                  {Array(9).fill(0).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-[12px] bg-white shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)]">
                      <div className="h-[219px] bg-[#f0ebe0] animate-pulse" />
                      <div className="flex flex-col gap-[12px] p-[24px]">
                        <div className="h-[10px] w-[96px] rounded bg-[#f0ebe0] animate-pulse" />
                        <div className="h-[20px] w-full rounded bg-[#f0ebe0] animate-pulse" />
                        <div className="h-[20px] w-[70%] rounded bg-[#f0ebe0] animate-pulse" />
                        <div className="mt-2 ml-auto h-[32px] w-[96px] rounded-[12px] bg-[#f0ebe0] animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <PageState
                  title="Health tips unavailable"
                  message={error}
                />
              ) : displayed.length === 0 ? (
                <PageState
                  title="No articles found"
                  message="There are no health tips matching this filter right now."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[24px] lg:gap-[40px]">
                  {pagedTips.map(tip => (
                    <div
                      key={tip.id}
                      className="bg-white rounded-[12px] overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] flex h-full min-h-[360px] flex-col"
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
                      <div className="flex flex-1 flex-col justify-between gap-[16px] p-[24px]">
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
                          className="flex items-center gap-1 px-[12px] py-[8px] h-[32px] rounded-[12px] border border-[#b89148] font-dm-sans text-[12px] text-[#594522] hover:bg-[var(--background)] transition-colors shrink-0 self-end"
                        >
                          Read More
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && displayed.length > 0 && pageCount > 1 && (
                <div className="flex items-center justify-center gap-[20px]">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    aria-label="Previous"
                    className="flex items-center justify-center size-[40px] rounded-full border border-[#b89148] text-[#594522] hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-dm-sans text-[14px] text-[#594522]">{currentPage + 1} / {pageCount}</span>
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))}
                    disabled={currentPage >= pageCount - 1}
                    aria-label="Next"
                    className="flex items-center justify-center size-[40px] rounded-full border border-[#b89148] text-[#594522] hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
