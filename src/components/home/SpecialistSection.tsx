'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'

const DOCTORS = [
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic And Trauma Specialist', image: '/images/doctor-1.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic And Trauma Specialist', image: '/images/doctor-2.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic And Trauma Specialist', image: '/images/doctor-3.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic And Trauma Specialist', image: '/images/doctor-4.jpg' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic And Trauma Specialist', image: '/images/doctor-2.jpg' },
]

function DocCard({ doc, index, activeIdx, setIdx }: { doc: typeof DOCTORS[0], index: number, activeIdx: number, setIdx: (i: number) => void }) {
  const diff = index - activeIdx
  const x = useMotionValue(diff * 400)
  const scale = useMotionValue(index === activeIdx ? 1 : 0.8)
  const opacity = useMotionValue(index === activeIdx ? 1 : 0.5)

  useEffect(() => {
    animate(x, diff * 400, { type: 'spring', stiffness: 300, damping: 30 })
    animate(scale, index === activeIdx ? 1 : 0.8, { type: 'spring', stiffness: 300, damping: 30 })
    animate(opacity, index === activeIdx ? 1 : 0.5, { duration: 0.3 })
  }, [activeIdx, index, diff, x, scale, opacity])

  return (
    <motion.div
      style={{ x, scale, opacity, zIndex: index === activeIdx ? 10 : 5 }}
      className="absolute flex flex-col items-center gap-[24px] cursor-pointer"
      onClick={() => setIdx(index)}
    >
      <div className="relative w-[342px] h-[390px] rounded-[12px] overflow-hidden shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)]">
        <Image src={doc.image} alt={doc.name} fill className="object-cover object-top" sizes="342px" />
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/60 to-transparent" />
      </div>
      <div className="flex flex-col items-center gap-[8px] text-center max-w-[300px]">
        <h3 className="font-cormorant font-bold text-[28px] text-gold-900 leading-tight uppercase">
          {doc.name}
        </h3>
        <p className="font-dm-sans text-[14px] text-gold-700 font-medium tracking-wide uppercase">
          {doc.specialty}
        </p>
      </div>
    </motion.div>
  )
}

export default function SpecialistSection() {
  const scrollX = useMotionValue(0)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const controls = animate(scrollX, idx * -400, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    })
    return controls.stop
  }, [idx, scrollX])

  return (
    <section className="w-full bg-[#fbf7ee] py-[80px] overflow-hidden px-[40px] xl:px-[46px]">
      <div className="max-w-[1352px] mx-auto flex flex-col gap-[40px] items-center">

        <div className="flex flex-col gap-[16px] items-center w-full px-4">
          <h2 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none text-center">
            Specialist
          </h2>
          <p className="font-dm-sans text-[20px] text-gold-800 text-center">
            A selected team of experts committed to your health
          </p>
        </div>

        <div className="relative w-full flex items-center justify-center h-[540px]">
          {DOCTORS.map((doc, i) => (
            <DocCard key={i} doc={doc} index={i} activeIdx={idx} setIdx={setIdx} />
          ))}
        </div>

        <div className="flex justify-center mt-[40px]">
          <button className="px-[40px] py-[14px] rounded-full border border-[#b89148] text-[#3b2d17] font-dm-sans text-[18px] hover:bg-[#fbf7ee] transition-colors cursor-pointer">
            See More
          </button>
        </div>

      </div>
    </section>
  )
}
