'use client'

import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'

interface Testimonial {
  id: string
  name?: string
  author?: string
  role?: string
  stars?: number
  text?: string
  content?: string
}

export default function TestimonialsCarousel() {
  const locale = useLocale()
  const [items, setItems] = useState<Testimonial[]>([])

  useEffect(() => {
    fetch(`/api/testimonials?locale=${locale}`)
      .then(r => r.json())
      .then(d => { if (d.docs?.length) setItems(d.docs) })
      .catch(() => {})
  }, [locale])

  if (!items.length) return null

  const doubled = [...items, ...items]

  return (
    <div className="marquee-bleed">
      <div className="marquee-track gap-[32px] animate-scroll-left">
        {doubled.map((t, i) => {
          const name = t.name ?? t.author ?? ''
          const role = t.role ?? ''
          const text = t.text ?? t.content ?? ''
          const stars = t.stars ?? 5
          return (
            <div
              key={i}
              className="bg-white flex flex-col items-start rounded-[16px] shrink-0 w-[434px]"
              style={{ boxShadow: '0px 4px 8px rgba(122,95,44,0.12)' }}
            >
              <div className="flex flex-col h-[194px] items-start justify-center overflow-hidden p-[24px] w-full">
                <div className="flex flex-col gap-[20px] items-start justify-center w-full">
                  <div className="flex flex-col gap-[12px] w-full">
                    <div className="flex flex-col gap-[4px]">
                      <p className="font-dm-sans text-[16px] text-[#3b2d17] capitalize leading-normal">{name}</p>
                      <p className="font-dm-sans text-[14px] text-[#3b2d17] opacity-80 capitalize leading-normal">{role}</p>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: stars }).map((_, s) => (
                        <Star key={s} size={32} fill="#FFCC00" color="#FFCC00" strokeWidth={0} />
                      ))}
                    </div>
                  </div>
                  <p className="font-dm-sans text-[12px] text-[#7a5f2c] opacity-80 leading-normal capitalize">
                    {text}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
