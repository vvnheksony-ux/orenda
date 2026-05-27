'use client'

import { useState } from 'react'
import { Search, Star } from 'lucide-react'

const UNION_IMG = '/images/union-decor.svg'

const TESTIMONIAL = {
  name: 'Dr. Marcus Lee',
  role: 'Pediatric Specialist',
  quote: "Timmy Demonstrates Impressive Ada...",
}

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')

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
          Welcome To
        </p>
        <p className="font-cormorant font-bold text-[36px] leading-none">
          Orienda International Hospital
        </p>
      </div>

      {/* Rating card */}
      <div
        className="absolute rounded-[12px] px-[40px] py-[24px] flex flex-col gap-[12px]"
        style={{
          left: 40,
          bottom: 'clamp(80px, 15vh, 150px)',
          width: 302,
          background: 'rgba(255,255,255,0.82)',
          boxShadow: '0px 4px 20px 0px rgba(89,69,34,0.30)',
        }}
      >
        <div className="flex flex-col gap-[4px]">
          <div className="flex flex-col gap-[4px]">
            <p className="font-dm-sans text-[16px] text-gold-900 capitalize leading-normal">
              {TESTIMONIAL.name}
            </p>
            <p className="font-dm-sans text-[14px] text-gold-900 opacity-80 capitalize leading-normal">
              {TESTIMONIAL.role}
            </p>
          </div>
          <div className="flex items-center gap-[2px]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-[20px] h-[20px]" style={{ fill: '#FFCC00', color: '#FFCC00' }} />
            ))}
          </div>
        </div>
        <p className="font-dm-sans text-[12px] text-gold-700 opacity-80 capitalize leading-normal overflow-hidden text-ellipsis whitespace-nowrap">
          {TESTIMONIAL.quote}
        </p>
      </div>

      {/* Ask AI pill — center straddles hero/clinic boundary */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (query.trim()) {
            setResponse(`You asked: "${query}" — I'll connect you with the right information.`)
          }
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
          placeholder="Ask AI"
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

      {response && (
        <div
          className="absolute z-[20] font-dm-sans text-[15px] text-gold-900 text-center"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: -120,
            width: 600,
            background: 'rgba(249,249,249,0.92)',
            borderRadius: 12,
            padding: '12px 20px',
          }}
        >
          {response}
        </div>
      )}

      {/* Union + 360° — right-anchored */}
      <div
        className="absolute pointer-events-none"
        style={{ right: 80, bottom: 'clamp(40px, 10vh, 100px)', width: 120, height: 90 }}
      >
        <div className="absolute" style={{ inset: '0 -3.33% -8.89% -3.33%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={UNION_IMG} alt="" className="block w-full h-full" />
        </div>
        <div
          className="absolute -translate-y-1/2 flex flex-col text-white whitespace-nowrap pointer-events-none"
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
