import Image from 'next/image'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import { MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

const RELATED_ARTICLES = [
  { title: 'Nine Natural Beauty Tips That Are Absolutely Free', image: '/images/promo-explore-1.jpg', slug: 'beauty-tips' },
  { title: 'Understanding Spinal Anatomy', image: '/images/promo-explore-2.jpg', slug: 'spinal-anatomy' },
  { title: 'Nine Natural Beauty Tips That Are Absolutely Free', image: '/images/promo-explore-1.jpg', slug: 'beauty-tips-2' },
  { title: '7 Amazing Kid Entrepreneurs who Will Make You Think', image: '/images/promo-explore-3.jpg', slug: 'kid-entrepreneurs' },
  { title: 'Nine Natural Beauty Tips That Are Absolutely Free', image: '/images/promo-explore-1.jpg', slug: 'beauty-tips-3' },
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

  const image = promo.image ?? null
  const paragraphs = String(promo.description || '')
    .split('\n')
    .map((s: string) => s.trim())
    .filter(Boolean)
  const expiry = formatExpiry(promo.validTo ?? null)

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: 'var(--background)' }}>
        <div className="content-shell flex flex-col gap-10">

          {/* Back */}
          <Link
            href="/promotions"
            className="inline-flex items-center gap-1 font-dm-sans text-[14px] text-gold-700 hover:text-gold-900 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Promotions
          </Link>

          {/* Hero image */}
          <div className="relative w-full h-[240px] md:h-[380px] xl:h-[500px] rounded-[16px] overflow-hidden">
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
        <div className="content-shell mt-20 flex flex-col gap-10 items-center">
          <div className="text-center flex flex-col gap-3">
            <h2 className="font-cormorant font-bold text-[36px] xl:text-[48px] text-gold-900 leading-none">
              Explore More
            </h2>
            <p className="font-dm-sans text-[18px] xl:text-[20px] text-gold-800">
              Article for health care tips
            </p>
          </div>

          <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="flex gap-10 pb-2" style={{ width: 'max-content' }}>
              {RELATED_ARTICLES.map((article, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] flex flex-col shrink-0 w-[300px]"
                >
                  <div className="relative h-[170px] overflow-hidden bg-[#f9f9f9]">
                    <Image src={article.image} alt={article.title} fill className="object-cover" sizes="300px" />
                  </div>
                  <div className="flex flex-col justify-between h-[200px] px-6 pt-8 pb-6">
                    <p className="font-dm-sans font-medium text-[16px] text-gold-900 leading-[1.5] line-clamp-3">
                      {article.title}
                    </p>
                    <Link
                      href={`/news/${article.slug}` as '/'}
                      className="self-end flex items-center gap-1 px-3 py-1.5 rounded-[12px] border border-gold-500 font-dm-sans text-[12px] text-gold-800 hover:bg-gold-50 transition-colors"
                    >
                      Read More <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
