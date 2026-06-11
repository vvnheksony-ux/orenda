'use client'

import Image from 'next/image'
import { useState, useEffect, use } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, Phone, ChevronLeft, ChevronRight, X } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'

interface NewsDetail {
  id: string; title: string; slug: string; body: string
  excerpt: string; thumbnail: string | null; images: string[]
  publishedAt: string; author: string
}
interface RelatedItem { id: string; title: string; slug: string; thumbnail: string | null }

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ImageGallery({ thumbnail, images }: { thumbnail: string | null; images: string[] }) {
  const all = [thumbnail, ...images].filter(Boolean) as string[]
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (all.length === 0) return null

  return (
    <>
      {/* Main image */}
      <div
        className="w-full rounded-[16px] overflow-hidden bg-white shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] cursor-zoom-in relative"
        style={{ height: 500 }}
        onClick={() => setLightbox(true)}
      >
        <Image src={all[active]} alt="article image" fill className="object-cover" sizes="100vw" unoptimized />
        {all.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setActive(i => (i - 1 + all.length) % all.length) }}
              className="absolute left-[16px] top-1/2 -translate-y-1/2 z-10 size-[44px] rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={22} className="text-white" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setActive(i => (i + 1) % all.length) }}
              className="absolute right-[16px] top-1/2 -translate-y-1/2 z-10 size-[44px] rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={22} className="text-white" />
            </button>
            <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 flex gap-[8px] z-10">
              {all.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActive(i) }}
                  className={`rounded-full transition-all ${i === active ? 'w-[24px] h-[8px] bg-white' : 'size-[8px] bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {all.length > 1 && (
        <div className="flex gap-[12px] overflow-x-auto pb-1">
          {all.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-[100px] h-[70px] rounded-[8px] overflow-hidden border-2 transition-all ${i === active ? 'border-[#b89148]' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <div className="relative w-full h-full">
                <Image src={src} alt="" fill className="object-cover" sizes="100px" unoptimized />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-black/92 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} className="absolute top-[20px] right-[20px] z-10 size-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X size={20} className="text-white" />
          </button>
          {all.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setActive(i => (i - 1 + all.length) % all.length) }} className="absolute left-[20px] top-1/2 -translate-y-1/2 z-10 size-[52px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <ChevronLeft size={28} className="text-white" />
              </button>
              <button onClick={e => { e.stopPropagation(); setActive(i => (i + 1) % all.length) }} className="absolute right-[20px] top-1/2 -translate-y-1/2 z-10 size-[52px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <ChevronRight size={28} className="text-white" />
              </button>
            </>
          )}
          <div className="relative w-[90vw] max-w-[1200px] h-[80vh] rounded-[12px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <Image src={all[active]} alt="article image" fill className="object-contain" sizes="90vw" unoptimized />
          </div>
          <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 font-dm-sans text-white/60 text-[13px]">{active + 1} / {all.length}</div>
        </div>
      )}
    </>
  )
}

export default function NewsDetailPage({ params }: { params: Promise<{ newsId: string }> }) {
  const { newsId } = use(params)
  const locale = useLocale()
  const [article, setArticle] = useState<NewsDetail | null>(null)
  const [related, setRelated] = useState<RelatedItem[]>([])
  const [relatedIsNews, setRelatedIsNews] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/news?locale=${locale}&slug=${encodeURIComponent(newsId)}`).then(r => r.json()),
      fetch(`/api/health-tips?locale=${locale}&limit=5`).then(r => r.json()).catch(() => ({ docs: [] })),
    ]).then(async ([art, tips]) => {
      if (art) setArticle(art)
      const tipDocs = (tips?.docs || []).slice(0, 4)
      if (tipDocs.length > 0) {
        setRelated(tipDocs)
        setRelatedIsNews(false)
      } else {
        const newsList = await fetch(`/api/news?locale=${locale}&limit=10`).then(r => r.json()).catch(() => ({ docs: [] }))
        const others = (newsList?.docs || []).filter((n: any) => n.slug !== newsId).slice(0, 4)
        setRelated(others)
        setRelatedIsNews(true)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [locale, newsId])

  const paragraphs = (article?.body || article?.excerpt || '').split('\n').filter(p => p.trim().length > 0)

  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full pb-[120px] pt-[100px] lg:pt-[212px]">
        <div className="max-w-[1512px] mx-auto px-4 sm:px-8 lg:px-[80px] flex flex-col gap-[80px]">

          {loading && (
            <div className="flex flex-col gap-[40px]">
              <div className="h-[48px] w-3/4 mx-auto rounded-[8px] bg-[#f0ebe0] animate-pulse" />
              <div className="h-[1px] w-full bg-[#f0ebe0]" />
              <div className="h-[500px] w-full rounded-[16px] bg-[#f0ebe0] animate-pulse" />
              <div className="flex gap-[40px]">
                <div className="flex-1 flex flex-col gap-[16px]">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-[20px] rounded bg-[#f0ebe0] animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />)}
                </div>
                <div className="w-[332px] h-[280px] rounded-[12px] bg-[#f0ebe0] animate-pulse shrink-0" />
              </div>
            </div>
          )}

          {!loading && !article && (
            <div className="text-center py-[80px]">
              <p className="font-cormorant text-[32px] text-[#3b2d17]">Article not found</p>
              <Link href="/news" className="font-dm-sans text-[#b89148] underline mt-4 block">← Back to News</Link>
            </div>
          )}

          {!loading && article && (
            <>
              <div className="flex flex-col gap-[40px] w-full">

                {/* Author + date row */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-[16px] font-dm-sans text-[14px] text-[#594522]">
                    {article.author && (
                      <span className="flex items-center gap-[6px] font-medium">
                        <span className="size-[28px] rounded-full bg-[#b89148]/20 flex items-center justify-center font-cormorant text-[14px] text-[#b89148] font-bold">
                          {article.author.charAt(0).toUpperCase()}
                        </span>
                        {article.author}
                      </span>
                    )}
                    {article.publishedAt && (
                      <span className="text-[#7a5f2c]">{formatDate(article.publishedAt)}</span>
                    )}
                  </div>
                  <Link href="/news" className="font-dm-sans text-[13px] text-[#b89148] hover:text-[#7a5f2c] transition-colors flex items-center gap-[4px]">
                    <ChevronLeft size={14} />
                    Back to News
                  </Link>
                </div>

                {/* Title */}
                <h1 className="font-cormorant font-semibold text-[44px] text-[#3b2d17] leading-[1.15] w-full">
                  {article.title}
                </h1>

                {/* Divider */}
                <div className="w-full h-[1px] bg-[#d4b97a]" />

                {/* Gallery */}
                <ImageGallery thumbnail={article.thumbnail} images={article.images ?? []} />

                {/* Body + sidebar */}
                <div className="flex gap-[48px] items-start w-full">
                  <div className="flex-1 min-w-0">
                    {article.excerpt && paragraphs.length <= 1 && (
                      <p className="font-dm-sans text-[18px] text-[#594522] leading-[1.8] mb-[32px] italic border-l-[3px] border-[#b89148] pl-[20px]">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="font-dm-sans text-[18px] text-[#2a2620] leading-[1.8]">
                      {paragraphs.map((p, i) => (
                        <p key={i} className="mb-[28px] last:mb-0">{p}</p>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-[32px] shrink-0 w-[300px]">
                    <div className="bg-white rounded-[16px] p-[24px] flex flex-col gap-[20px]"
                      style={{ boxShadow: '0px 4px 16px rgba(122,95,44,0.10)' }}>
                      <div className="flex items-center gap-[10px]">
                        <div className="size-[8px] rounded-full bg-[#b89148]" />
                        <p className="font-cormorant font-semibold text-[20px] text-[#3b2d17] leading-none">Location</p>
                      </div>
                      <p className="font-dm-sans text-[14px] text-[#594522] leading-[1.7]">
                        Building No. 66, Street 31cc, Stueng Mean Chey Commune, Mean Chey District, Phnom Penh.
                      </p>
                    </div>

                    <div className="bg-white rounded-[16px] p-[24px] flex flex-col gap-[20px]"
                      style={{ boxShadow: '0px 4px 16px rgba(122,95,44,0.10)' }}>
                      <div className="flex items-center gap-[10px]">
                        <div className="size-[8px] rounded-full bg-[#b89148]" />
                        <p className="font-cormorant font-semibold text-[20px] text-[#3b2d17] leading-none">Contact Us</p>
                      </div>
                      <div className="flex flex-col gap-[4px]">
                        <p className="font-dm-sans text-[13px] text-[#7a5f2c]">012 322 025</p>
                        <p className="font-dm-sans text-[13px] text-[#7a5f2c]">086 999 528</p>
                        <p className="font-dm-sans text-[13px] text-[#7a5f2c]">098 941 758</p>
                      </div>
                      <button className="w-full h-[44px] bg-[#b89148] rounded-[10px] flex items-center justify-center gap-[8px] font-dm-sans text-[15px] text-white hover:bg-[#c8a25a] transition-colors">
                        <Phone size={16} />
                        Contact Now
                      </button>
                    </div>

                    <Link
                      href="/appointments"
                      className="w-full h-[44px] bg-white border border-[#b89148] rounded-[10px] flex items-center justify-center gap-[8px] font-dm-sans text-[15px] text-[#5c4924] hover:bg-[#b89148]/8 transition-colors"
                      style={{ boxShadow: '0px 4px 16px rgba(122,95,44,0.08)' }}
                    >
                      Book Appointment
                    </Link>
                  </div>
                </div>

              </div>

              {/* Explore More */}
              <div className="flex flex-col gap-[48px] items-center">
                <div className="w-full flex flex-col gap-[10px] items-center">
                  <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">Explore More</h2>
                  <div className="w-[60px] h-[2px] bg-[#b89148] rounded-full" />
                </div>

                {related.length > 0 ? (
                  <div className="flex gap-[32px] items-stretch justify-center flex-wrap w-full">
                    {related.map(item => (
                      <Link
                        key={item.id}
                        href={(relatedIsNews ? `/news/${item.slug}` : `/health-tips/${item.slug}`) as any}
                        className="bg-white flex flex-col overflow-hidden rounded-[16px] w-[280px] hover:shadow-[0px_8px_32px_rgba(184,145,72,0.2)] transition-shadow group"
                        style={{ boxShadow: '0px 4px_20px_8px_rgba(220,189,114,0.10)' }}
                      >
                        <div className="relative h-[180px] w-full bg-[#f5efe4] overflow-hidden shrink-0">
                          {item.thumbnail
                            ? <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="280px" unoptimized />
                            : <div className="w-full h-full bg-gradient-to-br from-[#ead6a4]/40 to-[#f0ebe0]" />
                          }
                        </div>
                        <div className="flex flex-col flex-1 justify-between p-[20px] gap-[16px]">
                          <p className="font-dm-sans font-medium text-[15px] text-[#3b2d17] leading-[1.5] line-clamp-3">{item.title}</p>
                          <div className="flex items-center gap-[6px] text-[#b89148] font-dm-sans text-[12px] font-medium">
                            Read More <ArrowRight size={14} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-[32px] flex-wrap justify-center">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-[280px] h-[360px] rounded-[16px] bg-[#f0ebe0] animate-pulse" />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </SiteLayout>
  )
}
