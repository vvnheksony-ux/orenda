'use client'

import Image from 'next/image'
import { useState, useEffect, use } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Phone, X, ChevronLeft, ChevronRight } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import PageState from '@/components/shared/PageState'
import ExploreMoreCarousel, { type ExploreMoreItem } from '@/components/shared/ExploreMoreCarousel'
import { useBranch } from '@/lib/branch-context'

interface HealthTipDetail {
  id: string; title: string; slug: string; body: string
  excerpt: string; thumbnail: string | null; publishedAt: string
  author: string; category: string; readingTime: number | null
  images: string[]
}
interface ContentCard { id: string; title: string; slug: string; thumbnail: string | null; href: string }
interface ListDoc { id: string; title: string; slug: string; thumbnail: string | null }

export default function HealthTipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const locale = useLocale()
  const { selectedBranch } = useBranch()
  const [tip, setTip] = useState<HealthTipDetail | null>(null)
  const [related, setRelated] = useState<ContentCard[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const images = tip?.images ?? []

  useEffect(() => {
    Promise.all([
      fetch(`/api/health-tips?locale=${locale}&slug=${encodeURIComponent(slug)}`).then(async (r) => {
        if (!r.ok) throw new Error('We could not load this article right now.')
        return r.json()
      }),
      fetch(`/api/health-tips?locale=${locale}&limit=10`).then(r => r.json()).catch(() => ({ docs: [] })),
    ]).then(([detail, tips]) => {
      if (detail) setTip(detail)
      setLoadError('')
      const tipDocs = (tips?.docs || []) as ListDoc[]
      const pool: ContentCard[] = tipDocs
        .filter((tipDoc) => tipDoc.slug !== slug)
        .map((tipDoc) => ({ id: `tip-${tipDoc.id}`, title: tipDoc.title, slug: tipDoc.slug, thumbnail: tipDoc.thumbnail, href: `/health-tips/${tipDoc.slug}` }))
      // Surface tips that actually have an image first, so the carousel isn't all blank thumbnails.
      const ordered = [...pool.filter((c) => c.thumbnail), ...pool.filter((c) => !c.thumbnail)]
      setRelated(ordered.slice(0, 8))
    }).catch((err: unknown) => {
      setTip(null)
      setRelated([])
      setLoadError(err instanceof Error ? err.message : 'We could not load this article right now.')
    }).finally(() => setLoading(false))
  }, [locale, slug])

  const paragraphs = (tip?.body || tip?.excerpt || '').split('\n').filter(p => p.trim().length > 0)

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full pb-[120px] pt-[90px] lg:pt-[150px]">
        <div className="page-shell flex flex-col gap-[80px]">

          {loading && <div className="h-[600px] rounded-[16px] bg-[#f0ebe0] animate-pulse" />}

          {!loading && !tip && (
            loadError ? (
              <PageState
                title="Article unavailable"
                message={loadError}
              >
                <Link href="/health-tips" className="font-dm-sans text-[#b89148] underline">
                  Back to Health Tips
                </Link>
              </PageState>
            ) : (
              <div className="text-center py-[80px]">
                <p className="font-cormorant text-[32px] text-[#3b2d17]">Article not found</p>
                <Link href="/health-tips" className="font-dm-sans text-[#b89148] underline mt-4 block">← Back to Health Tips</Link>
              </div>
            )
          )}

          {!loading && tip && (
            <>
              <div className="flex flex-col gap-[40px] w-full">

                <h1 className="font-cormorant font-semibold text-[32px] sm:text-[36px] lg:text-[40px] text-[#3b2d17] leading-tight w-full">
                  {tip.title}
                </h1>

                <div className="w-full h-[1px] bg-[#d4b97a]" />

                {tip.thumbnail && (
                  <div className="w-full h-[260px] sm:h-[360px] lg:h-[500px] rounded-[16px] overflow-hidden bg-white/80 shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)]">
                    <div className="relative w-full h-full">
                      <Image src={tip.thumbnail} alt={tip.title} fill className="object-cover" sizes="100vw" unoptimized />
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-[32px] lg:gap-[40px] items-start w-full">
                  <div className="flex-1 min-w-0 font-dm-sans text-[18px] text-[#2a2620] leading-[1.8]">
                    {paragraphs.map((p, i) => (
                      <p key={i} className="mb-[32px] last:mb-0">{p}</p>
                    ))}
                  </div>

                  <div className="flex flex-col gap-[24px] lg:gap-[40px] shrink-0 w-full md:w-[332px]">
                    <div className="bg-white rounded-[12px] p-[24px] flex flex-col gap-[24px]"
                      style={{ boxShadow: '0px 4px 8px rgba(122,95,44,0.12)' }}>
                      <p className="font-cormorant font-medium text-[24px] text-[#3b2d17] leading-none">Location</p>
                      <p className="font-dm-sans text-[16px] text-[#2a2620] leading-[1.8]">
                        {selectedBranch?.address || ''}
                      </p>
                    </div>
                    <div className="bg-white rounded-[12px] p-[24px] flex flex-col gap-[24px]"
                      style={{ boxShadow: '0px 4px 8px rgba(122,95,44,0.12)' }}>
                      <p className="font-cormorant font-medium text-[24px] text-[#3b2d17] leading-none">Book an appointment</p>
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

                {images.length > 0 && (
                  <div className="flex flex-col gap-[24px] w-full">
                    {images.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxIdx(i)}
                        className="relative w-full h-[260px] sm:h-[360px] lg:h-[500px] rounded-[16px] overflow-hidden bg-[#f0ebe0] group cursor-zoom-in"
                      >
                        <Image src={src} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="100vw" unoptimized />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ExploreMoreCarousel
                title="Explore More"
                subtitle="Article for health care tips"
                items={related.map((item) => ({
                  title: item.title,
                  image: item.thumbnail,
                  href: item.href as ExploreMoreItem['href'],
                }))}
              />
            </>
          )}

        </div>
      </div>

      {/* Image lightbox */}
      {lightboxIdx !== null && images[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[500] bg-black/92 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-5 right-5 z-10 size-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
          {lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i ?? 0) - 1) }}
              className="absolute left-5 top-1/2 -translate-y-1/2 z-10 size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={26} className="text-white" />
            </button>
          )}
          {lightboxIdx < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i ?? 0) + 1) }}
              className="absolute right-5 top-1/2 -translate-y-1/2 z-10 size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={26} className="text-white" />
            </button>
          )}
          <div
            className="relative rounded-[12px] overflow-hidden"
            style={{ width: 'min(90vw, 1200px)', height: 'min(80vh, 720px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={images[lightboxIdx]} alt="" fill className="object-contain" sizes="90vw" unoptimized />
          </div>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-dm-sans text-[13px] text-white/50">
            {lightboxIdx + 1} / {images.length}
          </p>
        </div>
      )}
    </SiteLayout>
  )
}
