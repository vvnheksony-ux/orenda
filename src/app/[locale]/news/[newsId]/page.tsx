'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'
import { useState, useEffect, use } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useScrollLock } from '@/lib/useScrollLock'
import { Phone, X, ChevronLeft, ChevronRight } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import PageState from '@/components/shared/PageState'
import ExploreMoreCarousel from '@/components/shared/ExploreMoreCarousel'
import { useBranch } from '@/lib/branch-context'
import { fetchJsonRetry } from '@/lib/fetch-retry'

interface NewsDetail {
  id: string; title: string; slug: string; body: string
  excerpt: string; thumbnail: string | null; images: string[]
  publishedAt: string; author: string
}
interface RelatedItem { id: string; title: string; slug: string; thumbnail: string | null }

type LocalizedHref = ComponentProps<typeof Link>['href']
const articleHref = (slug: string, relatedIsNews: boolean): LocalizedHref =>
  (relatedIsNews ? `/news/${slug}` : `/health-tips/${slug}`) as LocalizedHref

export default function NewsDetailPage({ params }: { params: Promise<{ newsId: string }> }) {
  const { newsId } = use(params)
  const locale = useLocale()
  const { selectedBranch } = useBranch()
  const [article, setArticle] = useState<NewsDetail | null>(null)
  const [related, setRelated] = useState<RelatedItem[]>([])
  const [relatedIsNews, setRelatedIsNews] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  // Lock background scroll while the image lightbox is open.
  useScrollLock(lightboxIdx !== null)

  useEffect(() => {
    Promise.all([
      fetchJsonRetry<any>(`/api/news?locale=${locale}&slug=${encodeURIComponent(newsId)}`),
      fetchJsonRetry<any>(`/api/news?locale=${locale}&limit=10`).catch(() => ({ docs: [] })),
    ]).then(([art, newsList]) => {
      if (art) setArticle(art)
      setLoadError('')
      const others = ((newsList?.docs || []) as RelatedItem[]).filter((item) => item.slug !== newsId).slice(0, 5)
      setRelated(others)
      setRelatedIsNews(true)
    }).catch((err: unknown) => {
      setArticle(null)
      setRelated([])
      setLoadError(err instanceof Error ? err.message : 'We could not load this article right now.')
    }).finally(() => setLoading(false))
  }, [locale, newsId])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIdx === null) return
    const total = (article?.images?.length ?? 1) - 1
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null)
      if (e.key === 'ArrowLeft') setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i))
      if (e.key === 'ArrowRight') setLightboxIdx(i => (i !== null && i < total - 1 ? i + 1 : i))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIdx, article?.images?.length])

  const paragraphs = (article?.body || article?.excerpt || '').split('\n').filter(p => p.trim().length > 0)

  const FIRST_SPLIT = Math.min(3, Math.ceil(paragraphs.length / 2))
  const firstParas = paragraphs.slice(0, FIRST_SPLIT)
  const restParas = paragraphs.slice(FIRST_SPLIT)

  const heroSrc = article?.thumbnail ?? article?.images?.[0] ?? null
  const bodyContentClass = 'w-full'

  // If a dedicated thumbnail exists, render every Payload gallery image as-is.
  // Only skip the first image when it is being used as the hero fallback.
  const extraImgs = article?.thumbnail
    ? (article.images ?? [])
    : (article?.images ?? []).slice(heroSrc ? 1 : 0)
  const MIDDLE_TEXT_TARGET_CHARS = 1000
  const middleParas: string[] = []
  let middleCharCount = 0
  for (const para of restParas) {
    if (middleParas.length > 0 && middleCharCount >= MIDDLE_TEXT_TARGET_CHARS) break
    middleParas.push(para)
    middleCharCount += para.length
  }
  const finalParas = restParas.slice(middleParas.length)
  const topGalleryImgs = extraImgs.length === 1 ? [] : extraImgs.slice(0, 2)
  const featuredGalleryImg = extraImgs.length === 1 ? extraImgs[0] : extraImgs[2] ?? null
  const trailingGalleryImgs = extraImgs.length > 3 ? extraImgs.slice(3) : []
  type ImagePair = { imgs: string[]; startIdx: number }
  const trailingImagePairs: ImagePair[] = []
  for (let i = 0; i < trailingGalleryImgs.length; i += 2) {
    trailingImagePairs.push({ imgs: trailingGalleryImgs.slice(i, i + 2), startIdx: i + 3 })
  }

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full pb-[120px] pt-[90px] lg:pt-[150px]">
        <div className="page-shell flex flex-col gap-[80px]">

          {/* Skeleton */}
          {loading && (
            <div className="flex flex-col gap-[40px]">
              <div className="h-[48px] w-3/4 mx-auto rounded-[8px] bg-[#f0ebe0] animate-pulse" />
              <div className="h-[1px] w-full bg-[#f0ebe0]" />
              <div className="h-[500px] w-full rounded-[16px] bg-[#f0ebe0] animate-pulse" />
              <div className="flex gap-[40px]">
                <div className="flex-1 flex flex-col gap-[20px]">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-[20px] rounded bg-[#f0ebe0] animate-pulse" style={{ width: `${65 + (i % 3) * 12}%` }} />
                  ))}
                </div>
                <div className="w-[332px] h-[300px] rounded-[12px] bg-[#f0ebe0] animate-pulse shrink-0" />
              </div>
            </div>
          )}

          {/* Not found */}
          {!loading && !article && (
            loadError ? (
              <PageState
                title="Article unavailable"
                message={loadError}
              >
                <Link href="/news" className="font-dm-sans text-[#b89148] underline">
                  Back to News
                </Link>
              </PageState>
            ) : (
              <div className="text-center py-[80px]">
                <p className="font-cormorant text-[32px] text-[#3b2d17]">Article not found</p>
                <Link href="/news" className="font-dm-sans text-[#b89148] underline mt-4 block">← Back to News</Link>
              </div>
            )
          )}

          {/* Article */}
          {!loading && article && (
            <>
              <div className="flex flex-col gap-[40px] w-full">

                {/* Title */}
                <h1 className="font-cormorant font-semibold text-[40px] text-[#3b2d17] leading-none text-center w-full">
                  {article.title}
                </h1>

                {/* Gold divider */}
                <div className="w-full h-[1px] bg-[#d4b97a]" />

                {/* Hero image */}
                {heroSrc && (
                  <div className="bg-white w-full rounded-[16px] overflow-hidden relative group cursor-zoom-in"
                    style={{ height: 500 }}
                    onClick={() => setLightboxIdx(-1)}
                  >
                    <Image
                      src={heroSrc}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="100vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                )}

                {/* Body */}
                <div className="flex flex-col gap-[40px] w-full">

                  {/* First text + sidebar */}
                  {(firstParas.length > 0 || article.excerpt) && (
                    <div className={`${bodyContentClass} flex flex-col md:flex-row gap-[40px] items-start`}>
                      <div className="flex-1 min-w-0">
                        {article.excerpt && paragraphs.length <= 1 ? (
                          <p className="font-dm-sans text-[18px] text-[#2a2620] leading-[1.8]">{article.excerpt}</p>
                        ) : (
                          firstParas.map((p, i) => (
                            <p key={i} className="font-dm-sans text-[18px] text-[#2a2620] leading-[1.8] mb-[32px] last:mb-0">{p}</p>
                          ))
                        )}
                      </div>

                      <div className="flex flex-col gap-[40px] shrink-0 w-[332px]">
                        <div className="bg-white rounded-[12px] p-[24px] flex flex-col gap-[24px]"
                          style={{ filter: 'drop-shadow(0px 4px 8px rgba(122,95,44,0.12))' }}>
                          <p className="font-cormorant font-medium text-[24px] text-[#3b2d17] leading-none">Location</p>
                          <p className="font-dm-sans text-[16px] text-[#2a2620] leading-[1.8]">
                            {selectedBranch?.address || ''}
                          </p>
                        </div>

                        <div className="bg-white rounded-[12px] p-[24px] flex flex-col gap-[24px]"
                          style={{ filter: 'drop-shadow(0px 4px 8px rgba(122,95,44,0.12))' }}>
                          <p className="font-cormorant font-medium text-[24px] text-[#3b2d17] leading-none">Contact Orienda Hospital</p>
                          <p className="font-dm-sans text-[16px] text-[#2a2620] leading-[1.8]">
                            {selectedBranch?.phone || ''}
                          </p>
                          <button className="w-full h-[48px] bg-[#b89148] rounded-[12px] flex items-center justify-center gap-[8px] font-dm-sans text-[18px] text-white hover:bg-[#c8a25a] transition-colors">
                            <Phone size={20} />
                            Contact Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gallery layout */}
                  {topGalleryImgs.length > 0 && (
                    <div className={bodyContentClass}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                        {topGalleryImgs.map((src, idx) => (
                          <div
                            key={`${src}-${idx}`}
                            className="relative overflow-hidden rounded-[12px] cursor-zoom-in group h-[280px] md:h-[420px]"
                            onClick={() => setLightboxIdx(idx)}
                          >
                            <Image src={src} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mid-body text */}
                  {middleParas.length > 0 && (
                    <div className={bodyContentClass}>
                      {middleParas.map((p, i) => (
                        <p key={i} className="font-dm-sans text-[18px] text-[#2a2620] leading-[1.8] mb-[32px] last:mb-0">{p}</p>
                      ))}
                    </div>
                  )}

                  {/* Featured follow-up image */}
                  {featuredGalleryImg && (
                    <div className={bodyContentClass}>
                      <div
                        className="relative overflow-hidden rounded-[12px] cursor-zoom-in group h-[300px] md:h-[520px]"
                        onClick={() => setLightboxIdx(extraImgs.length === 1 ? 0 : 2)}
                      >
                        <Image src={featuredGalleryImg} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" sizes="(max-width: 1024px) 100vw, 980px" unoptimized />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                      </div>
                    </div>
                  )}

                  {/* Remaining paragraphs */}
                  {finalParas.length > 0 && (
                    <div className={bodyContentClass}>
                      {finalParas.map((p, i) => (
                        <p key={i} className="font-dm-sans text-[18px] text-[#2a2620] leading-[1.8] mb-[32px] last:mb-0">{p}</p>
                      ))}
                    </div>
                  )}

                  {/* Remaining gallery rows */}
                  {trailingImagePairs.length > 0 && (
                    <div className={`flex flex-col gap-[12px] ${bodyContentClass}`}>
                      {trailingImagePairs.map(({ imgs, startIdx }) => (
                        <div
                          key={startIdx}
                          className={imgs.length === 1
                            ? 'grid grid-cols-1 md:grid-cols-2 gap-[12px] w-full md:w-[calc(50%-6px)] mx-auto'
                            : 'grid grid-cols-1 md:grid-cols-2 gap-[12px] w-full'}
                        >
                          {imgs.map((src, j) => (
                            <div
                              key={`${src}-${j}`}
                              className="relative overflow-hidden rounded-[12px] cursor-zoom-in group h-[280px] md:h-[420px]"
                              onClick={() => setLightboxIdx(startIdx + j)}
                            >
                              <Image src={src} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                            </div>
                          ))}
                          {imgs.length === 1 && <div className="hidden md:block" />}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>

              {/* Explore More */}
              <ExploreMoreCarousel
                subtitle="Latest news and updates"
                items={related.map((item) => ({
                  title: item.title,
                  image: item.thumbnail,
                  href: articleHref(item.slug, relatedIsNews),
                }))}
              />
            </>
          )}

        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && article && (() => {
        const imgs = lightboxIdx === -1
          ? [heroSrc!, ...extraImgs]
          : extraImgs
        const adjustedIdx = lightboxIdx === -1 ? 0 : lightboxIdx
        const src = imgs[adjustedIdx]
        if (!src) return null
        return (
          <div
            className="fixed inset-0 z-[500] bg-black/92 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setLightboxIdx(null)}
          >
            {/* Close */}
            <button
              onClick={() => setLightboxIdx(null)}
              className="absolute top-5 right-5 z-10 size-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Prev */}
            {adjustedIdx > 0 && (
              <button
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => i !== null ? (i === -1 ? 0 : i) - 1 : null) }}
                className="absolute left-5 top-1/2 -translate-y-1/2 z-10 size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={26} className="text-white" />
              </button>
            )}

            {/* Next */}
            {adjustedIdx < imgs.length - 1 && (
              <button
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => i !== null ? (i === -1 ? 1 : i + 1) : null) }}
                className="absolute right-5 top-1/2 -translate-y-1/2 z-10 size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronRight size={26} className="text-white" />
              </button>
            )}

            {/* Image */}
            <div
              className="relative rounded-[12px] overflow-hidden"
              style={{ width: 'min(90vw, 1200px)', height: 'min(80vh, 720px)' }}
              onClick={e => e.stopPropagation()}
            >
              <Image src={src} alt="" fill className="object-contain" sizes="90vw" unoptimized />
            </div>

            {/* Counter */}
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-dm-sans text-[13px] text-white/50">
              {adjustedIdx + 1} / {imgs.length}
            </p>
          </div>
        )
      })()}
    </SiteLayout>
  )
}
