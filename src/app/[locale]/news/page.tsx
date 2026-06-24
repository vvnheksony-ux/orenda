'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'
import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, ChevronRight } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import Reveal from '@/components/shared/Reveal'
import PageState from '@/components/shared/PageState'

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string
  thumbnail: string | null
  publishedAt: string
}

type LocalizedHref = ComponentProps<typeof Link>['href']
const newsHref = (slug: string): LocalizedHref => `/news/${slug}` as LocalizedHref

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const day = d.getDate()
  const year = d.getFullYear()
  const suffix =
    day === 1 || day === 21 || day === 31 ? 'st'
    : day === 2 || day === 22 ? 'nd'
    : day === 3 || day === 23 ? 'rd'
    : 'th'
  return `${month} ${day}${suffix} ${year}`
}

export default function NewsPage() {
  const locale = useLocale()
  const t = useTranslations('News')
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/news?locale=${locale}&limit=30`)
      .then(async (r) => {
        if (!r.ok) throw new Error('We could not load the latest news right now.')
        return r.json()
      })
      .then(d => {
        setNews(d?.docs || [])
        setError('')
      })
      .catch((err: unknown) => {
        setNews([])
        setError(err instanceof Error ? err.message : 'We could not load the latest news right now.')
      })
      .finally(() => setLoading(false))
  }, [locale])

  const featured = news[0]
  const sideNews = news.slice(1, 4)
  const smallCards = news.slice(4, 8)

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full pt-[90px] lg:pt-[150px] pb-[120px]">
        <div className="page-shell flex flex-col gap-[80px] items-center">

          {/* Skeletons */}
          {loading && (
            <div className="w-full flex flex-col gap-[40px]">
              <div className="flex flex-col gap-[12px] items-center">
                <div className="h-[48px] w-[200px] rounded-[8px] bg-[#f0ebe0] animate-pulse" />
                <div className="h-[24px] w-[140px] rounded-[8px] bg-[#f0ebe0] animate-pulse" />
              </div>
              <div className="flex flex-col md:flex-row gap-[24px] lg:gap-[40px]">
                <div className="flex-1 h-[472px] rounded-[16px] bg-[#f0ebe0] animate-pulse" />
                <div className="w-full md:w-[clamp(360px,42vw,632px)] flex flex-col gap-[24px] lg:gap-[40px]">
                  {[1,2,3].map(i => <div key={i} className="h-[147px] rounded-[16px] bg-[#f0ebe0] animate-pulse" />)}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[24px] lg:gap-[40px]">
                {[1,2,3,4].map(i => <div key={i} className="flex-1 h-[200px] rounded-[12px] bg-[#f0ebe0] animate-pulse" />)}
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* ── Latest News ────────────────────────────────── */}
              {featured && (
                <div className="flex flex-col gap-[40px] items-start w-full max-w-[1352px]">
                  <Reveal className="flex flex-col gap-[12px] text-center w-full leading-none">
                    <h1 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17]">{t('latestNews')}</h1>
                    <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522]">{t('latestSubtitle')}</p>
                  </Reveal>

                  <div className="flex flex-col gap-[40px] w-full">
                    {/* Featured + side rows */}
                    <div className="flex flex-col md:flex-row gap-[24px] lg:gap-[40px] items-stretch w-full">
                      {/* Large featured card */}
                      <Link
                        href={newsHref(featured.slug)}
                        className="bg-white flex-1 min-w-0 overflow-hidden relative rounded-[16px] shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] hover:shadow-lg transition-shadow min-h-[320px] lg:min-h-[472px]"
                      >
                        <div className="absolute inset-0">
                          {featured.thumbnail
                            ? <Image src={featured.thumbnail} alt={featured.title} fill className="object-cover" sizes="760px" unoptimized />
                            : <div className="w-full h-full bg-[#f0ebe0]" />
                          }
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 backdrop-blur-[6px] bg-[rgba(255,255,255,0.9)] p-4 sm:p-[24px] flex flex-col gap-[12px] items-end">
                          <p className="font-dm-sans font-medium text-[16px] text-[#3b2d17] leading-[1.5] w-full line-clamp-2">
                            {featured.title}
                          </p>
                          <div className="border border-[#b89148] rounded-[12px] flex items-center h-[32px] px-[12px] py-[8px] gap-[4px] shrink-0">
                            <span className="font-dm-sans text-[12px] text-[#594522] px-[8px]">{t('readMore')}</span>
                            <ArrowRight size={16} className="text-[#594522]" />
                          </div>
                        </div>
                      </Link>

                      {/* 3 horizontal side items */}
                       <div className="flex flex-col gap-[24px] lg:gap-[40px] shrink-0 w-full md:w-[clamp(360px,42vw,632px)] justify-center">
                         {sideNews.map(item => (
                           <Link
                            key={item.id}
                            href={newsHref(item.slug)}
                            className="bg-white flex flex-col sm:flex-row items-stretch sm:items-center overflow-hidden rounded-[16px] shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] hover:shadow-md transition-shadow"
                          >
                            <div className="relative shrink-0 w-full sm:w-[240px] h-[200px] sm:h-[147px] bg-[#f9f9f9]">
                              {item.thumbnail
                                ? <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="240px" unoptimized />
                                : <div className="w-full h-full bg-[#f0ebe0]" />
                              }
                            </div>
                             <div className="flex flex-1 min-w-0 gap-[16px] items-center pl-4 sm:pl-[22px] pr-4 sm:pr-[12px] py-[12px]">
                              <p className="flex-1 min-w-0 font-dm-sans text-[16px] text-[#050505] leading-[1.5] line-clamp-3">
                                {item.title}
                              </p>
                              <ChevronRight size={24} className="text-[#594522] shrink-0" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* 4 small image cards with overlay */}
                    {smallCards.length > 0 && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[24px] lg:gap-[40px] items-center w-full">
                         {smallCards.map(item => (
                          <Link
                            key={item.id}
                            href={newsHref(item.slug)}
                            className="bg-[#f9f9f9] flex-1 min-w-0 h-[200px] overflow-hidden relative rounded-[12px] shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] hover:shadow-md transition-shadow"
                          >
                            {item.thumbnail
                              ? <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="300px" unoptimized />
                              : <div className="w-full h-full bg-[#f0ebe0]" />
                            }
                            <div className="absolute bottom-0 left-0 right-0 backdrop-blur-[6px] bg-gradient-to-t from-[rgba(255,255,255,0.8)] to-[rgba(153,153,153,0)] h-[87px] flex flex-col justify-end pb-[24px] pt-[12px] px-[24px]">
                              <p className="font-dm-sans font-light text-[10px] text-[rgba(59,45,23,0.7)] leading-[1.5]">
                                {formatDate(item.publishedAt)}
                              </p>
                              <p className="font-dm-sans font-medium text-[16px] text-[#3b2d17] leading-[1.5] truncate">
                                {item.title}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── News (full list) ───────────────────────────── */}
              {news.length > 0 && (
                <div className="flex flex-col gap-[40px] items-center w-full max-w-[1352px]">
                   <Reveal className="flex flex-col gap-[12px] text-center w-full leading-none">
                     <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17]">{t('heading')}</h2>
                     <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522]">{t('publishedSubtitle')}</p>
                   </Reveal>

                  <div className="marquee-bleed py-[4px]">
                    <div className="marquee-track gap-[16px] sm:gap-[40px] animate-marquee">
                    {[...news, ...news].map((item, i) => (
                      <Link
                        key={`${item.id}-${i}`}
                        href={newsHref(item.slug)}
                        className="bg-white flex flex-col shrink-0 w-[240px] sm:w-[300px] h-[300px] sm:h-[386px] overflow-hidden rounded-[12px] shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-[120px] sm:h-[200px] bg-[#f9f9f9] shrink-0 overflow-hidden">
                          {item.thumbnail
                            ? <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="300px" unoptimized />
                            : <div className="w-full h-full bg-[#f0ebe0]" />
                          }
                        </div>
                        <div className="flex flex-col flex-1 gap-[12px] sm:gap-[23px] items-end pb-[16px] sm:pb-[24px] pt-[12px] px-[12px] sm:px-[24px]">
                          <div className="flex flex-col gap-[12px] items-start leading-[1.5] w-full">
                            <p className="font-dm-sans font-light text-[10px] text-[rgba(59,45,23,0.7)]">
                              {formatDate(item.publishedAt)}
                            </p>
                            <div className="flex flex-col gap-[8px] items-start text-[#3b2d17] w-full">
                              <p className="font-dm-sans font-medium text-[16px] truncate w-full">{item.title}</p>
                              <p className="font-dm-sans text-[12px] text-[#3b2d17] line-clamp-2 w-full overflow-hidden">{item.excerpt}</p>
                            </div>
                          </div>
                          <div className="border border-[#b89148] rounded-[12px] flex items-center h-[32px] px-[12px] py-[8px] gap-[4px] shrink-0 mt-auto">
                            <span className="font-dm-sans text-[12px] text-[#594522] px-[8px]">{t('readMore')}</span>
                            <ArrowRight size={16} className="text-[#594522]" />
                          </div>
                        </div>
                      </Link>
                    ))}
                    </div>
                  </div>
                </div>
              )}

              {!featured && (
                error ? (
                  <PageState
                    title={t('unavailable')}
                    message={error}
                  />
                ) : (
                  <PageState
                    title={t('noNews')}
                    message={t('noNewsMsg')}
                  />
                )
              )}
            </>
          )}

        </div>
      </div>
    </SiteLayout>
  )
}
