'use client'

import type { ComponentProps, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import SideHeroCarousel from '@/components/shared/SideHeroCarousel'
import { DEFAULT_SHARED_HERO_SLIDES } from '@/components/shared/defaultHeroSlides'

type HeroSlide = {
  src: string
  alt?: string
  title?: string
  lines?: [string, string]
  cta?: ReactNode
}

type PromotionStyleHeroProps = {
  imageSrc?: string
  imageAlt?: string
  overlaySrc?: string
  slides?: HeroSlide[]
  title: string
  lines: [string, string]
  ctaLabel?: string
  ctaHref?: ComponentProps<typeof Link>['href']
  cta?: ReactNode
}

export default function PromotionStyleHero({
  title,
  lines,
  ctaLabel,
  ctaHref = '/about',
  cta,
}: PromotionStyleHeroProps) {
  const t = useTranslations('Common')
  const label = ctaLabel ?? t('learnMore')
  const defaultCta = cta ?? (
    <Link href={ctaHref} className="inline-flex min-h-[34px] items-center gap-2 rounded-[10px] border-[1.5px] border-[#b89148] px-3 py-2 font-dm-sans text-[11px] text-[#5c4924] transition-all duration-200 hover:bg-[#b89148] hover:text-[#fffaf0] sm:min-h-[46px] sm:rounded-xl sm:px-5 sm:py-3 sm:text-[15px] lg:h-12 lg:min-h-0 lg:px-5 lg:py-3.5 lg:text-lg lg:text-[#713f12] lg:hover:text-[#fffaf0]">
      <span>{label}</span>
      <ArrowRight className="size-4 lg:size-5" />
    </Link>
  )

  const heroSlides = DEFAULT_SHARED_HERO_SLIDES.map(slide => ({
    ...slide,
    title,
    lines,
    cta: defaultCta,
  }))

  return (
    <SideHeroCarousel slides={heroSlides} />
  )
}
