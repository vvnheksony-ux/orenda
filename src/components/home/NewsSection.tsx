'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useState, useEffect } from 'react'
import Reveal from '@/components/shared/Reveal'

interface NewsItem { id: string; title: string; slug: string; thumbnail: string | null; publishedAt: string }

type LocalizedHref = ComponentProps<typeof Link>['href']
const newsHref = (slug: string): LocalizedHref => `/news/${slug}` as LocalizedHref

export default function NewsSection() {
  const t = useTranslations('NewsSection')
  const locale = useLocale()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/news?locale=${locale}&limit=5`)
      .then(r => r.json())
      .then(d => { if (d?.docs?.length) setNews(d.docs) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locale])

  const featured = news[0]
  const sideItems = news.slice(1, 5).map(n => ({ title: n.title, image: n.thumbnail || null, slug: n.slug }))

  if (loading) return (
    <section className="bg-[var(--background)]">
      <div className="page-shell flex flex-col gap-[24px] lg:gap-[80px]">
        <div className="flex flex-col gap-[12px] items-center">
          <div className="h-[52px] lg:h-[72px] w-[200px] rounded-lg bg-[#e8d9b8] animate-pulse" />
          <div className="h-[24px] w-[260px] rounded bg-[#e8d9b8] animate-pulse" />
        </div>
        <div className="flex flex-col md:flex-row gap-[24px] lg:gap-[37px] items-start w-full">
          <div className="w-full md:flex-1 rounded-2xl overflow-hidden bg-[#e8d9b8] animate-pulse h-[360px] lg:h-[508px]" />
          <div className="hidden md:flex md:w-[44%] flex-col">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex gap-[22px] items-center py-[12px] border-b border-[#e8d9b8]">
                <div className="shrink-0 w-[240px] h-[147px] bg-[#e8d9b8] animate-pulse rounded" />
                <div className="flex-1 h-[20px] bg-[#e8d9b8] animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )

  return (
    <section className="bg-[var(--background)]">
      <div className="page-shell flex flex-col gap-[24px] lg:gap-[80px]">

        {/* Header */}
        <Reveal className="flex flex-col gap-[12px] lg:gap-[16px] items-center text-center w-full">
          <h2 className="font-cormorant font-bold text-[52px] lg:text-[72px] text-[#3b2d17] leading-none">
            {t('title')}
          </h2>
          <p className="font-dm-sans text-[20px] lg:text-[24px] text-[#594522] leading-[1.4] max-w-[320px] lg:max-w-none text-center">
            {t('subtitle')}
          </p>
        </Reveal>

        {/* Content row */}
        <div className="flex flex-col md:flex-row gap-[24px] lg:gap-[37px] items-start md:items-stretch w-full">

          {/* Featured card — whole card clickable */}
          <Link
            href={featured?.slug ? newsHref(featured.slug) : '/news'}
            className="group flex flex-col w-full md:flex-1 min-w-0 overflow-hidden bg-white rounded-2xl shadow-[0px_2px_8px_2px_rgba(122,95,44,0.12)] transition-shadow hover:shadow-[0px_4px_16px_4px_rgba(122,95,44,0.18)]"
          >

            {/* Image — fills the height so the card matches the side column */}
            <div className="relative w-full h-[280px] md:h-auto md:flex-1 md:min-h-[280px] lg:min-h-[440px]">
              <Image
                src={featured?.thumbnail ?? '/images/figma-news-1.jpg'}
                alt={featured?.title ?? t('featuredTitle')}
                fill className="object-cover pointer-events-none" sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={!!featured?.thumbnail?.startsWith('/payload')}
              />
            </div>

            {/* Content */}
            <div className="flex items-center justify-between gap-4 px-[18px] py-[28px] lg:px-[24px] lg:py-[32px] bg-white">
              <p className="font-dm-sans font-medium text-[14px] lg:text-[16px] text-[#3b2d17] leading-[1.5] flex-1">
                {featured?.title ?? t('featuredTitle')}
              </p>
              <span className="flex items-center justify-center shrink-0 h-[32px] lg:h-[36px] px-[12px] lg:px-[16px] border border-[#b89148] rounded-[10px] gap-[4px] transition-colors group-hover:bg-[#b89148] group-hover:text-white">
                <span className="font-dm-sans text-[12px] lg:text-[13px] text-[#594522] group-hover:text-white">{t('readMore')}</span>
                <ArrowRight size={13} className="text-[#594522] group-hover:text-white" />
              </span>
            </div>
          </Link>

          {/* Right: 4 stacked news items — desktop only */}
          <div className="hidden md:flex w-full md:shrink-0 md:w-[44%] flex-col items-start justify-center">
            {sideItems.map((item, i) => (
              <Link
                key={i}
                href={item.slug ? newsHref(item.slug) : '/news'}
                className="group flex items-center w-full bg-white overflow-hidden transition-colors hover:bg-[#faf6ee]"
                style={{
                  borderBottom: `0.5px solid ${i < 3 ? 'rgba(89,69,34,0.8)' : 'rgba(89,69,34,0.2)'}`,
                }}
              >
                {/* Thumbnail */}
                <div className="relative shrink-0 w-[240px] h-[147px]">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover pointer-events-none"
                      sizes="240px"
                      unoptimized={item.image.startsWith('/payload')}
                    />
                  )}
                </div>
                {/* Text + chevron */}
                <div className="flex flex-1 gap-[10px] items-center justify-center pl-[22px] pr-[12px] py-[12px] min-w-0">
                  <p className="flex-1 font-dm-sans font-normal text-[16px] text-[#050505] leading-[1.5] min-w-0">
                    {item.title}
                  </p>
                  <ChevronRight size={24} className="shrink-0 text-[#594522] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

        </div>

        {/* See More — mobile only */}
        <div className="flex justify-center md:hidden">
          <Link href="/news" className="px-8 py-3 bg-transparent rounded-[32px] outline outline-[1.5px] outline-offset-[-1.5px] outline-[#b89148] inline-flex justify-center items-center font-dm-sans text-base font-normal text-[#5c4924] hover:bg-[#b89148]/10 transition-colors">
            {t('seeMore')}
          </Link>
        </div>

      </div>
    </section>
  )
}
