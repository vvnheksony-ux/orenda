'use client'

import Image from 'next/image'
import { useState, useEffect, use } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, Phone, Clock, ChevronRight } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'

interface HealthTipDetail {
  id: string; title: string; slug: string; body: string
  excerpt: string; thumbnail: string | null; publishedAt: string
  author: string; category: string; readingTime: number | null
}
interface TipCard { id: string; title: string; slug: string; thumbnail: string | null }

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
  const [related, setRelated] = useState<TipCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/health-tips?locale=${locale}&slug=${encodeURIComponent(slug)}`).then(r => r.json()),
      fetch(`/api/health-tips?locale=${locale}&limit=5`).then(r => r.json()).catch(() => ({ docs: [] })),
    ]).then(([detail, list]) => {
      if (detail) setTip(detail)
      const others = (list?.docs || []).filter((t: any) => t.slug !== slug).slice(0, 4)
      setRelated(others)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [locale, slug])

  const paragraphs = (tip?.body || tip?.excerpt || '').split('\n').filter(p => p.trim().length > 0)

  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full pb-[120px] pt-[100px] lg:pt-[212px]">
        <div className="max-w-[1512px] mx-auto px-4 sm:px-8 lg:px-[80px] flex flex-col gap-[80px]">

          {loading && <div className="h-[600px] rounded-[16px] bg-[#f0ebe0] animate-pulse" />}

          {!loading && !tip && (
            <div className="text-center py-[80px]">
              <p className="font-cormorant text-[32px] text-[#3b2d17]">Article not found</p>
              <Link href="/health-tips" className="font-dm-sans text-[#b89148] underline mt-4 block">← Back to Health Tips</Link>
            </div>
          )}

          {!loading && tip && (
            <>
              <div className="flex flex-col gap-[40px] w-full">

                {/* Category + reading time */}
                <div className="flex items-center gap-[12px]">
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
                </div>

                <h1 className="font-cormorant font-semibold text-[40px] text-[#3b2d17] leading-tight w-full">
                  {tip.title}
                </h1>

                <div className="w-full h-[1px] bg-[#d4b97a]" />

                {tip.thumbnail && (
                  <div className="w-full h-[500px] rounded-[16px] overflow-hidden bg-white/80 shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)]">
                    <div className="relative w-full h-full">
                      <Image src={tip.thumbnail} alt={tip.title} fill className="object-cover" sizes="100vw" unoptimized />
                    </div>
                  </div>
                )}

                <div className="flex gap-[40px] items-start w-full">
                  <div className="flex-1 min-w-0 font-dm-sans text-[18px] text-[#2a2620] leading-[1.8]">
                    {paragraphs.map((p, i) => (
                      <p key={i} className="mb-[32px] last:mb-0">{p}</p>
                    ))}
                  </div>

                  <div className="flex flex-col gap-[40px] shrink-0 w-[332px]">
                    <div className="bg-white rounded-[12px] p-[24px] flex flex-col gap-[24px]"
                      style={{ boxShadow: '0px 4px 8px rgba(122,95,44,0.12)' }}>
                      <p className="font-cormorant font-medium text-[24px] text-black leading-none">Location</p>
                      <p className="font-dm-sans text-[16px] text-[#2a2620] leading-[1.8]">
                        Building No. 66, Street 31cc, Stueng Mean Chey Commune, Mean Chey District, Phnom Penh.
                      </p>
                    </div>
                    <div className="bg-white rounded-[12px] p-[24px] flex flex-col gap-[24px]"
                      style={{ boxShadow: '0px 4px 8px rgba(122,95,44,0.12)' }}>
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

                <div className="flex items-center gap-[16px] font-dm-sans text-[14px] text-[#594522]">
                  {tip.author && <span className="font-medium">{tip.author}</span>}
                  {tip.publishedAt && <span>{formatDate(tip.publishedAt)}</span>}
                </div>
              </div>

              {/* More Health Tips */}
              <div className="flex flex-col gap-[40px] items-center">
                <div className="flex flex-col gap-[12px] text-center w-full leading-none">
                  <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17]">More Health Tips</h2>
                  <p className="font-dm-sans text-[20px] text-[#594522]">Articles for health care tips</p>
                </div>

                {related.length > 0 ? (
                  <div className="flex gap-[40px] items-center justify-center flex-wrap">
                    {related.map(item => (
                      <Link
                        key={item.id}
                        href={`/health-tips/${item.slug}` as any}
                        className="bg-white flex flex-col items-center overflow-hidden rounded-[16px] shrink-0 w-[300px] hover:shadow-lg transition-shadow"
                        style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}
                      >
                        <div className="relative h-[170px] w-full bg-[#f9f9f9] overflow-hidden">
                          {item.thumbnail
                            ? <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="300px" unoptimized />
                            : <div className="w-full h-full bg-[#f0ebe0]" />
                          }
                        </div>
                        <div className="flex flex-col h-[200px] items-end justify-between pb-[24px] pt-[32px] px-[24px] w-full">
                          <p className="font-dm-sans font-medium text-[16px] text-[#3b2d17] leading-[1.5] w-full line-clamp-3">{item.title}</p>
                          <div className="flex items-center h-[32px] px-[12px] py-[8px] border border-[#b89148] rounded-[12px] gap-[4px] shrink-0">
                            <span className="font-dm-sans text-[12px] text-[#594522] px-[8px]">Read More</span>
                            <ArrowRight size={16} className="text-[#594522]" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-[40px] flex-wrap justify-center">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-[300px] h-[370px] rounded-[16px] bg-[#f0ebe0] animate-pulse" />
                    ))}
                  </div>
                )}

                <Link
                  href="/health-tips"
                  className="flex items-center gap-[8px] px-[32px] py-[12px] rounded-full border border-[#b89148] font-dm-sans text-[16px] text-[#5c4924] hover:bg-[#b89148]/10 transition-colors"
                >
                  View All Health Tips
                  <ChevronRight size={16} />
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </SiteLayout>
  )
}
