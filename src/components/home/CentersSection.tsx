'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

const SPECIALTIES = [
  {
    key: 'neuro',
    name: 'Neuro Surgery',
    thumb: '/images/figma-centers-1.png',
    display: '/images/figma-centers-main.jpg',
  },
  {
    key: 'obstetric',
    name: 'Obstetric',
    thumb: '/images/figma-centers-2.png',
    display: '/images/specialty-obstetric.png',
  },
  {
    key: 'gynecology',
    name: 'Gynecology',
    thumb: '/images/figma-centers-3.png',
    display: '/images/specialty-gynecology.png',
  },
  {
    key: 'imaging',
    name: 'Imaging Center',
    thumb: '/images/figma-centers-4.png',
    display: '/images/specialty-imaging.png',
  },
]

export default function CentersSection() {
  const t = useTranslations('CentersSection')
  const [idx, setIdx] = useState(0)

  const prev = () => setIdx(i => (i - 1 + SPECIALTIES.length) % SPECIALTIES.length)
  const next = () => setIdx(i => (i + 1) % SPECIALTIES.length)
  const active = SPECIALTIES[idx]

  return (
    <section className="w-full py-[120px] flex flex-col gap-[40px] items-center" style={{ backgroundColor: '#fbf7ee' }}>

      {/* Header */}
      <div className="flex flex-col gap-[16px] items-center">
        <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none text-center">
          {t('title')}
        </h2>
        <p className="font-dm-sans text-[20px] text-[#594522] leading-none text-center">
          {t('subtitle')}
        </p>
      </div>

      {/* 3-column layout — exact Figma: gap-[52px], w-[1352px] */}
      <div className="flex gap-[52px] items-center w-[1352px] max-w-full px-[80px] xl:px-0">

        {/* LEFT: chevron up + 4 thumbs + chevron down */}
        <div className="flex flex-col gap-[40px] items-center shrink-0">
          <button onClick={prev} aria-label="Previous" className="w-[40px] h-[40px] flex items-center justify-center text-[#3b2d17] hover:opacity-70 transition-opacity">
            <ChevronUp className="w-[40px] h-[40px]" strokeWidth={1.5} />
          </button>

          <div className="flex flex-col gap-[24px] items-center">
            {SPECIALTIES.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setIdx(i)}
                className="relative w-[120px] h-[120px] shrink-0 transition-opacity"
                style={{ opacity: i === idx ? 1 : 0.4 }}
                aria-label={s.name}
              >
                <Image src={s.thumb} alt={s.name} fill className="object-cover" sizes="120px" />
              </button>
            ))}
          </div>

          <button onClick={next} aria-label="Next" className="w-[40px] h-[40px] flex items-center justify-center text-[#3b2d17] hover:opacity-70 transition-opacity">
            <ChevronDown className="w-[40px] h-[40px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* CENTER: large specialty illustration + name */}
        <div className="flex flex-col gap-[40px] items-center justify-center shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative w-[450px] h-[450px] shrink-0"
            >
              <Image src={active.display} alt={active.name} fill className="object-cover" sizes="450px" />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={active.key + '-name'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none capitalize whitespace-nowrap"
            >
              {active.name}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* RIGHT: medical photo (top) + 2 stat cards (bottom) */}
        <div className="flex flex-col gap-[10px] flex-1 h-[674px]">

          {/* Medical photo */}
          <div className="flex-1 relative rounded-[12px] overflow-hidden shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)]" style={{ background: 'rgba(245,236,212,0.15)' }}>
            <Image
              src="/images/figma-why-doctor.jpg"
              alt="Medical specialists"
              fill
              className="object-cover"
              sizes="(max-width: 1400px) 50vw, 700px"
            />
          </div>

          {/* 2 stat cards */}
          <div className="flex gap-[10px] flex-1">
            {[
              { value: '99%', label: 'Success' },
              { value: '200,000', label: 'Success' },
            ].map(stat => (
              <div
                key={stat.value}
                className="flex-1 flex flex-col gap-[12px] items-center justify-center rounded-[12px] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)]"
                style={{ background: 'rgba(245,236,212,0.15)' }}
              >
                <p className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none whitespace-nowrap">
                  {stat.value}
                </p>
                <p className="font-dm-sans text-[32px] text-[#7a5f2c] text-center leading-none">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
