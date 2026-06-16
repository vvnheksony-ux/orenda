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
    <div className="w-full overflow-hidden rounded-[24px] bg-white p-4 shadow-[0px_4px_30px_12px_rgba(220,189,114,0.10)] sm:p-5 lg:rounded-[28px] lg:p-8 xl:p-9">
      <div className="flex items-stretch gap-3 sm:gap-5 lg:gap-10 xl:gap-12">
        <div className="relative h-[220px] w-[44%] shrink-0 overflow-hidden rounded-[20px] bg-[#f4efe5] sm:h-[300px] sm:w-[43%] lg:h-[472px] lg:w-[42%] xl:w-[41%]">
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
                sizes="(max-width: 1024px) 44vw, 42vw"
                className="object-cover object-center"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-0.5 py-1 sm:gap-4 sm:px-1 lg:gap-7 lg:pr-4 xl:pr-8">
          <h1 className="font-cormorant text-[18px] font-bold leading-[1.05] text-[#3b2d17] sm:text-[28px] lg:text-[52px] xl:text-[56px]">
            {activeSlide.title}
          </h1>

          <div className="flex flex-col gap-2 font-dm-sans text-[11px] font-light leading-[1.4] text-[#594522] sm:gap-3 sm:text-[16px] lg:gap-4 lg:text-[22px] xl:text-[24px]">
            <p>{activeSlide.lines[0]}</p>
            <p>{activeSlide.lines[1]}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:gap-4 lg:gap-5">
            {activeSlide.cta}

            {hasMultipleSlides && (
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={showPrev}
                  className="flex size-9 items-center justify-center rounded-full border border-[#b89148] text-[#7a5f2c] transition-colors hover:bg-[#fbf7ee] sm:size-11 lg:size-16"
                >
                  <ChevronLeft className="size-4 sm:size-5 lg:size-7" />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={showNext}
                  className="flex size-9 items-center justify-center rounded-full border border-[#b89148] text-[#7a5f2c] transition-colors hover:bg-[#fbf7ee] sm:size-11 lg:size-16"
                >
                  <ChevronRight className="size-4 sm:size-5 lg:size-7" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
