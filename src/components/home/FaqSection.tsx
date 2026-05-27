'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const ANS = 'Orienda International Hospital is committed to transparent and compassionate healthcare. Our focus on patient satisfaction and well-being, drives our continuous improvement in providing exceptional medical care.'

const FAQ_ITEMS = [
  { q: 'How to make an appointment?', a: ANS },
  { q: 'How to make an appointment?', a: ANS },
  { q: 'How to make an appointment?', a: ANS },
  { q: 'How to make an appointment?', a: ANS },
  { q: 'How to make an appointment?', a: ANS },
]

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section className="w-full py-[80px] px-[40px] xl:px-[46px] bg-[#fbf7ee] overflow-hidden">
      <div className="max-w-[1352px] mx-auto">
        <div className="relative">

          {/* Anatomical figure — absolute */}
          <div className="absolute left-[2px] top-0 w-[499px] h-[628px] opacity-70 pointer-events-none select-none z-0">
            <Image
              src="/images/faq-decor.png"
              alt=""
              fill
              className="object-contain"
              sizes="499px"
            />
          </div>

          {/* Left panel background — stretches with accordion */}
          <div className="absolute left-0 top-0 h-full w-[521px] z-10 bg-[rgba(255,255,255,0.2)] rounded-[24px]" />

          {/* Text — fixed position, never moves regardless of accordion height */}
          <div className="absolute left-0 top-[260px] z-20 flex flex-col gap-[12px] px-[24px]">
            <h2 className="font-cormorant font-bold text-[56px] text-gold-900 leading-none">
              FAQ
            </h2>
            <p className="font-dm-sans text-[20px] text-gold-800 leading-none">
              Learn more about us, Ask us what you want to know
            </p>
          </div>

          {/* Right — accordion, margin-left clears the left panel */}
          <div className="ml-[561px] flex flex-col gap-[24px]">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] cursor-pointer"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <div className="flex items-center justify-between px-[40px] py-[32px]">
                  <span className="font-cormorant font-bold text-[24px] text-black leading-none">
                    {item.q}
                  </span>
                  <ChevronRight
                    className={cn(
                      'w-[24px] h-[24px] text-gold-700 transition-transform duration-300 shrink-0 ml-4',
                      openIdx === i && 'rotate-90'
                    )}
                    strokeWidth={1.5}
                  />
                </div>

                <AnimatePresence>
                  {openIdx === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-[40px] pb-[40px] font-dm-sans text-[16px] text-black leading-[1.5]">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
