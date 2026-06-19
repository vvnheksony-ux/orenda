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
      <div className="flex flex-col items-stretch gap-5 sm:gap-6 lg:flex-row lg:gap-10 xl:gap-12">
        <div className="relative h-[240px] w-full shrink-0 overflow-hidden rounded-[20px] bg-[#f4efe5] sm:h-[320px] lg:h-[472px] lg:w-[42%] xl:w-[41%]">
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

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 px-0.5 py-1 sm:gap-4 sm:px-1 lg:gap-7 lg:pr-4 xl:pr-8">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ead6a4] bg-[#fbf7ee] px-3 py-1.5 font-dm-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#8d6f38] sm:text-[12px]">
              <span>Featured Story</span>
              {hasMultipleSlides && <span className="text-[#b89148]">{String(activeIndex + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}</span>}
            </div>
          </div>

          <h1 className="max-w-[12ch] font-cormorant text-[28px] font-bold leading-[0.95] text-[#3b2d17] sm:text-[40px] lg:text-[52px] xl:text-[56px]">
            {activeSlide.title}
          </h1>

          <div className="max-w-[34rem] flex flex-col gap-2 font-dm-sans text-[14px] font-light leading-[1.55] text-[#594522] sm:gap-3 sm:text-[16px] lg:gap-4 lg:text-[22px] xl:text-[24px]">
            <p>{activeSlide.lines[0]}</p>
            <p>{activeSlide.lines[1]}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 sm:gap-4 lg:gap-5">
            {activeSlide.cta}

            {hasMultipleSlides && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={showPrev}
                  className="flex size-10 items-center justify-center rounded-full border border-[#c7a35b] bg-[#fffaf0] text-[#7a5f2c] transition-all hover:-translate-y-0.5 hover:bg-[#f7ecd4] sm:size-11 lg:size-16"
                >
                  <ChevronLeft className="size-4 sm:size-5 lg:size-7" />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={showNext}
                  className="flex size-10 items-center justify-center rounded-full border border-[#c7a35b] bg-[#fffaf0] text-[#7a5f2c] transition-all hover:-translate-y-0.5 hover:bg-[#f7ecd4] sm:size-11 lg:size-16"
                >
                  <ChevronRight className="size-4 sm:size-5 lg:size-7" />
                </button>
                <div className="ml-1 flex items-center gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={`${slide.src}-dot-${index}`}
                      type="button"
                      aria-label={`Go to slide ${index + 1}`}
                      onClick={() => setActiveIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-[#b89148]' : 'w-2.5 bg-[#decba4] hover:bg-[#cdb37b]'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
