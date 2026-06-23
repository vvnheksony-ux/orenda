'use client'

import Image from 'next/image'
import { useState, useEffect, use } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Phone, Clock } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import PageState from '@/components/shared/PageState'
import ExploreMoreCarousel, { type ExploreMoreItem } from '@/components/shared/ExploreMoreCarousel'
import Reveal from '@/components/shared/Reveal'

interface HealthTipDetail {
  id: string; title: string; slug: string; body: string
  excerpt: string; thumbnail: string | null; publishedAt: string
  author: string; category: string; readingTime: number | null
}
interface ContentCard { id: string; title: string; slug: string; thumbnail: string | null; href: string }
interface ListDoc { id: string; title: string; slug: string; thumbnail: string | null }

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatCategory(cat: string) {
  const map: Record<string, string> = {
    nutrition: 'Nutrition', exercise: 'Exercise', mentalHealth: 'Mental Health',
    preventiveCare: 'Preventive Care', chronicDisease: 'Chronic Disease',
  }
  return map[cat] ?? cat
}

export default function HealthTipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const locale = useLocale()
  const [tip, setTip] = useState<HealthTipDetail | null>(null)
  const [related, setRelated] = useState<ContentCard[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/health-tips?locale=${locale}&slug=${encodeURIComponent(slug)}`).then(async (r) => {
        if (!r.ok) throw new Error('We could not load this article right now.')
        return r.json()
      }),
      fetch(`/api/health-tips?locale=${locale}&limit=10`).then(r => r.json()).catch(() => ({ docs: [] })),
      fetch(`/api/news?locale=${locale}&limit=10`).then(r => r.json()).catch(() => ({ docs: [] })),
      fetch(`/api/doctor-talks?locale=${locale}&limit=10`).then(r => r.json()).catch(() => ({ docs: [] })),
    ]).then(([detail, tips, news, talks]) => {
      if (detail) setTip(detail)
      setLoadError('')
      const tipDocs = (tips?.docs || []) as ListDoc[]
      const newsDocs = (news?.docs || []) as ListDoc[]
      const talkDocs = (talks?.docs || []) as ListDoc[]
      const pool: ContentCard[] = [
        ...tipDocs.filter((tipDoc) => tipDoc.slug !== slug).map((tipDoc) => ({ id: `tip-${tipDoc.id}`, title: tipDoc.title, slug: tipDoc.slug, thumbnail: tipDoc.thumbnail, href: `/health-tips/${tipDoc.slug}` })),
        ...newsDocs.map((newsDoc) => ({ id: `news-${newsDoc.id}`, title: newsDoc.title, slug: newsDoc.slug, thumbnail: newsDoc.thumbnail, href: `/news/${newsDoc.slug}` })),
        ...talkDocs.map((talkDoc) => ({ id: `talk-${talkDoc.id}`, title: talkDoc.title, slug: talkDoc.slug, thumbnail: talkDoc.thumbnail, href: `/doctor-talks/${talkDoc.slug}` })),
      ]
      // shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]]
      }
      setRelated(pool.slice(0, 4))
    }).catch((err: unknown) => {
      setTip(null)
      setRelated([])
      setLoadError(err instanceof Error ? err.message : 'We could not load this article right now.')
    }).finally(() => setLoading(false))
  }, [locale, slug])

  const paragraphs = (tip?.body || tip?.excerpt || '').split('\n').filter(p => p.trim().length > 0)

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full pb-[120px] pt-[100px] lg:pt-[212px]">
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

                {/* Category + reading time */}
                <Reveal className="flex items-center gap-[12px]">
                  {tip.category && (
                    <span className="px-[12px] py-[6px] rounded-full bg-[#b89148]/15 font-dm-sans text-[14px] text-[#7a5f2c] font-medium">
                      {formatCategory(tip.category)}
                    </span>
                  )}
                  {tip.readingTime && (
                    <span className="flex items-center gap-[6px] font-dm-sans text-[14px] text-[#594522]">
                      <Clock size={14} />
                      {tip.readingTime} min read
                    </span>
                  )}
                </Reveal>

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
                        Building No. 66, Street 31cc, Stueng Mean Chey Commune, Mean Chey District, Phnom Penh.
                      </p>
                    </div>
                    <div className="bg-white rounded-[12px] p-[24px] flex flex-col gap-[24px]"
                      style={{ boxShadow: '0px 4px 8px rgba(122,95,44,0.12)' }}>
                      <p className="font-cormorant font-medium text-[24px] text-[#3b2d17] leading-none">Contact Orienda Hospital</p>
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

                <div className="flex items-center gap-[16px] font-dm-sans text-[14px] text-[#594522]">
                  {tip.author && <span className="font-medium">{tip.author}</span>}
                  {tip.publishedAt && <span>{formatDate(tip.publishedAt)}</span>}
                </div>
              </div>

              <ExploreMoreCarousel
                subtitle="Articles for health care tips"
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
    </SiteLayout>
  )
}
