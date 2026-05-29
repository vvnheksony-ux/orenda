'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function CentersSection() {
  const t = useTranslations('CentersSection')
  const [displayIdx, setDisplayIdx] = useState(2) // Default to Neuro Surgery
  const [direction, setDirection] = useState(1)

  const SPECIALTIES = [
    {
      name: t('obstetric'),
      image: '/images/specialty-obstetric.png',
      stats: [
        { value: '99%', label: t('success') },
        { value: '20k', label: t('surgeries') },
        { value: '100%', label: t('satisfactions') },
      ],
    },
    {
      name: t('gynecology'),
      image: '/images/specialty-gynecology.png',
      stats: [
        { value: '99%', label: t('success') },
        { value: '20k', label: t('surgeries') },
        { value: '100%', label: t('satisfactions') },
      ],
    },
    {
      name: t('neuro'),
      image: '/images/specialty-neuro-2.png',
      stats: [
        { value: '99%', label: t('success') },
        { value: '20k', label: t('surgeries') },
        { value: '100%', label: t('satisfactions') },
      ],
    },
    {
      name: t('imaging'),
      image: '/images/specialty-imaging.png',
      stats: [
        { value: '99%', label: t('success') },
        { value: '20k', label: t('surgeries') },
        { value: '100%', label: t('satisfactions') },
      ],
    },
    {
      name: t('pediatric'),
      image: '/images/specialty-pediatric.png',
      stats: [
        { value: '99%', label: t('success') },
        { value: '20k', label: t('surgeries') },
        { value: '100%', label: t('satisfactions') },
      ],
    },
  ]

  const SPECIALTY_CARDS = [
    { name: t('obstetric'), image: '/images/specialty-obstetric.png' },
    { name: t('gynecology'), image: '/images/specialty-gynecology.png' },
    { name: t('pediatric'), image: '/images/specialty-pediatric.png' },
    { name: t('imaging'), image: '/images/specialty-imaging.png' },
  ]

  const goUp = () => {
    setDirection(-1)
    setDisplayIdx((i) => (i - 1 + SPECIALTIES.length) % SPECIALTIES.length)
  }

  const goDown = () => {
    setDirection(1)
    setDisplayIdx((i) => (i + 1) % SPECIALTIES.length)
  }

  const variants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      y: dir < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.9,
    }),
  }

  return (
    <section className="w-full bg-gold-50 px-[40px] xl:px-[80px] py-[120px] lg:py-[160px]">
      <div className="flex flex-col gap-[80px] items-center max-w-[1512px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col gap-[16px] items-center w-full mb-[20px]">
          <h2 className="font-cormorant font-bold text-[36px] xl:text-[44px] text-[#3B2D17] leading-[1.2] text-center">
            {t('title')}
          </h2>
          <p className="font-dm-sans font-normal text-[15px] xl:text-[16px] text-[#7A5F2C] text-center max-w-2xl leading-[1.6]">
            {t('subtitle')}
          </p>
        </div>

        {/* 3-column layout */}
        <div className="flex gap-[40px] xl:gap-[80px] items-center justify-center w-full max-w-[1400px]">

          {/* Left: Stats column */}
          <div className="flex flex-col gap-[32px] items-center shrink-0 w-[140px]">
            <button
              onClick={goUp}
              className="w-[48px] h-[48px] flex items-center justify-center rounded-full hover:bg-gold-50 transition-colors cursor-pointer"
              aria-label="Previous specialty"
            >
              <ChevronUp className="w-8 h-8 text-[#a98f69]" strokeWidth={1} />
            </button>

            <div className="flex flex-col gap-[32px] items-center justify-center h-[420px] relative w-[110px]">
              <AnimatePresence mode="popLayout" custom={direction}>
                {SPECIALTIES[displayIdx].stats.map((s) => (
                  <motion.div
                    key={`${displayIdx}-${s.label}`}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="w-[100px] h-[100px] rounded-full bg-white flex flex-col items-center justify-center gap-[4px] shadow-[0_8px_24px_rgba(107,90,69,0.08)] border border-[#f0eadd] shrink-0"
                  >
                    <span className="font-cormorant font-bold text-[24px] text-[#3B2D17] leading-none">
                      {s.value}
                    </span>
                    <span className="font-dm-sans font-normal text-[12px] text-[#7A5F2C] text-center leading-none px-2 capitalize">
                      {s.label}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={goDown}
              className="w-[48px] h-[48px] flex items-center justify-center rounded-full hover:bg-gold-50 transition-colors cursor-pointer"
              aria-label="Next specialty"
            >
              <ChevronDown className="w-8 h-8 text-[#a98f69]" strokeWidth={1} />
            </button>
          </div>

          {/* Middle: Main specialty display */}
          <div className="flex flex-col gap-[24px] items-center shrink-0 relative" style={{ minHeight: 500 }}>
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={displayIdx}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col gap-[24px] items-center"
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
                <p className="font-cormorant font-bold text-[32px] text-[#3B2D17] capitalize leading-none">
                  {SPECIALTIES[displayIdx].name}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Specialty cards 2×2 grid */}
          <div className="grid grid-cols-2 gap-[24px] xl:gap-[32px] w-[500px] xl:w-[600px] shrink-0">
            {SPECIALTY_CARDS.map((card, i) => (
              <button
                key={i}
                className="bg-[#F9F7F4] aspect-square rounded-[24px] flex flex-col items-center justify-center gap-[20px] shadow-[0_8px_30px_rgba(107,90,69,0.08)] hover:shadow-[0_12px_40px_rgba(107,90,69,0.15)] transition-all duration-300"
              >
                {/* White circle behind the image */}
                <div className="w-[100px] h-[100px] xl:w-[120px] xl:h-[120px] bg-white rounded-full flex items-center justify-center shadow-sm relative">
                  <div className="relative w-[60px] h-[60px] xl:w-[75px] xl:h-[75px]">
                    <Image
                      src={card.image}
                      alt={card.name}
                      fill
                      className="object-contain"
                      sizes="75px"
                    />
                  </div>
                </div>
                <span className="font-cormorant font-bold text-[32px] text-[#3B2D17] capitalize leading-none text-center px-4">
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
