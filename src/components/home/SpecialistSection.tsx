'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'

const DOCTORS = [
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-1.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-2.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-3.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-4.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-2.jpg' },
]

// Figma: 5-card fan — center active (337.5×450), ±1 (300×400 20% overlay), ±2 (262.5×350 50% overlay)
function sizeByDiff(diff: number) {
  const abs = Math.abs(diff)
  if (abs === 0) return { w: 337.5, h: 450, photo: 164, photoTop: 34.5, overlay: 0,   name: 27, spec: 18, btnH: 36, btnW: 163, btnFs: 13.5, radius: 16 }
  if (abs === 1) return { w: 300,   h: 400, photo: 146, photoTop: 34.5, overlay: 0.2, name: 24, spec: 16, btnH: 32, btnW: 145, btnFs: 12,   radius: 16 }
  return               { w: 262.5, h: 350, photo: 128, photoTop: 30,   overlay: 0.5, name: 21, spec: 14, btnH: 28, btnW: 127, btnFs: 9.5,  radius: 14 }
}

function DocCard({ doc, index, activeIdx, setIdx }: {
  doc: typeof DOCTORS[0]
  index: number
  activeIdx: number
  setIdx: (i: number) => void
}) {
  const diff = index - activeIdx
  const s = sizeByDiff(diff)

  const x     = useMotionValue(diff * 380)
  const w     = useMotionValue(s.w)
  const h     = useMotionValue(s.h)

  useEffect(() => {
    animate(x, diff * 380,  { type: 'spring', stiffness: 300, damping: 30 })
    animate(w, s.w,          { type: 'spring', stiffness: 300, damping: 30 })
    animate(h, s.h,          { type: 'spring', stiffness: 300, damping: 30 })
  }, [activeIdx, diff, s.w, s.h, x, w, h])

  return (
    <motion.div
      style={{ x, width: w, height: h, zIndex: 5 - Math.abs(diff), borderRadius: s.radius }}
      className="absolute bg-white overflow-hidden cursor-pointer shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)]"
      onClick={() => setIdx(index)}
    >
      {/* Gold gradient header */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '51.5%',
          opacity: 0.64,
          backgroundImage: 'linear-gradient(133.36deg,rgba(234,214,164,0.6) 0%,rgba(206,175,112,0.827) 25%,rgba(184,145,72,0.8) 49.52%,rgba(210,181,120,0.792) 75.96%,rgba(234,214,164,0.6) 100%)',
        }}
      />

      {/* Circular photo */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bg-gold-50 rounded-full overflow-hidden shadow-[0px_4px_30px_12px_rgba(184,145,72,0.2)]"
        style={{ width: s.photo, height: s.photo, top: s.photoTop }}
      >
        <Image src={doc.image} alt={doc.name} fill className="object-cover object-top" sizes={`${s.photo}px`} />
      </div>

      {/* Info */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center justify-between px-[10px] pb-[24px]"
        style={{ top: '53%' }}
      >
        <div className="flex flex-col gap-[16px] items-center text-center overflow-hidden">
          <p className="font-cormorant text-gold-900 leading-none capitalize" style={{ fontSize: s.name }}>
            {doc.name}
          </p>
          <p className="font-dm-sans text-gold-900 leading-none" style={{ fontSize: s.spec }}>
            {doc.specialty}
          </p>
        </div>
        <div
          className="bg-gold-500 flex items-center justify-center overflow-hidden shadow-[0px_2px_6px_6px_rgba(0,0,0,0.05)] mt-[16px]"
          style={{ width: s.btnW, height: s.btnH, borderRadius: 12 }}
        >
          <p className="font-dm-sans text-gold-50 text-center" style={{ fontSize: s.btnFs }}>
            View Profile
          </p>
        </div>
      </div>

      {/* Inactive overlay */}
      {s.overlay > 0 && (
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${s.overlay})` }} />
      )}
    </motion.div>
  )
}

export default function SpecialistSection() {
  const [activeIdx, setActiveIdx] = useState(2)

  return (
    <section className="w-full bg-gold-50 py-[80px] overflow-hidden px-[40px] xl:px-[46px]">
      <div className="max-w-[1352px] mx-auto flex flex-col gap-[40px] items-center">

        <div className="flex flex-col gap-[12px] items-start w-full text-center">
          <h2 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none w-full">
            Meet Our Specialist
          </h2>
          <p className="font-dm-sans text-[20px] text-gold-800 leading-none w-full">
            A selected team of experts committed to your health
          </p>
        </div>

        <div className="relative w-full flex items-center justify-center h-[500px]">
          {DOCTORS.map((doc, i) => (
            <DocCard key={i} doc={doc} index={i} activeIdx={activeIdx} setIdx={setActiveIdx} />
          ))}
        </div>

        <button className="px-[40px] py-[14px] rounded-full border border-gold-500 text-gold-900 font-dm-sans text-[18px] hover:bg-gold-200/30 transition-colors cursor-pointer">
          See More
        </button>

      </div>
    </section>
  )
}
