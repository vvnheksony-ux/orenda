'use client'

import Image from 'next/image'
import { Link } from '@/i18n/routing'
import SiteLayout from '@/components/layout/SiteLayout'
import { ChevronRight, ChevronLeft, MapPin, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'

interface Promo { id: string; title: string; slug: string; image: string | null; validTo: string | null }
interface Package { id: string; slug: string; title: string; description: string; price: string; image: string | null }

function formatExpiry(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PromoCardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] flex flex-col h-[360px] shrink-0 w-[300px] mr-8 animate-pulse">
      <div className="h-[200px] shrink-0 bg-[#ede8de]" />
      <div className="flex flex-col flex-1 justify-between px-6 pt-3 pb-6 gap-2">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 rounded-full bg-[#e5dfd4]" />
          <div className="h-4 w-full rounded-full bg-[#e5dfd4]" />
          <div className="h-4 w-3/4 rounded-full bg-[#e5dfd4]" />
          <div className="h-3 w-28 rounded-full bg-[#e5dfd4]" />
        </div>
        <div className="self-end h-7 w-24 rounded-[12px] bg-[#e5dfd4]" />
      </div>
    </div>
  )
}

function PackageRowSkeleton() {
  return (
    <div className="bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_16px_rgba(122,95,44,0.08)] flex h-[140px] md:h-[217px] animate-pulse">
      <div className="shrink-0 w-[180px] md:w-[353px] h-full bg-[#ede8de]" />
      <div className="flex flex-1 items-end justify-between px-5 md:px-6 py-8 md:py-9 gap-4">
        <div className="flex flex-col gap-2.5 w-full">
          <div className="h-3 w-24 rounded-full bg-[#e5dfd4]" />
          <div className="h-5 w-48 rounded-full bg-[#e5dfd4]" />
          <div className="h-4 w-full rounded-full bg-[#e5dfd4] hidden md:block" />
          <div className="h-4 w-3/4 rounded-full bg-[#e5dfd4] hidden md:block" />
        </div>
        <div className="shrink-0 size-6 rounded-full bg-[#e5dfd4]" />
      </div>
    </div>
  )
}

