'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import SiteLayout from '@/components/layout/SiteLayout'

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string
  thumbnail: string | null
  publishedAt: string
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function NewsPage() {
  const locale = useLocale()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/news?locale=${locale}&limit=20`)
      .then(r => r.json())
      .then(d => { if (d?.docs?.length) setNews(d.docs) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locale])

  const featured = news[0]
  const rest = news.slice(1)

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: '#fbf7ee' }}>
        <div className="max-w-[1512px] mx-auto px-4 sm:px-8 lg:px-[80px]">

          <div className="text-center mb-[40px]">
            <h1 className="font-cormorant font-bold text-[64px] text-[#3b2d17] leading-none mb-4">News & Updates</h1>
            <p className="font-dm-sans text-[18px] text-[#594522]">Stay informed with the latest from Orienda International Hospital</p>
          </div>

          {loading && (
            <div className="flex flex-col gap-[16px]">
              <div className="h-[400px] rounded-[24px] bg-[#f0ebe0] animate-pulse" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
                {Array(4).fill(0).map((_, i) => <div key={i} className="h-[280px] rounded-[16px] bg-[#f0ebe0] animate-pulse" />)}
              </div>
            </div>
          )}

          {!loading && featured && (
            <>
              {/* Featured article */}
              <Link href={`/news/${featured.slug}` as any}
                className="block bg-white rounded-[24px] overflow-hidden shadow-[0px_4px_16px_rgba(122,95,44,0.10)] mb-[32px] grid grid-cols-1 lg:grid-cols-2 hover:shadow-lg transition-shadow">
                <div className="relative h-[280px] lg:h-[380px]">
                  {featured.thumbnail
                    ? <Image src={featured.thumbnail} alt={featured.title} fill className="object-cover" sizes="600px" unoptimized />
                    : <div className="w-full h-full bg-[#f0ebe0]" />
                  }
                </div>
                <div className="p-8 lg:p-10 flex flex-col justify-center gap-[16px]">
                  <span className="font-dm-sans text-[13px] text-[#b89148]">{formatDate(featured.publishedAt)}</span>
                  <h2 className="font-cormorant font-bold text-[36px] text-[#3b2d17] leading-tight">{featured.title}</h2>
                  <p className="font-dm-sans text-[16px] text-[#594522] leading-relaxed line-clamp-3">{featured.excerpt}</p>
                  <span className="font-dm-sans text-[14px] text-[#b89148] font-medium">Read More →</span>
                </div>
              </Link>

              {/* Rest grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
                  {rest.map(item => (
                    <Link key={item.id} href={`/news/${item.slug}` as any}
                      className="bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_12px_rgba(122,95,44,0.08)] hover:shadow-md transition-shadow flex flex-col">
                      <div className="relative h-[180px]">
                        {item.thumbnail
                          ? <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="400px" unoptimized />
                          : <div className="w-full h-full bg-[#f0ebe0]" />
                        }
                      </div>
                      <div className="p-[16px] flex flex-col gap-[8px] flex-1">
                        <span className="font-dm-sans text-[12px] text-[#b89148]">{formatDate(item.publishedAt)}</span>
                        <h3 className="font-cormorant font-bold text-[18px] text-[#3b2d17] leading-tight line-clamp-2">{item.title}</h3>
                        <p className="font-dm-sans text-[13px] text-[#594522] line-clamp-2">{item.excerpt}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !featured && (
            <p className="text-center font-dm-sans text-[#594522] text-[18px] py-[80px]">No news available.</p>
          )}

        </div>
      </div>
    </SiteLayout>
  )
}
