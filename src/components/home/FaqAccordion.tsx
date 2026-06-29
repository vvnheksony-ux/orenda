'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ChevronUp } from 'lucide-react'

type FaqItem = { q: string; a: string }

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const t = useTranslations('FaqSection')
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="faq" className="w-full bg-[var(--background)] scroll-mt-[120px]">
      <div className="page-shell flex flex-col md:flex-row gap-[40px] items-start relative">

        {/* Mobile-only: title + subtitle above accordion */}
        <div className="flex flex-col gap-[16px] items-center text-center w-full md:hidden">
          <h2 className="font-cormorant font-bold text-[36px] text-[#3b2d17] leading-none">
            {t('title')}
          </h2>
          <p className="font-dm-sans text-[18px] text-[#594522] leading-none max-w-[299px]">
            {t('subtitle')}
          </p>
        </div>

        {/* Left panel — anatomy image + glass overlay + FAQ text (desktop only) */}
        <div
          className="hidden md:block flex-1 rounded-[24px] relative overflow-hidden md:h-[640px]"
          style={{ zIndex: 1 }}
        >
          {/* Layer 1: Anatomy illustration — locked to top */}
          <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-0">
            <div className="relative" style={{ width: 490, height: 640, opacity: 0.7 }}>
              <Image src="/images/faq-decor.png" alt="" fill className="object-contain" sizes="490px" />
            </div>
          </div>

          {/* Layer 2: Frosted glass overlay */}
          <div
            className="absolute inset-0 z-10 border border-white/30 rounded-[24px]"
            style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
          />

          {/* Layer 3: FAQ text on top — locked with fixed top padding */}
          <div className="relative z-20 flex flex-col gap-[12px] text-center items-center pt-[80px] lg:pt-[220px] px-[24px]">
            <h2 className="font-cormorant font-bold text-[32px] lg:text-[56px] text-[#3b2d17] leading-none w-full">
              {t('title')}
            </h2>
            <p className="font-dm-sans text-[20px] text-[#594522] leading-none w-full">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Right accordion */}
        <div className="flex flex-col gap-[24px] flex-1 min-w-0 w-full" style={{ zIndex: 1 }}>
          {items.map((item, i) => {
            const isOpen = openIdx === i
            return (
              <button
                key={i}
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="bg-white w-full overflow-hidden rounded-[16px] p-[20px] sm:p-[24px] lg:p-[32px] flex flex-col items-start justify-start text-left focus:outline-none active:bg-white"
                style={{ boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}
              >
                {/* Question row */}
                <div className="flex items-center justify-between w-full">
                  <p className="font-cormorant font-bold text-[18px] sm:text-[22px] lg:text-[24px] text-[#3b2d17] leading-none">
                    {item.q}
                  </p>
                  {/* Figma: closed = rotate-90 (→), open = rotate-180 (↓) */}
                  <div
                    className="shrink-0 transition-transform duration-200 text-[#3b2d17]"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(90deg)' }}
                  >
                    <ChevronUp size={24} />
                  </div>
                </div>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden w-full"
                    >
                      <p className="font-dm-sans font-normal text-[16px] text-[#3b2d17] leading-[1.5] pt-[24px] w-full">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>

      </div>
    </section>
  )
}
