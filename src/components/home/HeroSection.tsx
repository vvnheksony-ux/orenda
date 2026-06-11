'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Send, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/i18n/routing'

const UNION_IMG = '/images/Union.svg'

function dispatchAskAI(message: string) {
  window.dispatchEvent(new CustomEvent('orienda:ask-ai', { detail: { message } }))
}

export default function HeroSection() {
  const t = useTranslations('HeroSection')
  const [query, setQuery] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleSubmit = (message: string) => {
    if (!message.trim()) return
    dispatchAskAI(message.trim())
    setQuery('')
    setHasSubmitted(true)
  }

  return (
    <section className="relative w-full bg-[#dac4a8] z-[10] h-[440px] sm:h-[90vh] sm:min-h-[600px] lg:min-h-[750px] sm:max-h-[1000px]">

      {/* Hero video background */}
      <video
        src="/videos/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Welcome text */}
      <div
        className="absolute flex flex-col gap-[20px] not-italic text-gold-900"
        style={{ left: 'clamp(16px, 2.6vw, 40px)', top: 'clamp(100px, 18vh, 250px)', width: 'clamp(180px, 40vw, 595px)' }}
      >
        <p className="text-[24px] md:text-[36px] xl:text-[48px] leading-normal" style={{ fontFamily: 'var(--font-script)' }}>
          {t('welcome')}
        </p>
        <p className="font-cormorant font-bold text-[18px] md:text-[28px] xl:text-[36px] leading-none">
          {t('hospital')}
        </p>
      </div>

      {/* Rating card — hidden on mobile */}
      <div
        className="hidden sm:flex absolute flex-col rounded-[20px] px-[16px] py-[12px] lg:px-[32px] lg:py-[24px] gap-[12px] bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(107,90,69,0.12)] z-10"
        style={{
          left: 'clamp(16px, 2.6vw, 40px)',
          bottom: 'clamp(90px, 12vw, 110px)',
          width: 'clamp(200px, 20vw, 300px)',
        }}
      >
        <div className="flex flex-col gap-[6px]">
          <div className="flex flex-col gap-[2px]">
            <p className="font-dm-sans text-[16px] font-medium text-[#2c241b] capitalize leading-normal">
              {t('testimonialName')}
            </p>
            <p className="font-dm-sans text-[14px] text-[#6b5a45] capitalize leading-normal">
              {t('testimonialRole')}
            </p>
          </div>
          <div className="flex items-center gap-[2px]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-[18px] h-[18px]" style={{ fill: '#FFCC00', color: '#FFCC00', strokeWidth: 0 }} />
            ))}
          </div>
        </div>
        <p className="font-dm-sans text-[12px] text-[#8c7454] capitalize leading-normal overflow-hidden text-ellipsis whitespace-nowrap pt-1">
          {t('testimonialQuote')}
        </p>
      </div>

      {/* Ask AI form (Always Centered) */}
      <div 
        className="absolute z-[30]"
        style={{
          left: '50%',
          bottom: 0,
          transform: 'translate(-50%, 50%)',
          width: 'min(92vw, clamp(340px, 48vw, 720px))',
          height: 'clamp(80px, 8.5vw, 130px)',
        }}
      >
        <AnimatePresence>
          {!hasSubmitted && (
            <motion.form
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(query)
              }}
              className="w-full h-full flex items-center justify-between rounded-[200px]"
              style={{
                background: 'rgba(251,247,238,1)',
                boxShadow: '0px 4px 12px rgba(89,69,34,0.18), 0 0 0 22px rgba(251,247,238,1)',
                paddingLeft: 'clamp(20px, 3.5vw, 52px)',
                paddingRight: 'clamp(14px, 2vw, 28px)',
                paddingTop: 'clamp(14px, 1.8vw, 26px)',
                paddingBottom: 'clamp(14px, 1.8vw, 26px)',
              }}
            >
              <input
                type="text"
                placeholder={t('askAi')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none font-dm-sans text-gold-900 placeholder-gold-800 placeholder:opacity-50 leading-none min-w-0"
                style={{ fontSize: 'clamp(14px, 1.4vw, 22px)' }}
              />
              <button
                type="submit"
                className="flex items-center justify-center bg-white rounded-full shrink-0 hover:bg-gold-50 transition-colors cursor-pointer shadow-[0px_2px_8px_rgba(89,69,34,0.12)]"
                style={{ width: 'clamp(44px, 5.5vw, 76px)', height: 'clamp(44px, 5.5vw, 76px)' }}
              >
                <Send className="w-[24px] h-[24px] text-gold-700" strokeWidth={1.5} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* 360° Room Tour Badge (Bottom Right) */}
      <Link
        href="/360-tour"
        className="absolute z-20 cursor-pointer hover:opacity-90 transition-opacity overflow-visible right-3 bottom-[88px] sm:right-[60px] sm:bottom-7"
        style={{ width: 'clamp(118px, 13vw, 184px)', height: 'clamp(58px, 6.4vw, 90px)', filter: 'drop-shadow(0px 0px 5px rgba(184,145,72,0.25))' }}
      >
        {/* Union background */}
        <img src="/images/Union.svg" alt="" className="absolute inset-0 w-full h-full pointer-events-none" style={{ objectFit: 'fill' }} />
        {/* Content */}
        <div className="relative flex flex-col items-center justify-center gap-[3px] w-full h-full" style={{ paddingBottom: 4 }}>
          <div className="flex flex-col items-center gap-[3px]">
            {/* 360° */}
            <p className="font-cormorant font-bold text-white leading-none">
              <span style={{ fontSize: 'clamp(22px, 2.4vw, 34px)' }}>360</span><span style={{ fontSize: 'clamp(13px, 1.4vw, 20px)' }}>°</span>
            </p>
            {/* Oval rotation arrow */}
            <svg viewBox="0 0 134.754 14.4971" width="80" height="8" fill="none" className="sm:w-[108px] sm:h-[11px]">
              <path fillRule="evenodd" clipRule="evenodd" d="M67.377 2.87128C98.3864 2.87128 123.525 5.23722 123.525 8.15576C123.525 11.0743 98.3864 13.4402 67.377 13.4402C36.3676 13.4402 11.2295 11.0743 11.2295 8.15576C11.2295 7.36791 13.0577 6.6217 16.3311 5.95143C17.6262 5.68625 16.392 5.37247 13.5745 5.25058C10.7569 5.12868 7.42297 5.24484 6.12788 5.51002C2.19192 6.31595 0 7.21248 0 8.15576C0 11.658 30.1657 14.4971 67.377 14.4971C104.588 14.4971 134.754 11.658 134.754 8.15576C134.754 4.65352 104.588 1.81439 67.377 1.81439V2.87128Z" fill="white" />
            </svg>
          </div>
          {/* Room Tour label */}
          <span className="font-dm-sans font-semibold text-[#fbf7ee] leading-none" style={{ fontSize: 'clamp(9px, 1vw, 14px)' }}>Room Tour</span>
        </div>
      </Link>

    </section>
  )
}
