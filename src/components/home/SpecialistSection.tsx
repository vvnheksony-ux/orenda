'use client'

import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { useBranch } from '@/lib/branch-context'
import { animate, motion, useMotionValue } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'

function wrapIdx(i: number, n: number) { return ((i % n) + n) % n }

function wrappedDiff(rawDiff: number, n: number) {
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

function DocCard({ doc, docIndex, activeIdx, setIdx, viewProfileTxt, n }: {
  doc: { id: string, name: string, specialty: string, image: string }
  docIndex: number
  activeIdx: number
  setIdx: (i: number) => void
  viewProfileTxt: string
  n: number
}) {
  const diff = wrappedDiff(docIndex - activeIdx, n)
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
      className="absolute bg-white overflow-hidden cursor-pointer shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] flex flex-col"
      onClick={() => setIdx(docIndex)}
      whileHover="hover"
      animate={{ y: 0 }}
      variants={{
        hover: { 
          y: -12,
          transition: { type: 'spring', stiffness: 300, damping: 20 }
        }
      }}
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

      {/* Circular photo wrapper with inner zoom motion */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bg-gold-50 rounded-full overflow-hidden shadow-[0px_4px_30px_12px_rgba(184,145,72,0.2)]"
        style={{ width: s.photo, height: s.photo, top: s.photoTop }}
      >
        <motion.div 
          className="relative w-full h-full"
          variants={{
            hover: { scale: 1.08, transition: { duration: 0.3 } }
          }}
        >
          <Image src={doc.image} alt={doc.name} fill className="object-cover object-top" sizes={`${s.photo}px`} unoptimized />
        </motion.div>
      </div>

      {/* Info */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center justify-between px-[16px] pb-[24px]"
        style={{ top: '53%', bottom: 0 }}
      >
        <div className="flex flex-col gap-[12px] items-center text-center w-full overflow-hidden">
          <p className="font-cormorant text-gold-900 leading-[1.2] font-bold capitalize w-full truncate" style={{ fontSize: s.name }}>
            {doc.name}
          </p>
          <p className="font-dm-sans text-gold-900/80 leading-[1.2] w-full truncate" style={{ fontSize: s.spec }}>
            {doc.specialty}
          </p>
        </div>
        <Link href={`/doctors/${doc.id}` as any} onClick={(e) => e.stopPropagation()} className="contents">
          <motion.div
            className="bg-[#B89148] flex items-center justify-center overflow-hidden shadow-[0px_2px_6px_6px_rgba(0,0,0,0.05)] mt-[16px] cursor-pointer"
            style={{ width: s.btnW, height: s.btnH, borderRadius: 12 }}
            variants={{
              hover: {
                backgroundColor: '#a3803d',
                scale: 1.03,
                boxShadow: '0 4px 12px rgba(163,128,61,0.35)',
                transition: { duration: 0.2 }
              }
            }}
          >
            <p className="font-dm-sans text-white text-center font-medium" style={{ fontSize: s.btnFs }}>
              {viewProfileTxt}
            </p>
          </motion.div>
        </Link>
      </div>

      {/* Inactive overlay */}
      {s.overlay > 0 && (
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${s.overlay})` }} />
      )}
    </motion.div>
  )
}


export default function SpecialistSection() {
  const t = useTranslations('SpecialistSection')
  const locale = useLocale()
  const { selectedBranch } = useBranch()
  const [activeIdx, setActiveIdx] = useState(2)
  const [doctors, setDoctors] = useState<{ id: string; name: string; specialty: string; image: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBranch) return
    setLoading(true)
    setActiveIdx(2)
    fetch(`/api/doctors?locale=${locale}&branch=${selectedBranch.id}`)
      .then(r => r.json())
      .then((data: any[]) => {
        if (data?.length) {
          setDoctors(data.map(d => ({
            id:        String(d.id),
            name:      d.name,
            specialty: d.specialty,
            image:     d.image_url || '/images/doctor-1.jpg',
          })))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locale, selectedBranch])

  const DOCTORS = doctors
  const n = DOCTORS.length

  const prev = () => setActiveIdx(i => wrapIdx(i - 1, n))
  const next = () => setActiveIdx(i => wrapIdx(i + 1, n))

  if (loading) return (
    <section className="w-full bg-[var(--background)] overflow-hidden">
      <div className="max-w-[1512px] mx-auto w-full flex flex-col gap-[24px] lg:gap-[60px] items-center">
        <div className="flex flex-col gap-[16px] items-center w-full text-center px-4 sm:px-6 md:px-10 lg:px-14 xl:px-[80px]">
          <div className="h-[36px] lg:h-[48px] w-[240px] rounded-lg bg-[#e8d9b8] animate-pulse" />
          <div className="h-[20px] w-[200px] rounded bg-[#e8d9b8] animate-pulse" />
        </div>
        <div className="flex gap-[32px] items-end justify-center w-full h-[540px] relative overflow-hidden">
          {[315, 360, 405, 360, 315].map((w, i) => (
            <div key={i} className="shrink-0 rounded-[19px] bg-[#e8d9b8] animate-pulse" style={{ width: w, height: w === 405 ? 540 : w === 360 ? 480 : 420 }} />
          ))}
        </div>
      </div>
    </section>
  )

  if (!n) return null

  return (
    <section className="w-full bg-[var(--background)] overflow-hidden">
      <div className="max-w-[1512px] mx-auto w-full flex flex-col gap-[24px] lg:gap-[60px] items-center">

        <div className="flex flex-col gap-[16px] lg:gap-[20px] items-center w-full text-center px-4 sm:px-6 md:px-10 lg:px-14 xl:px-[80px]">
          <h2 className="font-cormorant font-bold text-[36px] lg:text-[48px] text-[#3b2d17] leading-none w-full">
            {t('title')}
          </h2>
          <p className="font-dm-sans text-[18px] lg:text-[20px] text-[#594522] leading-none w-[299px] lg:w-full">
            {t('subtitle')}
          </p>
        </div>

        {/* ── Mobile: centered peek carousel ── */}
        <div className="lg:hidden w-full relative overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(calc(50% - ${activeIdx * 266 + 125}px))`, gap: 16 }}
          >
            {DOCTORS.map((doc, i) => {
              const diff = Math.abs(i - activeIdx)
              return (
                <div
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className="bg-white rounded-[16px] overflow-hidden shadow-[0px_3px_13px_3px_rgba(122,95,44,0.12)] shrink-0 flex flex-col items-center transition-all duration-300 cursor-pointer"
                  style={{ width: 250, height: 329, opacity: diff === 0 ? 1 : 0.5, transform: diff === 0 ? 'scale(1)' : 'scale(0.93)' }}
                >
                  {/* Gold gradient header */}
                  <div className="relative w-full flex-1 flex flex-col items-center justify-start pt-[12px]">
                    <div
                      className="absolute top-0 left-0 right-0"
                      style={{
                        height: '52%',
                        opacity: 0.64,
                        backgroundImage: 'linear-gradient(133.36deg,rgba(234,214,164,0.6) 0%,rgba(206,175,112,0.827) 25%,rgba(184,145,72,0.8) 49.52%,rgba(210,181,120,0.792) 75.96%,rgba(234,214,164,0.6) 100%)',
                      }}
                    />
                    <div className="relative z-10 rounded-full overflow-hidden bg-[var(--background)] shadow-[0px_3px_25px_12px_rgba(184,145,72,0.2)]" style={{ width: 120, height: 120, marginTop: 24 }}>
                      <Image src={doc.image} alt={doc.name} fill className="object-cover object-top" sizes="120px" unoptimized />
                    </div>
                  </div>
                  {/* Info */}
                  <div className="flex flex-col items-center gap-[10px] px-[16px] pb-[20px] w-full">
                    <div className="flex flex-col gap-[8px] items-center text-center">
                      <p className="font-cormorant font-bold text-[18px] text-[#3b2d17] leading-tight capitalize w-full truncate">{doc.name}</p>
                      <p className="font-dm-sans text-[12px] text-[#3b2d17]/80 leading-tight w-full truncate">{doc.specialty}</p>
                    </div>
                    <Link href={`/doctors/${doc.id}` as any} onClick={(e) => e.stopPropagation()} className="bg-[#b89148] rounded-[10px] flex items-center justify-center px-[12px] py-[8px] w-full">
                      <p className="font-dm-sans text-white text-center text-[12px] font-medium">{t('viewProfile')}</p>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Desktop: motion carousel ── */}
        <motion.div
          className="hidden lg:flex relative w-full items-center justify-center h-[600px] cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragEnd={(_, info) => {
            if (info.offset.x < -40) next()
            else if (info.offset.x > 40) prev()
          }}
        >

          {DOCTORS.map((doc, i) => (
            <DocCard key={i} doc={doc} docIndex={i} activeIdx={activeIdx} setIdx={setActiveIdx} viewProfileTxt={t('viewProfile')} n={n} />
          ))}

        </motion.div>

        <Link href="/doctors" className="px-[32px] py-[12px] rounded-full border border-[#b89148] text-[#5c4924] font-dm-sans text-[16px] bg-[#F5ECD4]/40 hover:bg-[#b89148]/10 transition-colors cursor-pointer">
          {t('seeMore')}
        </Link>

      </div>
    </section>
  )
}