export default function PromotionsPage() {
  const locale = useLocale()
  const [promos, setPromos] = useState<Promo[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loadingPromos, setLoadingPromos] = useState(true)
  const [loadingPackages, setLoadingPackages] = useState(true)

  useEffect(() => {
    setLoadingPromos(true)
    setLoadingPackages(true)
    fetch(`/api/promotions?locale=${locale}&limit=20`)
      .then(r => r.json())
      .then(d => { if ((d.docs||d).length) setPromos(d.docs||d) })
      .catch(() => {})
      .finally(() => setLoadingPromos(false))
    fetch(`/api/packages?locale=${locale}`)
      .then(r => r.json())
      .then(d => { if (d.length) setPackages(d) })
      .catch(() => {})
      .finally(() => setLoadingPackages(false))
  }, [locale])

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: '#fbf7ee' }}>
        <div className="max-w-[1352px] mx-auto px-5 xl:px-0 flex flex-col gap-20">

          {/* ── Hero banner ── */}
          <div className="relative bg-white rounded-[16px] overflow-hidden h-[320px] md:h-[400px] xl:h-[472px] shadow-[0px_4px_16px_rgba(122,95,44,0.08)]">
            <div className="absolute right-3 top-3 bottom-3 w-[43%] rounded-[12px] overflow-hidden">
              <Image src="/images/promo-hero-3.jpg" alt="Orienda Hospital" fill className="object-cover" sizes="650px" priority />
              <div className="absolute inset-0 rounded-[12px] overflow-hidden">
                <Image src="/images/promo-hero-2.jpg" alt="" fill className="object-cover opacity-60 mix-blend-multiply" sizes="650px" />
              </div>
            </div>
            <button className="absolute left-3 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full hover:bg-gold-50 transition-colors z-10">
              <ChevronLeft size={24} className="text-gold-700" />
            </button>
            <button className="absolute right-[44%] top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full hover:bg-gold-50 transition-colors z-10">
              <ChevronRight size={24} className="text-gold-700" />
            </button>
            <div className="absolute left-[58px] top-1/2 -translate-y-1/2 flex flex-col gap-8 w-[min(618px,48%)]">
              <h1 className="font-cormorant font-bold text-[32px] md:text-[40px] xl:text-[48px] text-gold-900 leading-none">
                Orienda International Hospital
              </h1>
              <div className="font-dm-sans font-light text-[16px] xl:text-[24px] text-gold-800 flex flex-col gap-3 leading-normal">
                <p>We dedicated to providing safe and reliable medical services.</p>
                <p>Schedule and appointment to experience world-class healthcare.</p>
              </div>
              <Link href="/about" className="self-start flex items-center gap-1 px-5 py-3 rounded-[12px] border-[1.5px] border-gold-500 font-dm-sans text-[16px] xl:text-[18px] text-gold-800 hover:bg-gold-50 transition-colors">
                Learn More <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          {/* ── Promotions (auto-scroll marquee) ── */}
          <div className="flex flex-col gap-10">
            <div className="text-center flex flex-col gap-3">
              <h2 className="font-cormorant font-bold text-[36px] xl:text-[48px] text-gold-900 leading-none">Promotions</h2>
              <p className="font-dm-sans text-[18px] xl:text-[20px] text-gold-800">Exclusive Deals for You</p>
            </div>
          </div>
        </div>

        {/* Full-width overflow-hidden scroll track */}
        <div className="w-full overflow-hidden mt-0 py-4">
          <div className="flex animate-scroll-left" style={{ width: 'max-content' }}>
            {loadingPromos
              ? Array.from({ length: 6 }).map((_, i) => <PromoCardSkeleton key={i} />)
              : promos.length === 0
              ? <p className="font-dm-sans text-[16px] text-gold-800 px-8 py-6">No promotions available at this time.</p>
              : [...promos, ...promos].map((promo, i) => (
              <div key={i} className="bg-white rounded-[12px] overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] flex flex-col h-[360px] relative shrink-0 w-[300px] mr-8">
                <div className="relative h-[200px] shrink-0 overflow-hidden bg-[#f9f9f9]">
                  {promo.image
                    ? <Image src={promo.image} alt={promo.title} fill className="object-cover" sizes="300px" unoptimized />
                    : <div className="w-full h-full bg-[#f0ebe0]" />
                  }
                </div>
                <div className="flex flex-col flex-1 justify-between px-6 pt-3 pb-6 gap-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-gold-700 shrink-0" />
                      <span className="font-dm-sans text-[10px] text-gold-900/70">Orienda Hospital</span>
                    </div>
                    <p className="font-dm-sans font-medium text-[16px] text-gold-900 line-clamp-2">{promo.title}</p>
                    {promo.validTo && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="shrink-0" style={{ color: '#80776a' }} />
                        <span className="font-dm-sans text-[10px]" style={{ color: '#80776a' }}>Expires {formatExpiry(promo.validTo)}</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/promotions/${promo.slug}` as any}
                    className="self-end flex items-center gap-1 px-3 py-1.5 rounded-[12px] border border-gold-500 font-dm-sans text-[12px] text-gold-800 hover:bg-gold-50 transition-colors">
                    View Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))
            }
          </div>
        </div>

        <div className="max-w-[1352px] mx-auto px-5 xl:px-0 flex flex-col gap-20 mt-10">

          {/* ── Packages ── */}
          <div className="flex flex-col gap-10">
            <div className="text-center flex flex-col gap-3">
              <h2 className="font-cormorant font-bold text-[36px] xl:text-[48px] text-gold-900 leading-none">Packages</h2>
              <p className="font-dm-sans text-[18px] xl:text-[20px] text-gold-800">All available packages we provide.</p>
            </div>

            <div className="flex flex-col gap-6">
              {loadingPackages
                ? Array.from({ length: 3 }).map((_, i) => <PackageRowSkeleton key={i} />)
                : packages.length === 0
                ? <p className="font-dm-sans text-[16px] text-gold-800 py-6">No packages available at this time.</p>
                : packages.map((pkg, pkgIdx) => (
                <div key={pkg.title} className="bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_16px_rgba(122,95,44,0.08)] flex h-[140px] md:h-[217px] relative">

                  {/* Image */}
                  <div className="relative shrink-0 w-[180px] md:w-[353px] h-full overflow-hidden">
                    <Image src={pkg.image || `/images/clinics/health-tip-${(pkgIdx % 3) + 1}.jpg`} alt={pkg.title} fill className="object-cover" sizes="353px" unoptimized />
                    {/* Price badge */}
                    {pkg.price && (
                      <div className="absolute bottom-3 right-3 flex items-end px-4 py-2 rounded-[16px] border-[0.5px] border-gold-500 bg-gold-50">
                        <span className="font-dm-sans font-bold text-[18px] text-gold-500 leading-none">{pkg.price}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 items-end justify-between px-5 md:px-6 py-8 md:py-9 gap-4">
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gold-700 shrink-0" />
                        <span className="font-dm-sans text-[14px] text-gold-900/70">Orienda Hospital</span>
                      </div>
                      <p className="font-dm-sans font-bold text-[16px] md:text-[18px] text-neutral-black leading-[1.5]">{pkg.title}</p>
                      {pkg.description && <p className="font-dm-sans text-[14px] md:text-[16px] text-neutral-black leading-[1.5] hidden md:block">{pkg.description}</p>}
                    </div>
                    <ChevronRight size={24} className="shrink-0 text-gold-700" />
                  </div>
                </div>
              ))
              }
            </div>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
