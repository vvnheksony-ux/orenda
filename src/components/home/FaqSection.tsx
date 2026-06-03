'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ChevronUp } from 'lucide-react'

export default function FaqSection() {
  const t = useTranslations('FaqSection')
  const [openIdx, setOpenIdx] = useState<number | null>(1)

  const FAQ_ITEMS = [
    { q: t('qAppointment'), a: t('aAppointment') },
    { q: t('qAppointment'), a: t('aAppointment') },
    { q: t('qAppointment'), a: t('aAppointment') },
    { q: t('qAppointment'), a: t('aAppointment') },
    { q: t('qAppointment'), a: t('aAppointment') },
  ]

  return (
    <section className="w-full py-[120px] flex justify-center bg-[#fbf7ee]">
      <div className="flex gap-[40px] items-center relative w-[1352px]">

        {/* Decorative anatomy illustration */}
        <div
          className="absolute pointer-events-none"
          style={{ left: 2, top: 68, width: 499, height: 628, opacity: 0.7, zIndex: 0 }}
        >
          <Image
            src="/images/faq-decor.png"
            alt=""
            fill
            className="object-contain object-top"
            sizes="499px"
          />
        </div>

        {/* Left glass panel — self-stretch to match accordion height */}
        <div
          className="relative self-stretch shrink-0 rounded-[24px] p-[24px] flex flex-col items-center justify-center"
          style={{ width: 521, background: 'rgba(255,255,255,0.2)', zIndex: 1 }}
        >
          <div className="flex flex-col gap-[12px] text-center">
            <h2 className="font-cormorant font-bold text-[56px] text-[#3b2d17] leading-none w-full">
              {t('title')}
            </h2>
            <p className="font-dm-sans text-[20px] text-[#594522] leading-none w-full">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Right accordion */}
        <div className="flex flex-col gap-[24px] flex-1 min-w-0" style={{ zIndex: 1 }}>
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIdx === i
            return (
              <button
                key={i}
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="bg-white w-full overflow-hidden rounded-[16px] p-[40px] flex flex-col items-end justify-center text-left"
                style={{ minHeight: 104, boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}
              >
                <div className="flex items-center justify-between w-full">
                  <p className="font-cormorant font-bold text-[24px] text-black leading-none">
                    {item.q}
                  </p>
                  <div
                    className="shrink-0 transition-transform duration-200 text-[#3b2d17]"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(90deg)' }}
                  >
                    <ChevronUp size={24} />
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden w-full"
                    >
                      <p className="font-dm-sans font-normal text-[16px] text-black leading-[1.5] pt-[24px] w-full">
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
