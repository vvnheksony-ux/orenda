'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'
import { Link } from '@/i18n/routing'
import SiteLayout from '@/components/layout/SiteLayout'
import Reveal from '@/components/shared/Reveal'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import { ChevronRight, MapPin, Clock, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import PageState from '@/components/shared/PageState'
import { useBranch } from '@/lib/branch-context'
import { fetchJsonRetry } from '@/lib/fetch-retry'

interface Promo { id: string; title: string; slug: string; image: string | null; validTo: string | null; price?: string; originalPrice?: string; description?: string }
interface Package { id: string; slug: string; title: string; description: string; price: string; image: string | null }
type LocalizedHref = ComponentProps<typeof Link>['href']

const PACKAGE_FALLBACK_IMAGES = [
  '/images/promo-package.jpg',
  '/images/promo-card-1.jpg',
  '/images/promo-card-2.jpg',
]

function formatExpiry(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PromoCardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] shadow-[0_4px_16px_rgba(122,95,44,0.12)] flex flex-col shrink-0 w-[228px] sm:w-[248px] lg:w-[268px] animate-pulse">
      <div className="h-[135px] sm:h-[150px] lg:h-[160px] rounded-t-[12px] bg-[#ede8de]" />
      <div className="flex flex-col gap-1.5 px-4 pt-5 pb-4">
        <div className="h-2.5 w-20 rounded-full bg-[#e5dfd4]" />
        <div className="h-4 w-2/3 rounded-full bg-[#e5dfd4]" />
        <div className="h-3 w-full rounded-full bg-[#e5dfd4]" />
        <div className="h-3 w-3/4 rounded-full bg-[#e5dfd4]" />
        <div className="self-end h-8 w-28 rounded-full bg-[#e5dfd4]" />
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
  const t = useTranslations('Promotions')
  const { selectedBranch } = useBranch()
  const promoLocation = selectedBranch?.address || 'Orienda Hospital'
  const [promos, setPromos] = useState<Promo[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loadingPromos, setLoadingPromos] = useState(true)
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [promosError, setPromosError] = useState('')
  const [packagesError, setPackagesError] = useState('')

  useEffect(() => {
    let active = true
    fetchJsonRetry<any>(`/api/promotions?locale=${locale}&limit=20`)
      .then(d => {
        if (!active) return
        setPromos(d.docs || d || [])
        setPromosError('')
      })
      .catch((err: unknown) => {
        if (!active) return
        setPromos([])
        setPromosError(err instanceof Error ? err.message : 'We could not load promotions right now.')
      })
      .finally(() => { if (active) setLoadingPromos(false) })
    fetchJsonRetry<any>(`/api/service-packages?locale=${locale}`)
      .then(d => {
        if (!active) return
        setPackages(d || [])
        setPackagesError('')
      })
      .catch((err: unknown) => {
        if (!active) return
        setPackages([])
        setPackagesError(err instanceof Error ? err.message : 'We could not load packages right now.')
      })
      .finally(() => { if (active) setLoadingPackages(false) })
    return () => {
      active = false
    }
  }, [locale])

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[90px] lg:pt-[150px] pb-[120px]" style={{ background: 'var(--background)' }}>
        <div className="content-shell flex flex-col gap-20">

          {/* ── Hero banner ── */}
          <PromotionStyleHero
            slides={[
              { src: '/images/promo-hero-3.jpg', alt: 'Orienda Hospital' },
              { src: '/images/promo-hero-2.jpg', alt: 'Orienda Hospital' },
            ]}
            title={t('heroTitle')}
            lines={[t('heroLine1'), t('heroLine2')]}
          />

          {/* ── Promotions (auto-scroll marquee) ── */}
          <div className="flex flex-col gap-10">
            <Reveal className="text-center flex flex-col gap-3">
              <h2 className="font-cormorant font-bold text-[36px] xl:text-[48px] text-gold-900 leading-none">{t('heading')}</h2>
              <p className="font-dm-sans text-[18px] xl:text-[20px] text-gold-800">{t('subtitle')}</p>
            </Reveal>
          </div>
        </div>

        {/* Full-width overflow-hidden scroll track */}
        <div className="marquee-bleed mt-10">
          <div className="marquee-track gap-4 sm:gap-6 lg:gap-8 animate-scroll-left hover:[animation-play-state:paused]">
            {loadingPromos
              ? Array.from({ length: 6 }).map((_, i) => <PromoCardSkeleton key={i} />)
              : promosError
              ? <div className="px-6 py-2"><PageState title="Promotions unavailable" message={promosError} /></div>
              : promos.length === 0
              ? <div className="px-6 py-2"><PageState title="No promotions available" message="There are no active promotions at the moment." /></div>
              : [...promos, ...promos].map((promo, i) => (
               <div key={i} className="bg-white rounded-[12px] shadow-[0_4px_16px_rgba(122,95,44,0.12)] flex flex-col relative shrink-0 w-[228px] sm:w-[248px] lg:w-[268px]">

                 {/* Full-bleed image, only the top corners rounded to match the card */}
                 <div className="relative">
                   <div className="relative h-[135px] sm:h-[150px] lg:h-[160px] rounded-t-[12px] overflow-hidden bg-[#f0ebe0]">
                     {promo.image
                       ? <Image src={promo.image} alt={promo.title} fill className="object-cover" sizes="268px" unoptimized />
                       : <div className="w-full h-full bg-[#f0ebe0]" />
                     }
                   </div>
                   {promo.price && (
                     <div className="absolute bottom-3 right-3 flex items-baseline gap-1.5 rounded-full bg-white px-3.5 py-1.5 shadow-[0_6px_18px_rgba(122,95,44,0.20)]">
                       <span className="font-dm-sans font-bold text-[15px] sm:text-[17px] text-[#a07d2c] leading-none">{promo.price}</span>
                       {promo.originalPrice && (
                         <span className="font-dm-sans text-[11px] sm:text-[12px] text-neutral-400 line-through leading-none">{promo.originalPrice}</span>
                       )}
                     </div>
                   )}
                 </div>

                 {/* Body */}
                 <div className="flex flex-col gap-1.5 px-4 pt-4 pb-4">
                   <div className="flex items-center gap-1">
                     <MapPin size={12} className="text-neutral-400 shrink-0" />
                     <span className="font-dm-sans text-[11px] text-neutral-500 line-clamp-1">{promoLocation}</span>
                   </div>
                   <h3 className="font-dm-sans font-bold text-[16px] sm:text-[18px] text-neutral-800 leading-tight line-clamp-1">{promo.title}</h3>
                   {promo.description && (
                     <p className="font-dm-sans text-[12px] sm:text-[12.5px] text-neutral-500 leading-snug line-clamp-2 min-h-[34px]">{promo.description}</p>
                   )}
                   {promo.validTo && (
                     <div className="flex items-center gap-1">
                       <Clock size={12} className="text-neutral-400 shrink-0" />
                       <span className="font-dm-sans text-[11px] text-neutral-500">{t('expires')} {formatExpiry(promo.validTo)}</span>
                     </div>
                   )}
                   <Link href={`/promotions/${promo.slug}/purchase` as LocalizedHref}
                      className="mt-1 self-end inline-flex items-center gap-1.5 rounded-full border border-gold-500 px-4 py-2 font-dm-sans text-[12px] text-gold-800 hover:bg-gold-50 transition-colors">
                      {t('makePurchase')} <ArrowRight size={14} />
                    </Link>
                 </div>
              </div>
            ))
            }
          </div>
        </div>

        <div className="content-shell flex flex-col gap-20 mt-10">

          {/* ── Packages ── */}
          <div className="flex flex-col gap-10">
            <Reveal className="text-center flex flex-col gap-3">
              <h2 className="font-cormorant font-bold text-[36px] xl:text-[48px] text-gold-900 leading-none">{t('packagesHeading')}</h2>
              <p className="font-dm-sans text-[18px] xl:text-[20px] text-gold-800">{t('packagesSubtitle')}</p>
            </Reveal>

            <div className="flex flex-col gap-6">
              {loadingPackages
                ? Array.from({ length: 3 }).map((_, i) => <PackageRowSkeleton key={i} />)
                : packagesError
                ? <PageState title={t('packagesUnavailable')} message={packagesError} />
                : packages.length === 0
                ? <PageState title={t('noPackages')} message={t('noPackagesMsg')} />
                : packages.map((pkg, pkgIdx) => (
                <Link key={pkg.title} href={`/promotions/packages/${pkg.slug}` as LocalizedHref} className="bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_16px_rgba(122,95,44,0.08)] flex flex-col md:flex-row h-auto md:h-[217px] relative hover:shadow-[0px_4px_24px_rgba(122,95,44,0.16)] transition-shadow">

                  {/* Image */}
                  <div className="relative shrink-0 w-full md:w-[353px] h-[200px] md:h-full overflow-hidden">
                    <Image src={pkg.image || PACKAGE_FALLBACK_IMAGES[pkgIdx % PACKAGE_FALLBACK_IMAGES.length]} alt={pkg.title} fill className="object-cover" sizes="353px" unoptimized />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 items-center justify-between px-5 md:px-6 py-5 md:py-7 gap-4">
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gold-700 shrink-0" />
                        <span className="font-dm-sans text-[14px] text-gold-900/70">Orienda Hospital</span>
                      </div>
                      <p className="font-dm-sans font-bold text-[16px] md:text-[18px] text-neutral-black leading-[1.5]">{pkg.title}</p>
                      {pkg.description && <p className="font-dm-sans text-[14px] md:text-[16px] text-neutral-black leading-[1.5] hidden md:block">{pkg.description}</p>}
                      {pkg.price && (
                        <span className="mt-1 inline-flex w-fit items-center px-5 py-2 rounded-full border-[0.5px] border-gold-500 bg-gold-50 font-dm-sans font-bold text-[16px] text-gold-500 leading-none">{pkg.price}</span>
                      )}
                    </div>
                    <ChevronRight size={24} className="shrink-0 text-gold-700" />
                  </div>
                </Link>
              ))
              }
            </div>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
