'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const FAQ_ITEMS = [
  {
    q: 'How to make an appointment?',
    a: 'Orienda International Hospital is committed to transparent and compassionate healthcare. Our focus on patient satisfaction and well-being, drives our continuous improvement in providing exceptional medical care.',
  },
  {
    q: 'What are the hospital visiting hours?',
    a: 'Orienda International Hospital is committed to transparent and compassionate healthcare. Our focus on patient satisfaction and well-being, drives our continuous improvement in providing exceptional medical care.',
  },
  {
    q: 'Do you offer emergency services?',
    a: 'Orienda International Hospital is committed to transparent and compassionate healthcare. Our focus on patient satisfaction and well-being, drives our continuous improvement in providing exceptional medical care.',
  },
  {
    q: 'Are international doctors available?',
    a: 'Orienda International Hospital is committed to transparent and compassionate healthcare. Our focus on patient satisfaction and well-being, drives our continuous improvement in providing exceptional medical care.',
  },
  {
    q: 'What insurance plans do you accept?',
    a: 'Orienda International Hospital is committed to transparent and compassionate healthcare. Our focus on patient satisfaction and well-being, drives our continuous improvement in providing exceptional medical care.',
  },
]

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section className="w-full py-[80px] px-[40px] xl:px-[46px] bg-[#fbf7ee] overflow-hidden">
      <div className="max-w-[1352px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-[60px] xl:gap-[80px] items-start">

          {/* Left column — heading + Ask AI + spine decor */}
          <div className="relative flex flex-col gap-[32px]">
            <div className="flex flex-col gap-[12px]">
              <h2 className="font-cormorant font-bold text-[48px] xl:text-[56px] text-gold-900 leading-none">
                FAQ &amp; AI
              </h2>
              <p className="font-dm-sans text-[18px] text-gold-800 leading-relaxed">
                Learn more about us, Ask us what you want to know
              </p>
            </div>

            {/* Ask AI search bar */}
            <div className="flex items-center bg-white rounded-full shadow-[0px_4px_16px_rgba(122,95,44,0.10)] px-[24px] py-[16px] gap-[12px] max-w-[420px]">
              <input
                type="text"
                placeholder="Ask AI"
                className="flex-1 font-dm-sans text-[16px] text-gold-900 bg-transparent outline-none placeholder:text-gold-400"
              />
              <div className="w-[40px] h-[40px] rounded-full bg-[#fbf7ee] flex items-center justify-center shrink-0">
                <Search size={18} className="text-gold-700" strokeWidth={1.5} />
              </div>
            </div>

            {/* Spine decoration image */}
            <div className="absolute -bottom-[40px] -left-[60px] w-[180px] h-[320px] pointer-events-none select-none">
              <Image
                src="/images/faq-decor.png"
                alt=""
                fill
                className="object-contain object-bottom"
                sizes="180px"
              />
            </div>
          </div>

          {/* Right column — FAQ accordion */}
          <div className="flex flex-col gap-[16px]">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-[12px] overflow-hidden shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] border border-[rgba(234,214,164,0.60)]"
              >
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center justify-between px-[32px] py-[22px] text-left hover:bg-gold-50/20 transition-colors cursor-pointer"
                >
                  <span className="font-dm-sans font-medium text-[18px] text-gold-900">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-gold-500 transition-transform duration-300 shrink-0 ml-4',
                      openIdx === i && 'rotate-180'
                    )}
                    strokeWidth={1.5}
                  />
                </button>

                <AnimatePresence>
                  {openIdx === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-[32px] pb-[28px] font-dm-sans text-[15px] text-gold-800 leading-[1.6]">
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
