import Image from 'next/image'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import { ChevronLeft, MapPin } from 'lucide-react'

interface PackageDetail {
  id: string
  slug: string
  title: string
  description: string
  price: string
  image: string | null
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const headerStore = await headers()

  // Fetch via the raw-pool API route (the working DB path on serverless).
  const forwardedProto = headerStore.get('x-forwarded-proto')
  const forwardedHost = headerStore.get('x-forwarded-host')
  const host = forwardedHost ?? headerStore.get('host')
  const base = host
    ? `${forwardedProto ?? 'https'}://${host}`
    : process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  let pkg: PackageDetail | null = null
  try {
    const res = await fetch(
      `${base}/api/packages?slug=${encodeURIComponent(slug)}&locale=${locale}`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const data = await res.json() as PackageDetail | null
      pkg = data?.id ? data : null
    }
  } catch {}

  if (!pkg) notFound()

  const image = pkg.image ?? null
  const paragraphs = String(pkg.description || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: '#fbf7ee' }}>
        <div className="content-shell flex flex-col gap-10">

          {/* Back */}
          <Link
            href="/promotions"
            className="inline-flex items-center gap-1 font-dm-sans text-[14px] text-gold-700 hover:text-gold-900 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Packages
          </Link>

          {/* Hero image */}
          <div className="relative w-full h-[240px] md:h-[380px] xl:h-[500px] rounded-[16px] overflow-hidden">
            <Image
              src={image ?? '/images/promo-detail-hero.jpg'}
              alt={pkg.title}
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
            {pkg.price && (
              <div className="flex items-end px-4 py-2 rounded-[16px] border-[0.5px] border-gold-500 bg-gold-50">
                <span className="font-dm-sans font-bold text-[18px] xl:text-[20px] text-gold-500 leading-none">{pkg.price}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="font-dm-sans font-semibold text-[26px] xl:text-[32px] text-neutral-800 leading-[1.8]">
            {pkg.title}
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
              href="/inquiry"
              className="inline-flex items-center justify-center h-[64px] px-10 rounded-[12px] font-dm-sans text-[20px] text-white shadow-[0px_0px_12px_4px_rgba(184,145,72,0.15)] hover:opacity-90 transition-opacity"
              style={{ background: '#b89148' }}
            >
              Send Inquiry
            </Link>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
