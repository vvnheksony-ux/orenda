'use client'

import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DOCTORS = [
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-1.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-2.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-3.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-4.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-2.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-3.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-1.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-4.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist', image: '/images/doctor-2.jpg' },
]

const n = DOCTORS.length

function wrapIdx(i: number) { return ((i % n) + n) % n }

// Shortest circular distance from activeIdx to docIndex
function wrappedDiff(rawDiff: number) {
  let d = rawDiff % n
  if (d > n / 2)  d -= n
  if (d < -n / 2) d += n
  return d
}

function sizeByDiff(diff: number) {
  const abs = Math.abs(diff)
  if (abs === 0) return { w: 405, h: 540, photo: 197, photoTop: 41, overlay: 0,   name: 32, spec: 22, btnH: 43, btnW: 196, btnFs: 16, radius: 19 }
  if (abs === 1) return { w: 360, h: 480, photo: 175, photoTop: 41, overlay: 0.2, name: 29, spec: 19, btnH: 38, btnW: 174, btnFs: 14, radius: 19 }
  if (abs === 2) return { w: 315, h: 420, photo: 154, photoTop: 36, overlay: 0.5, name: 25, spec: 17, btnH: 34, btnW: 152, btnFs: 11, radius: 17 }
  return               { w: 270, h: 360, photo: 131, photoTop: 31, overlay: 0.7, name: 21, spec: 15, btnH: 29, btnW: 130, btnFs: 9,  radius: 15 }
}

function getTargetX(diff: number, gap: number = 32) {
  const d = Math.abs(diff)
  const sign = Math.sign(diff)
  if (d === 0) return 0
  
  const w0 = 405
  const w1 = 360
  const w2 = 315
  const w3 = 270
  
  if (d === 1) return sign * ((w0 / 2) + gap + (w1 / 2))
  if (d === 2) return sign * ((w0 / 2) + gap + w1 + gap + (w2 / 2))
  if (d === 3) return sign * ((w0 / 2) + gap + w1 + gap + w2 + gap + (w3 / 2))
  
  return sign * 2000 // far off-screen
}

function DocCard({ docIndex, activeIdx, setIdx }: {
  docIndex: number
  activeIdx: number
  setIdx: (i: number) => void
}) {
  const doc = DOCTORS[docIndex]
  const diff = wrappedDiff(docIndex - activeIdx)
  const s = sizeByDiff(diff)

  const x = useMotionValue(getTargetX(diff))
  const w = useMotionValue(s.w)
  const h = useMotionValue(s.h)

  const prevDiff = useRef(diff)

  useEffect(() => {
    const targetX = getTargetX(diff)
    // A wrap happens when the shortest circular distance jumps across the boundary (e.g. 4 to -4)
    // In our n=9 array, this is a jump of magnitude >= 5.
    const isWrap = Math.abs(diff - prevDiff.current) > 4

    if (isWrap) {
      x.stop()
      w.stop()
      h.stop()
      x.set(targetX)
      w.set(s.w)
      h.set(s.h)
    } else {
      animate(x, targetX, { type: 'spring', stiffness: 300, damping: 30 })
      animate(w, s.w, { type: 'spring', stiffness: 300, damping: 30 })
      animate(h, s.h, { type: 'spring', stiffness: 300, damping: 30 })
    }
    
    prevDiff.current = diff
  }, [activeIdx, diff, s.w, s.h, x, w, h])

  return (
    <motion.div
      style={{ x, width: w, height: h, zIndex: 5 - Math.abs(diff), borderRadius: s.radius }}
      className="absolute bg-white overflow-hidden cursor-pointer shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)]"
      onClick={() => setIdx(docIndex)}
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

  const prev = () => setActiveIdx(i => wrapIdx(i - 1))
  const next = () => setActiveIdx(i => wrapIdx(i + 1))

  return (
    <section className="w-full bg-gold-50 py-[120px] lg:py-[160px] overflow-hidden px-[40px] xl:px-[80px]">
      <div className="max-w-[1800px] mx-auto flex flex-col gap-[60px] items-center">

        <div className="flex flex-col gap-[20px] items-start w-full text-center">
          <h2 className="font-cormorant font-bold text-[48px] lg:text-[64px] xl:text-[72px] text-gold-900 leading-none w-full">
            Meet Our Specialist
          </h2>
          <p className="font-dm-sans text-[20px] lg:text-[24px] xl:text-[26px] text-gold-800 leading-none w-full">
            A selected team of experts committed to your health
          </p>
        </div>

        <div className="relative w-full flex items-center justify-center h-[600px]">

          {/* Prev arrow */}
          <button
            onClick={prev}
            className="absolute left-[10px] xl:left-[30px] z-30 w-[56px] h-[56px] rounded-full bg-white flex items-center justify-center hover:bg-gold-50 hover:scale-105 transition-all shadow-[0_8px_30px_rgba(184,145,72,0.3)] shrink-0 group"
            aria-label="Previous specialist"
          >
            <ChevronLeft className="text-gold-700 group-hover:text-gold-900 transition-colors mr-[2px]" size={28} strokeWidth={2} />
          </button>

          {DOCTORS.map((_, i) => (
            <DocCard key={i} docIndex={i} activeIdx={activeIdx} setIdx={setActiveIdx} />
          ))}

          {/* Next arrow */}
          <button
            onClick={next}
            className="absolute right-[10px] xl:right-[30px] z-30 w-[56px] h-[56px] rounded-full bg-white flex items-center justify-center hover:bg-gold-50 hover:scale-105 transition-all shadow-[0_8px_30px_rgba(184,145,72,0.3)] shrink-0 group"
            aria-label="Next specialist"
          >
            <ChevronRight className="text-gold-700 group-hover:text-gold-900 transition-colors ml-[2px]" size={28} strokeWidth={2} />
          </button>

        </div>

        <button className="px-[40px] py-[14px] rounded-full border border-gold-500 text-gold-900 font-dm-sans text-[18px] hover:bg-gold-200/30 transition-colors cursor-pointer">
          See More
        </button>

      </div>
    </section>
  )
}
