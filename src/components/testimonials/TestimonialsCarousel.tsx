'use client'

import { Star } from 'lucide-react'

const TESTIMONIALS = [
  { name: 'Timmy Klirk',      role: 'Patient',    stars: 5, text: 'I appreciate your expertise and guidance throughout this process. Your attention to detail and commitment to my case have been invaluable. Thank you for your hard work!' },
  { name: 'Dr. Emily Ross',   role: 'Physician',  stars: 5, text: "Timmy's progress has been remarkable, showing resilience and cooperation during each appointment. Looking forward to continued improvements." },
  { name: 'Nurse Amanda Lee', role: 'Nurse',      stars: 5, text: "Providing compassionate care has been rewarding. Timmy's positive attitude makes my job fulfilling and encourages the entire team." },
  { name: 'Michael Chen',     role: 'Therapist',  stars: 5, text: "Timmy's dedication to therapy sessions is impressive. His willingness to engage actively contributes significantly to his recovery journey." },
]

// Duplicate for seamless loop
const ITEMS = [...TESTIMONIALS, ...TESTIMONIALS]

export default function TestimonialsCarousel() {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-[32px] animate-scroll-left w-max">
        {ITEMS.map((t, i) => (
          <div
            key={i}
            className="bg-white flex flex-col items-start rounded-[16px] shrink-0 w-[434px]"
            style={{ boxShadow: '0px 4px 8px rgba(122,95,44,0.12)' }}
          >
            <div className="flex flex-col h-[194px] items-start justify-center overflow-hidden p-[24px] w-full">
              <div className="flex flex-col gap-[20px] items-start justify-center w-full">
                <div className="flex flex-col gap-[12px] w-full">
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-dm-sans text-[16px] text-[#3b2d17] capitalize leading-normal">{t.name}</p>
                    <p className="font-dm-sans text-[14px] text-[#3b2d17] opacity-80 capitalize leading-normal">{t.role}</p>
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} size={32} fill="#FFCC00" color="#FFCC00" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <p className="font-dm-sans text-[12px] text-[#7a5f2c] opacity-80 leading-normal capitalize">
                  {t.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
