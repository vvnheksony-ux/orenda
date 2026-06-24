import Image from 'next/image'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ComponentProps } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import { MapPin, Clock, ChevronLeft } from 'lucide-react'
import ExploreMoreCarousel, { type ExploreMoreItem } from '@/components/shared/ExploreMoreCarousel'

type LocalizedHref = ComponentProps<typeof Link>['href']

const FALLBACK_ARTICLES: ExploreMoreItem[] = [
  { title: 'Explore health news and hospital updates', image: '/images/promo-explore-1.jpg', href: '/news' },
  { title: 'Read the latest Orienda healthcare stories', image: '/images/promo-explore-2.jpg', href: '/news' },
  { title: 'Discover helpful health care tips', image: '/images/promo-explore-3.jpg', href: '/news' },
]

function formatExpiry(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

interface PromoDetail {
  id: string
  title: string
  slug: string
  image: string | null
  validTo: string | null
  description: string
}

interface NewsListDoc {
  title?: string | null
  slug?: string | null
  thumbnail?: string | null
  images?: string[]
}

function isDisplayableNews(article: NewsListDoc) {
  const slug = article.slug?.trim().toLowerCase()
  const title = article.title?.trim()
  if (!slug || !title) return false
  if (['test', 'testa', 'both', 'hello'].includes(slug)) return false
  if (title.length < 12) return false
  return true
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ promoId: string; locale: string }>
}) {
  const { promoId, locale } = await params
  const headerStore = await headers()

  // Fetch via the raw-pool API route (the working DB path) instead of Payload's
  // direct connection, which times out. Mirrors how the rest of the site fetches.
  const forwardedProto = headerStore.get('x-forwarded-proto')
  const forwardedHost = headerStore.get('x-forwarded-host')
  const host = forwardedHost ?? headerStore.get('host')
  const base = host
    ? `${forwardedProto ?? 'https'}://${host}`
    : process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  let promo: PromoDetail | null = null
  try {
    const res = await fetch(
      `${base}/api/promotions?slug=${encodeURIComponent(promoId)}&locale=${locale}`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const data = await res.json() as PromoDetail | PromoDetail[] | null
      promo = Array.isArray(data) ? (data[0] ?? null) : (data?.id ? data : null)
    }
  } catch {}

  if (!promo) notFound()

  let relatedArticles: ExploreMoreItem[] = []
  try {
    const res = await fetch(`${base}/api/news?locale=${locale}&limit=10`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json() as { docs?: NewsListDoc[] }
      relatedArticles = (data.docs ?? [])
        .filter(isDisplayableNews)
        .slice(0, 6)
        .map((article, idx) => ({
          title: article.title || 'Orienda health article',
          image:
            article.thumbnail ||
            article.images?.[0] ||
            FALLBACK_ARTICLES[idx % FALLBACK_ARTICLES.length].image,
          href: `/news/${article.slug}` as LocalizedHref,
        }))
    }
  } catch {}
  if (relatedArticles.length === 0) relatedArticles = FALLBACK_ARTICLES

  const image = promo.image ?? null
  const paragraphs = String(promo.description || '')
    .split('\n')
    .map((s: string) => s.trim())
    .filter(Boolean)
  const expiry = formatExpiry(promo.validTo ?? null)

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[90px] lg:pt-[150px] pb-[120px]" style={{ background: 'var(--background)' }}>
        <div className="content-shell flex flex-col gap-10">

          {/* Hero image */}
          <div className="relative w-full h-[240px] md:h-[380px] xl:h-[500px] rounded-[16px] overflow-hidden">
            <Link
              href="/promotions"
              className="absolute left-4 top-4 z-10 inline-flex h-[36px] items-center gap-1 rounded-full border border-[#ead6a4]/70 bg-[#b89148]/90 px-4 font-dm-sans text-[13px] font-medium text-white shadow-[0_8px_22px_rgba(59,45,23,0.22)] backdrop-blur-md transition-colors hover:bg-[#a3803d]"
            >
              <ChevronLeft size={16} />
              Back
            </Link>
            <Image
              src={image ?? '/images/promo-detail-hero.jpg'}
              alt={promo.title}
              fill
              className="object-cover"
              sizes="(max-width: 1400px) 100vw, 1352px"
              priority
              unoptimized={!!image}
            />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gold-700 shrink-0" />
              <span className="font-dm-sans text-[18px] xl:text-[20px] text-gold-900/70">Orienda Hospital</span>
            </div>
            {expiry && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gold-700 shrink-0" />
                <span className="font-dm-sans text-[18px] xl:text-[20px] text-gold-900/70">Expires: {expiry}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="font-dm-sans font-semibold text-[26px] xl:text-[32px] text-neutral-800 leading-[1.8]">
            {promo.title}
          </h1>

          {/* Body */}
          {paragraphs.length > 0 && (
            <div className="flex flex-col gap-8">
              {paragraphs.map((para: string, i: number) => (
                <p key={i} className="font-dm-sans text-[16px] xl:text-[18px] text-neutral-800 leading-[1.8]">
                  {para}
                </p>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="flex justify-center mt-4">
            <Link
              href={`/promotions/${promo.slug}/purchase` as '/'}
              className="inline-flex items-center justify-center h-[64px] px-10 rounded-[12px] font-dm-sans text-[20px] text-white shadow-[0px_0px_12px_4px_rgba(184,145,72,0.15)] hover:opacity-90 transition-opacity"
              style={{ background: '#b89148' }}
            >
              Make Purchase
            </Link>
          </div>

        </div>

        {/* Explore More */}
        <div className="mt-20">
          <ExploreMoreCarousel items={relatedArticles} />
        </div>
      </div>
    </SiteLayout>
  )
}
