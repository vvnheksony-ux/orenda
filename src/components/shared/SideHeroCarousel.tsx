'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type SideHeroSlide = {
  src: string
  alt: string
  title: string
  lines: [string, string]
  cta: ReactNode
}

type SideHeroCarouselProps = {
  slides: SideHeroSlide[]
}

const AUTOPLAY_MS = 5000

export default function SideHeroCarousel({ slides }: SideHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const hasMultipleSlides = slides.length > 1
  const activeSlide = slides[activeIndex]

  useEffect(() => {
    if (!hasMultipleSlides) return

    const timer = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % slides.length)
    }, AUTOPLAY_MS)

    return () => window.clearInterval(timer)
  }, [hasMultipleSlides, slides.length])

  const showPrev = () => setActiveIndex(current => (current - 1 + slides.length) % slides.length)
  const showNext = () => setActiveIndex(current => (current + 1) % slides.length)

  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-2xl bg-white p-[10px] shadow-[0px_4px_30px_12px_rgba(220,189,114,0.10)]">
        <div className="flex flex-col items-stretch gap-[10px] lg:flex-row-reverse">
          {/* Image — nearly full-bleed (2px inset): right on desktop, top on mobile */}
          <div className="relative h-[220px] w-full shrink-0 overflow-hidden rounded-xl bg-[#f4efe5] sm:h-[300px] lg:h-auto lg:w-[50%]">
            {slides.map((slide, index) => (
              <div
                key={`${slide.src}-${index}`}
                className={`absolute inset-0 transition-opacity duration-500 ${index === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                aria-hidden={index !== activeIndex}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Text — left */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-5 px-6 py-8 sm:gap-7 sm:px-9 sm:py-10 lg:gap-10 lg:py-14 lg:pl-14 lg:pr-10">
            <h1 className="font-cormorant text-[28px] font-bold leading-[1.05] text-[#3b2d17] sm:text-[40px] lg:text-[48px] lg:leading-[48px]">
              {activeSlide.title}
            </h1>

            <div className="max-w-[38rem] flex flex-col gap-2 font-dm-sans text-[14px] font-light leading-[1.5] text-[#594522] sm:gap-3 sm:text-[16px] lg:text-[24px]">
              <p>{activeSlide.lines[0]}</p>
              <p>{activeSlide.lines[1]}</p>
            </div>

            <div className="pt-1">{activeSlide.cta}</div>
          </div>
        </div>
      </div>

      {/* Bare chevron arrows in the side gutters */}
      {hasMultipleSlides && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={showPrev}
            className="absolute left-1 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#9a7b3c] transition-colors hover:text-[#6e561f] md:-left-6 lg:-left-12 xl:-left-16"
          >
            <ChevronLeft className="size-6 lg:size-8" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={showNext}
            className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#9a7b3c] transition-colors hover:text-[#6e561f] md:-right-6 lg:-right-12 xl:-right-16"
          >
            <ChevronRight className="size-6 lg:size-8" strokeWidth={2.25} />
          </button>
        </>
      )}
    </div>
  )
}
