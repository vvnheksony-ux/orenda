'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'

const SPECIALTIES = [
  {
    name: 'Obstetric',
    image: '/images/specialty-obstetric.png',
    stats: [
      { value: '25+', label: 'Doctors' },
      { value: '150+', label: 'Staff' },
      { value: '24/7', label: 'Service' },
    ],
  },
  {
    name: 'Gynecology',
    image: '/images/specialty-gynecology.png',
    stats: [
      { value: '18+', label: 'Doctors' },
      { value: '100+', label: 'Staff' },
      { value: '24/7', label: 'Service' },
    ],
  },
  {
    name: 'Neuro Surgery',
    image: '/images/specialty-neuro.png',
    stats: [
      { value: '12+', label: 'Surgeons' },
      { value: '80+', label: 'Staff' },
      { value: '98%', label: 'Success' },
    ],
  },
]

const SPECIALTY_CARDS = [
  { name: 'Obstetric',      image: '/images/specialty-obstetric.png' },
  { name: 'Gynecology',     image: '/images/specialty-gynecology.png' },
  { name: 'Imaging Center', image: '/images/specialty-imaging.png' },
  { name: 'Neuro Surgery',  image: '/images/specialty-neuro.png' },
]

export default function CentersSection() {
  const [statsIdx, setStatsIdx] = useState(0)
  const [displayIdx, setDisplayIdx] = useState(0)
  const [direction, setDirection] = useState(1)

  const goUp = () => {
    setDirection(-1)
    setStatsIdx((i) => {
      const next = (i - 1 + SPECIALTIES.length) % SPECIALTIES.length
      setTimeout(() => setDisplayIdx(next), 400)
      return next
    })
  }

  const goDown = () => {
    setDirection(1)
    setStatsIdx((i) => {
      const next = (i + 1) % SPECIALTIES.length
      setTimeout(() => setDisplayIdx(next), 400)
      return next
    })
  }

  const variants = {
    enter: (d: number) => ({ y: d > 0 ? 60 : -60, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (d: number) => ({ y: d > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <section className="w-full px-[40px] xl:px-[46px] py-[80px]">
      <div className="flex flex-col gap-[40px] items-center">

        {/* Header */}
        <div className="flex flex-col gap-[16px] items-center w-full">
          <h2 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none text-center">
            Centered Of Excellences
          </h2>
          <p className="font-dm-sans text-[20px] text-gold-800 text-center">
            Choose an option below to quickly find the service you need
          </p>
        </div>

        {/* 3-column layout */}
        <div className="flex gap-[52px] items-center justify-center max-w-[1352px] mx-auto w-full">

          {/* Stats column + nav */}
          <div className="flex flex-col gap-[40px] items-center shrink-0">
            <button
              onClick={goUp}
              className="w-[56px] h-[56px] flex items-center justify-center rounded-full hover:bg-gold-100 transition-colors cursor-pointer"
              aria-label="Previous specialty"
            >
              <ChevronUp className="w-12 h-12 text-gold-700" strokeWidth={1.5} />
            </button>

            <div className="flex flex-col gap-[24px] items-center relative" style={{ minHeight: 460 }}>
              <AnimatePresence mode="popLayout" custom={direction}>
                {SPECIALTIES[statsIdx].stats.map((s) => (
                  <motion.div
                    key={`${statsIdx}-${s.label}`}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="w-[130px] h-[130px] rounded-[65px] flex flex-col items-center justify-center gap-[12px] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.20)] shrink-0"
                    style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                  >
                    <span className="font-cormorant font-bold text-[30px] text-gold-900 leading-none">
                      {s.value}
                    </span>
                    <span className="font-dm-sans text-[14px] text-gold-700 text-center">
                      {s.label}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={goDown}
              className="w-[56px] h-[56px] flex items-center justify-center rounded-full hover:bg-gold-100 transition-colors cursor-pointer"
              aria-label="Next specialty"
            >
              <ChevronDown className="w-12 h-12 text-gold-700" strokeWidth={1.5} />
            </button>
          </div>

          {/* Main specialty display */}
          <div className="flex flex-col gap-[40px] items-center shrink-0 relative" style={{ minHeight: 500 }}>
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={displayIdx}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col gap-[40px] items-center"
              >
                <div style={{ perspective: '600px' }}>
                  <motion.div
                    className="relative w-[450px] h-[450px]"
                    style={{ rotateX: -12 }}
                    animate={{ rotateY: [0, 360] }}
                    transition={{
                      rotateY: { duration: 12, repeat: Infinity, ease: 'linear' },
                    }}
                  >
                    <Image
                      src={SPECIALTIES[displayIdx].image}
                      alt={SPECIALTIES[displayIdx].name}
                      fill
                      className="object-contain object-center"
                      sizes="450px"
                    />
                  </motion.div>
                </div>
                <p className="font-cormorant font-bold text-[32px] text-gold-900 capitalize tracking-wide leading-none">
                  {SPECIALTIES[displayIdx].name}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Specialty cards 2×2 grid */}
          <div className="grid grid-cols-2 gap-[20px] flex-1 h-[674px]">
            {SPECIALTY_CARDS.map((card) => (
              <button
                key={card.name}
                className="bg-gold-50/15 rounded-[12px] flex flex-col items-center justify-center gap-[16px] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.20)] hover:bg-gold-50/25 transition-colors overflow-hidden"
              >
                <div className="relative w-[190px] h-[190px]">
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="190px"
                  />
                </div>
                <span className="font-cormorant font-bold text-[32px] text-gold-900 capitalize leading-none">
                  {card.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
