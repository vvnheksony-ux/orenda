'use client'

import Image from 'next/image'
import { useState, useEffect, use } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, Phone, X, ChevronLeft, ChevronRight } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'

interface NewsDetail {
  id: string; title: string; slug: string; body: string
  excerpt: string; thumbnail: string | null; images: string[]
  publishedAt: string; author: string
}
interface RelatedItem { id: string; title: string; slug: string; thumbnail: string | null }

export default function NewsDetailPage({ params }: { params: Promise<{ newsId: string }> }) {
  const { newsId } = use(params)
  const locale = useLocale()
  const [article, setArticle] = useState<NewsDetail | null>(null)
  const [related, setRelated] = useState<RelatedItem[]>([])
  const [relatedIsNews, setRelatedIsNews] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/news?locale=${locale}&slug=${encodeURIComponent(newsId)}`).then(r => r.json()),
      fetch(`/api/health-tips?locale=${locale}&limit=6`).then(r => r.json()).catch(() => ({ docs: [] })),
    ]).then(async ([art, tips]) => {
      if (art) setArticle(art)
      const tipDocs = (tips?.docs || []).slice(0, 5)
      if (tipDocs.length > 0) {
        setRelated(tipDocs)
        setRelatedIsNews(false)
      } else {
        const newsList = await fetch(`/api/news?locale=${locale}&limit=10`).then(r => r.json()).catch(() => ({ docs: [] }))
        const others = (newsList?.docs || []).filter((n: any) => n.slug !== newsId).slice(0, 5)
        setRelated(others)
        setRelatedIsNews(true)
      }
    }).catch(() => {}).finally(() => setLoading(false))
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

  // Extra images skip first (thumbnail already shown as hero). Pair into rows of 2.
  const extraImgs = (article?.images ?? []).slice(1)
  type ImagePair = { imgs: string[]; startIdx: number }
  const imagePairs: ImagePair[] = []
  for (let i = 0; i < extraImgs.length; i += 2) {
    imagePairs.push({ imgs: extraImgs.slice(i, i + 2), startIdx: i })
  }

  const heroSrc = article?.thumbnail ?? article?.images?.[0] ?? null

  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full pb-[120px] pt-[100px] lg:pt-[212px]">
        <div className="max-w-[1512px] mx-auto px-4 sm:px-8 lg:px-[80px] flex flex-col gap-[80px]">

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
            <div className="text-center py-[80px]">
              <p className="font-cormorant text-[32px] text-[#3b2d17]">Article not found</p>
              <Link href="/news" className="font-dm-sans text-[#b89148] underline mt-4 block">← Back to News</Link>
            </div>
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
                    <div className="flex gap-[40px] items-start w-full">
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
                          <p className="font-cormorant font-medium text-[24px] text-black leading-none">Location</p>
                          <p className="font-dm-sans text-[16px] text-[#2a2620] leading-[1.8]">
                            Building No. 66, Street 31cc, Stueng Mean Chey Commune, Mean Chey District, Phnom Penh.
                          </p>
                        </div>

                        <div className="bg-white rounded-[12px] p-[24px] flex flex-col gap-[24px]"
                          style={{ filter: 'drop-shadow(0px 4px 8px rgba(122,95,44,0.12))' }}>
                          <p className="font-cormorant font-medium text-[24px] text-black leading-none">Contact Orienda Hospital</p>
                          <p className="font-dm-sans text-[16px] text-[#2a2620] leading-[1.8]">
                            012 322 025 / 086 999 528 / 098 941 758
                          </p>
                          <button className="w-full h-[48px] bg-[#b89148] rounded-[12px] flex items-center justify-center gap-[8px] font-dm-sans text-[18px] text-white hover:bg-[#c8a25a] transition-colors">
                            <Phone size={20} />
                            Contact Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image rows — 2 per row */}
                  {imagePairs.length > 0 && (
                    <div className="flex flex-col gap-[8px] w-full">
                      {imagePairs.map(({ imgs, startIdx }) => (
                        <div key={startIdx} className="flex gap-[8px] w-full" style={{ height: 460 }}>
                          {imgs.map((src, j) => (
                            <div
                              key={j}
                              className="flex-1 relative overflow-hidden rounded-[10px] cursor-zoom-in group"
                              onClick={() => setLightboxIdx(startIdx + j)}
                            >
                              <Image src={src} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" sizes="50vw" unoptimized />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                            </div>
                          ))}
                          {imgs.length === 1 && <div className="flex-1" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Remaining paragraphs */}
                  {restParas.length > 0 && (
                    <div className="w-full">
                      {restParas.map((p, i) => (
                        <p key={i} className="font-dm-sans text-[18px] text-[#2a2620] leading-[1.8] mb-[32px] last:mb-0">{p}</p>
                      ))}
                    </div>
                  )}

                </div>
              </div>

              {/* Explore More */}
              <div className="flex flex-col gap-[40px] items-center w-full overflow-hidden">
                <style>{`
                  @keyframes news-marquee {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .news-marquee-track {
                    animation: news-marquee 28s linear infinite;
                  }
                  .news-marquee-track:hover {
                    animation-play-state: paused;
                  }
                `}</style>

                <div className="flex flex-col gap-[12px] items-center text-center w-full">
                  <p className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">Explore More</p>
                  <p className="font-dm-sans text-[20px] text-[#594522]">Article for health care tips</p>
                </div>

                {related.length > 0 ? (
                  <div className="w-full overflow-hidden">
                    <div className="news-marquee-track flex gap-[40px]" style={{ width: 'max-content' }}>
                      {[...related, ...related].map((item, idx) => (
                        <Link
                          key={idx}
                          href={(relatedIsNews ? `/news/${item.slug}` : `/health-tips/${item.slug}`) as any}
                          className="bg-white flex flex-col overflow-hidden rounded-[16px] shrink-0 w-[300px] hover:shadow-[0px_8px_40px_rgba(184,145,72,0.25)] transition-shadow group"
                          style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}
                        >
                          <div className="relative w-full bg-[#f9f9f9] overflow-hidden shrink-0" style={{ height: 170 }}>
                            {item.thumbnail
                              ? <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="300px" unoptimized />
                              : <div className="w-full h-full bg-[#f9f9f9]" />
                            }
                          </div>
                          <div className="flex flex-col justify-between pb-[24px] pt-[32px] px-[24px]" style={{ height: 200 }}>
                            <p className="font-dm-sans font-medium text-[16px] text-[#3b2d17] leading-[1.5] line-clamp-3">{item.title}</p>
                            <div className="h-[32px] border border-[#b89148] rounded-[12px] flex items-center justify-center gap-[4px] font-dm-sans text-[12px] text-[#594522] group-hover:bg-[#b89148] group-hover:text-white transition-colors duration-300">
                              Read More <ArrowRight size={14} />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-[40px]">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-[300px] rounded-[16px] bg-[#f0ebe0] animate-pulse shrink-0" style={{ height: 370 }} />
                    ))}
                  </div>
                )}
              </div>
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
