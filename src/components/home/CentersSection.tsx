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
      { value: '99%', label: 'Success' },
      { value: '20k', label: 'Surgeries' },
      { value: '100%', label: 'Satisfactions' },
    ],
  },
  {
    name: 'Gynecology',
    image: '/images/specialty-gynecology.png',
    stats: [
      { value: '99%', label: 'Success' },
      { value: '20k', label: 'Surgeries' },
      { value: '100%', label: 'Satisfactions' },
    ],
  },
  {
    name: 'Neuro Surgery',
    image: '/images/specialty-neuro-2.png',
    stats: [
      { value: '99%', label: 'Success' },
      { value: '20k', label: 'Surgeries' },
      { value: '100%', label: 'Satisfactions' },
    ],
  },
  {
    name: 'Imaging Center',
    image: '/images/specialty-imaging.png',
    stats: [
      { value: '99%', label: 'Success' },
      { value: '20k', label: 'Surgeries' },
      { value: '100%', label: 'Satisfactions' },
    ],
  },
  {
    name: 'Pediatric',
    image: '/images/specialty-pediatric.png',
    stats: [
      { value: '99%', label: 'Success' },
      { value: '20k', label: 'Surgeries' },
      { value: '100%', label: 'Satisfactions' },
    ],
  },
]

export default function CentersSection() {
  const [activeIdx, setActiveIdx] = useState(2) // Default to Neuro Surgery

  const goUp = () => {
    setActiveIdx((i) => (i - 1 + SPECIALTIES.length) % SPECIALTIES.length)
  }

  const goDown = () => {
    setActiveIdx((i) => (i + 1) % SPECIALTIES.length)
  }

  // The 4 other specialties to show in the right-side grid
  const otherSpecialties = SPECIALTIES.map((spec, i) => ({ ...spec, originalIndex: i }))
    .filter((_, i) => i !== activeIdx)

  const activeSpecialty = SPECIALTIES[activeIdx]

  return (
    <section className="w-full bg-[#FAF6F0] px-[40px] xl:px-[80px] py-[120px] lg:py-[160px]">
      <div className="flex flex-col gap-[80px] items-center max-w-[1800px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col gap-[20px] items-center w-full">
          <h2 className="font-cormorant font-bold text-[48px] lg:text-[64px] xl:text-[72px] text-[#2C2520] leading-none text-center">
            Centered Of Excellences
          </h2>
          <p className="font-dm-sans text-[20px] lg:text-[24px] xl:text-[26px] text-[#70655E] text-center max-w-3xl">
            Choose an option below to quickly find the service you need
          </p>
        </div>

        {/* 3-column layout */}
        <div className="flex flex-col lg:flex-row gap-[40px] lg:gap-[60px] xl:gap-[100px] items-center lg:items-stretch justify-center w-full">

          {/* Left: Stats column */}
          <div className="flex flex-col gap-[40px] justify-center items-center shrink-0 lg:py-[40px]">
            <button
              onClick={goUp}
              className="hidden lg:flex items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer"
              aria-label="Previous specialty"
            >
              <ChevronUp className="w-12 h-12 xl:w-14 xl:h-14 text-[#A2834E]" strokeWidth={1.5} />
            </button>

            <div className="flex flex-row lg:flex-col gap-[30px] xl:gap-[40px] justify-center items-center">
              <AnimatePresence mode="popLayout">
                {activeSpecialty.stats.map((s, idx) => (
                  <motion.div
                    key={`${activeIdx}-${idx}`}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="w-[120px] h-[120px] lg:w-[160px] lg:h-[160px] xl:w-[200px] xl:h-[200px] rounded-full flex flex-col items-center justify-center gap-1 xl:gap-2 shadow-[0_12px_40px_rgba(184,145,72,0.12)] bg-white border border-white/60 shrink-0"
                  >
                    <span className="font-cormorant font-bold text-[32px] lg:text-[48px] xl:text-[56px] text-[#2C2520] leading-none">
                      {s.value}
                    </span>
                    <span className="font-dm-sans text-[12px] lg:text-[16px] xl:text-[18px] text-[#70655E] text-center">
                      {s.label}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={goDown}
              className="hidden lg:flex items-center justify-center hover:translate-y-1 transition-transform cursor-pointer"
              aria-label="Next specialty"
            >
              <ChevronDown className="w-12 h-12 xl:w-14 xl:h-14 text-[#A2834E]" strokeWidth={1.5} />
            </button>
          </div>

          {/* Middle: Main specialty display */}
          <div className="flex flex-col items-center justify-center shrink-0 w-full lg:w-[600px] xl:w-[750px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center w-full relative"
              >
                <div className="relative w-[380px] h-[380px] lg:w-[600px] lg:h-[600px] xl:w-[750px] xl:h-[750px] flex items-center justify-center">
                  {/* Subtle radial glow behind the 3D asset */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.9)_0%,_transparent_65%)] scale-125 z-0" />
                  <Image
                    src={activeSpecialty.image}
                    alt={activeSpecialty.name}
                    fill
                    className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)] relative z-10"
                    sizes="(max-width: 1024px) 380px, (max-width: 1280px) 600px, 750px"
                    priority
                  />
                </div>
                <h3 className="font-cormorant font-medium text-[36px] lg:text-[56px] xl:text-[64px] text-[#2C2520] capitalize text-center mt-[-40px] relative z-20">
                  {activeSpecialty.name}
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Specialty cards 2x2 grid */}
          <div className="grid grid-cols-2 gap-[20px] lg:gap-[40px] xl:gap-[48px] flex-1 max-w-[700px] xl:max-w-[850px] place-content-center">
            {otherSpecialties.map((card) => (
              <button
                key={card.name}
                onClick={() => setActiveIdx(card.originalIndex)}
                className="bg-white rounded-[32px] xl:rounded-[40px] flex flex-col items-center justify-center gap-[24px] xl:gap-[36px] shadow-[0_20px_50px_rgba(184,145,72,0.06)] hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(184,145,72,0.12)] transition-all duration-300 overflow-hidden group border border-white p-6 aspect-square"
              >
                <div className="relative w-[100px] h-[100px] lg:w-[150px] lg:h-[150px] xl:w-[200px] xl:h-[200px] transition-transform duration-500 group-hover:scale-110">
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100px, (max-width: 1280px) 150px, 200px"
                  />
                </div>
                <span className="font-cormorant font-medium text-[20px] lg:text-[28px] xl:text-[32px] text-[#2C2520] capitalize leading-none group-hover:text-[#A2834E] transition-colors text-center">
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
