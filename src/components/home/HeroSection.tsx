'use client'

import { useState } from 'react'
import { Search, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

const UNION_IMG = '/images/union-decor.svg'

function dispatchAskAI(message: string) {
  window.dispatchEvent(new CustomEvent('orienda:ask-ai', { detail: { message } }))
}

export default function HeroSection() {
  const t = useTranslations('HeroSection')
  const [query, setQuery] = useState('')

  const handleSubmit = (message: string) => {
    if (!message.trim()) return
    dispatchAskAI(message.trim())
    setQuery('')
  }

  return (
    <section className="relative w-full bg-[#dac4a8] z-[10] h-[90vh] min-h-[750px] max-h-[1000px]">

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
        style={{ left: 40, top: 'clamp(120px, 20vh, 250px)', width: 595 }}
      >
        <p className="text-[48px] leading-normal" style={{ fontFamily: 'var(--script-font)' }}>
          {t('welcome')}
        </p>
        <p className="font-cormorant font-bold text-[36px] leading-none">
          {t('hospital')}
        </p>
      </div>

      {/* Rating card */}
      <div
        className="absolute rounded-[20px] px-[32px] py-[24px] flex flex-col gap-[12px] bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(107,90,69,0.12)] z-10"
        style={{
          left: 40,
          bottom: 40,
          width: 300,
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

      {/* Ask AI pill — center straddles hero/clinic boundary */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(query)
        }}
        className="absolute flex items-center justify-between rounded-[200px] z-[30]"
        style={{
          left: '50%',
          transform: 'translate(-50%, 50%)',
          bottom: 0,
          width: 'clamp(300px, 49vw, 747px)',
          height: 'clamp(80px, 10.4vw, 160px)',
          background: 'rgba(251,247,238,1)',
          boxShadow: '0px 4px 12px rgba(89,69,34,0.18), 0 0 0 30px rgba(251,247,238,1)',
          paddingLeft: 'clamp(24px, 4.4vw, 68px)',
          paddingRight: 'clamp(12px, 2vw, 30px)',
          paddingTop: 'clamp(12px, 1.6vw, 24px)',
          paddingBottom: 'clamp(12px, 1.6vw, 24px)',
        }}
      >
        <input
          type="text"
          placeholder={t('askAi')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-dm-sans text-gold-900 placeholder-gold-800 placeholder:opacity-50 leading-none"
          style={{ fontSize: 'clamp(14px, 1.5vw, 24px)' }}
        />
        <button
          type="submit"
          className="flex items-center justify-center bg-white rounded-full shrink-0 hover:bg-gold-50 transition-colors cursor-pointer shadow-[0px_2px_8px_rgba(89,69,34,0.12)]"
          style={{ width: 'clamp(50px, 6.5vw, 100px)', height: 'clamp(50px, 6.5vw, 100px)' }}
        >
          <Search className="w-[24px] h-[24px] text-gold-700" strokeWidth={1.5} />
        </button>
      </form>

      {/* Union + 360° — right-anchored */}
      <div
        className="absolute pointer-events-none z-20"
        style={{ right: 40, bottom: 20, width: 120, height: 90 }}
      >
        <div className="absolute" style={{ inset: '0 -3.33% -8.89% -3.33%' }}>
          <div 
            className="w-full h-full bg-[#d3b482]/40 backdrop-blur-[12px]"
            style={{
              WebkitMaskImage: `url(${UNION_IMG})`,
              WebkitMaskSize: '100% 100%',
              maskImage: `url(${UNION_IMG})`,
              maskSize: '100% 100%',
            }}
          />
        </div>
        <div
          className="absolute -translate-y-1/2 flex flex-col text-white whitespace-nowrap pointer-events-none drop-shadow-md"
          style={{ left: 37, top: 55 }}
        >
          <p className="font-cormorant font-bold leading-none">
            <span className="text-[32px]">360</span>
            <sup className="text-[20px]">°</sup>
          </p>
        </div>
      </div>

    </section>
  )
}
