'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/routing'

export type ExploreMoreItem = {
  title: string
  image: string | null
  href: ComponentProps<typeof Link>['href']
  meta?: string | null
}

type ExploreMoreCarouselProps = {
  title?: string
  subtitle?: string
  items: ExploreMoreItem[]
  ctaLabel?: string
}

export default function ExploreMoreCarousel({
  title = 'Explore More',
  subtitle = 'Article for health care tips',
  items,
  ctaLabel = 'Read More',
}: ExploreMoreCarouselProps) {
  const [paused, setPaused] = useState(false)

  if (items.length === 0) return null

  // Repeat enough copies that each looping half is wider than any viewport, so the
  // marquee loops seamlessly with no empty gap / visible reset even with few items.
  const copies = Math.max(2, Math.ceil(12 / items.length))
  const half = Array.from({ length: copies }).flatMap(() => items)
  const loopItems = [...half, ...half]

  return (
    <section className="flex w-full flex-col gap-10 bg-transparent">
      <div className="text-center flex flex-col items-center gap-3">
        <h2 className="font-cormorant font-bold text-[36px] xl:text-[48px] text-gold-900 leading-none">
          {title}
        </h2>
        <p className="font-dm-sans text-[18px] xl:text-[20px] text-gold-800">
          {subtitle}
        </p>
      </div>

      <div className="marquee-bleed">
        <div
          className="marquee-track gap-7 sm:gap-9 lg:gap-12 will-change-transform animate-scroll-left"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
        >
          {loopItems.map((item, index) => (
            <Link
              key={`${String(item.href)}-${index}`}
              href={item.href}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="flex h-[260px] w-[190px] shrink-0 flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_rgba(122,95,44,0.08)] transition-shadow hover:shadow-[0_6px_18px_rgba(122,95,44,0.12)] sm:h-[300px] sm:w-[225px] lg:h-[340px] lg:w-[260px]"
            >
              <div className="relative h-[108px] shrink-0 overflow-hidden bg-[#f9f9f9] sm:h-[128px] lg:h-[150px]">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-cover" sizes="260px" unoptimized />
                ) : (
                  <div className="h-full w-full bg-[#f0ebe0]" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between px-4 pb-4 pt-5 sm:px-5 sm:pb-5">
                <div className="flex flex-col gap-2">
                  {item.meta && (
                    <p className="font-dm-sans text-[10px] text-gold-700/70 sm:text-[11px]">
                      {item.meta}
                    </p>
                  )}
                  <p className="font-dm-sans text-[12px] font-medium leading-[1.45] text-gold-900 line-clamp-3 sm:text-[14px] lg:text-[15px]">
                    {item.title}
                  </p>
                </div>
                <span className="self-end inline-flex h-[28px] items-center gap-1 rounded-[12px] border border-gold-500 px-3 font-dm-sans text-[10px] text-gold-800 transition-colors hover:bg-gold-50 sm:h-[32px] sm:px-3.5 sm:text-[11px]">
                  {ctaLabel} <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
