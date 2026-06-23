'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import SiteLayout from '@/components/layout/SiteLayout'
import { ChevronRight, Search, Play } from 'lucide-react'
import PageState from '@/components/shared/PageState'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import Reveal from '@/components/shared/Reveal'
import { Link } from '@/i18n/routing'

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
  featuredDoctor: {
    name: string
    specialty?: string
    departmentId?: string
    departmentName?: string
  } | null
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DoctorTalksPage() {
  const locale = useLocale()
  const t = useTranslations('DoctorTalks')
  const [talks, setTalks] = useState<DoctorTalk[]>([])
  const [filteredTalks, setFilteredTalks] = useState<DoctorTalk[]>([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [activeDepartment, setActiveDepartment] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    // Reset the UI immediately when locale changes so stale results do not linger.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError('')

    fetch(`/api/doctor-talks?locale=${locale}&limit=20`, { cache: 'no-store', signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error('We could not load doctor talks right now.')
        return r.json()
      })
      .then(d => {
        if (controller.signal.aborted) return
        setTalks(d?.docs || [])
        setError('')
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setTalks([])
        setError(err instanceof Error ? err.message : 'We could not load doctor talks right now.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [locale])

  const categories = Array.from(
    new Set(
      talks
        .map((talk) => talk.featuredDoctor?.departmentName?.trim())
        .filter((value): value is string => Boolean(value))
    )
  )

  const normalizedSearch = search.trim().toLowerCase()
  useEffect(() => {
    const nextTalks = talks.filter((talk) => {
      const matchesDepartment = !activeDepartment || talk.featuredDoctor?.departmentName === activeDepartment
      const matchesSearch = !normalizedSearch || [
        talk.title,
        talk.talkTopic,
        talk.excerpt,
        talk.featuredDoctor?.name ?? '',
        talk.featuredDoctor?.specialty ?? '',
        talk.featuredDoctor?.departmentName ?? '',
      ].some((value) => value.toLowerCase().includes(normalizedSearch))

      return matchesDepartment && matchesSearch
    })

    // Show a brief skeleton when search/filter changes so the UI does not snap between states.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiltering(true)
    const timer = window.setTimeout(() => {
      setFilteredTalks(nextTalks)
      setFiltering(false)
    }, 180)

    return () => window.clearTimeout(timer)
  }, [talks, activeDepartment, normalizedSearch])

  const displayed = filteredTalks

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: 'var(--background)' }}>
        <div className="page-shell flex flex-col gap-[32px] lg:gap-[40px]">

          {/* Hero banner */}
          <PromotionStyleHero
            title={t('heroTitle')}
            lines={[t('heroLine1'), t('heroLine2')]}
          />

          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row gap-[32px] lg:gap-[40px] items-start">

            {/* Left sidebar: 332px */}
            <div className="shrink-0 w-full md:w-[332px] flex flex-col gap-[24px] lg:gap-[40px]">

              {/* Search */}
              <div className="bg-white flex items-center gap-[12px] h-[42px] px-[12px] py-[8px] rounded-[12px] shadow-[0px_4px_15px_rgba(220,189,114,0.12)]">
                <input
                  className="flex-1 font-dm-sans text-[12px] text-[#3b2d17] placeholder:text-[rgba(89,69,34,0.3)] bg-transparent outline-none"
                  placeholder={t('searchPlaceholder')}
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
                      onClick={() => setActiveDepartment((current) => current === cat ? '' : cat)}
                      className={`w-full flex items-center gap-[12px] p-[24px] font-dm-sans text-[16px] text-left transition-colors ${
                        i < arr.length - 1 ? 'border-b border-[#ead6a4]/50' : ''
                      } ${activeDepartment === cat ? 'bg-[rgba(184,145,72,0.12)] text-[#3b2d17]' : 'text-[#3b2d17] hover:bg-[var(--background)]'} cursor-pointer`}
                    >
                      {cat}
                    </button>
                  ))}
                  {categories.length > 5 && (
                    <button
                      onClick={() => setShowMore(!showMore)}
                      className="w-full flex items-center justify-between p-[24px] bg-[rgba(184,145,72,0.6)] font-dm-sans text-[16px] text-[#3b2d17]"
                    >
                      <span>{showMore ? t('showLess') : t('seeMore')}</span>
                      <ChevronRight size={16} className={`transition-transform ${showMore ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>
              )}

              {/* Popular articles — first 5 talks */}
              {!loading && !filtering && displayed.length > 0 && (
                <div className="bg-white rounded-[16px] shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] p-[24px] flex flex-col gap-[12px]">
                  <h3 className="font-cormorant font-semibold text-[24px] text-[#3b2d17] leading-none">{t('popularTalk')}</h3>
                  <div className="flex flex-col">
                    {displayed.slice(0, 5).map((talk, i) => (
                      <div key={talk.id} className="flex gap-[8px] items-start py-[16px] border-b border-[#ead6a4]/30 last:border-0">
                        <span className="font-dm-sans font-semibold text-[24px] text-[#3b2d17] w-[24px] text-center shrink-0 leading-none">
                          {i + 1}
                        </span>
                        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                          <Link href={`/doctor-talks/${talk.slug}` as '/'} className="font-dm-sans font-semibold text-[16px] text-[#3b2d17] leading-normal line-clamp-2 hover:text-[#b89148] transition-colors">
                            {talk.title}
                          </Link>
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
              <Reveal className="flex flex-col gap-[12px]">
                <h2 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">{t('heading')}</h2>
                <p className="font-dm-sans text-[16px] text-[#594522]">{t('subtitle')}</p>
              </Reveal>

              {/* Cards grid — 2 columns */}
              {loading || filtering ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] lg:gap-[40px]">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-[12px] bg-white shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)]">
                      <div className="h-[219px] bg-[#f0ebe0] animate-pulse" />
                      <div className="flex flex-col gap-[12px] p-[22px]">
                        <div className="h-[10px] w-[88px] rounded bg-[#f0ebe0] animate-pulse" />
                        <div className="h-[22px] w-full rounded bg-[#f0ebe0] animate-pulse" />
                        <div className="h-[22px] w-[70%] rounded bg-[#f0ebe0] animate-pulse" />
                        <div className="mt-2 ml-auto h-[32px] w-[104px] rounded-[12px] bg-[#f0ebe0] animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <PageState
                  title={t('unavailable')}
                  message={error}
                />
              ) : displayed.length === 0 ? (
                <PageState
                  title={t('noTalks')}
                  message={t('noTalksMsg')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] lg:gap-[40px]">
                  {displayed.map(talk => {
                    const detailHref = `/doctor-talks/${talk.slug}` as '/'
                    const hasMeetingLink = Boolean(talk.meetingLink)
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
                          {hasMeetingLink ? (
                            <a
                              href={talk.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 flex items-center justify-center bg-black/12 group-hover:bg-black/20 transition-colors"
                            >
                              <div className="flex h-[72px] w-[116px] items-center justify-center rounded-[18px] bg-[#ff3b30] shadow-[0px_18px_32px_rgba(255,59,48,0.22)]">
                                <Play size={34} className="ml-1 text-white" fill="white" />
                              </div>
                            </a>
                          ) : (
                            <Link href={detailHref} className="absolute inset-0" aria-label={`Read more about ${talk.title}`} />
                          )}
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
                          {hasMeetingLink ? (
                            <a
                              href={talk.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-[12px] py-[8px] h-[32px] rounded-[12px] border border-[#b89148] font-dm-sans text-[12px] text-[#594522] hover:bg-[var(--background)] transition-colors shrink-0"
                            >
                              {t('watch')}
                              <ChevronRight size={14} />
                            </a>
                          ) : (
                            <Link
                              href={detailHref}
                              className="flex items-center gap-1 px-[12px] py-[8px] h-[32px] rounded-[12px] border border-[#b89148] font-dm-sans text-[12px] text-[#594522] hover:bg-[var(--background)] transition-colors shrink-0"
                            >
                              {t('readMore')}
                              <ChevronRight size={14} />
                            </Link>
                          )}
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
