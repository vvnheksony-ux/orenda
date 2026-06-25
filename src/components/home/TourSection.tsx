'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Link } from '@/i18n/routing'
import { useAnalytics } from '@/lib/use-analytics'
import { fetchTourScenes } from '@/lib/tour-cache'

export default function TourSection() {
  const t = useTranslations('TourSection')
  const locale = useLocale()
  const router = useRouter()
  const { trackTourView } = useAnalytics()

  const [rooms, setRooms] = useState<{id:string;name:string;image:string}[]>([])
  useEffect(() => {
    fetchTourScenes(locale)
      .then(scenes => {
        if (scenes.length) setRooms(scenes.map(s => ({ id: s.id, name: s.title, image: s.thumbnailUrl ?? '/images/figma-room-1.jpg' })))
      })
      .catch(() => {})
  }, [locale])

  const [active, setActive] = useState(0)
  const NR = rooms.length
  const prev = () => setActive(i => (i - 1 + NR) % NR)
  const next = () => setActive(i => (i + 1) % NR)

  // 5 slots: only compute when rooms loaded
  const slots = NR > 0 ? [-2, -1, 0, 1, 2].map(offset => ({
    ...rooms[((active + offset) % NR + NR) % NR],
    offset,
  })) : []

  const W = { '-2': 25, '-1': 25, '0': 34, '1': 25, '2': 25 } as Record<string, number>
  const H: Record<string, string | number> = {
    '-2': 300, '-1': 300, '0': 360, '1': 300, '2': 300,
  }

  const activeBg = rooms[active]?.image ?? '/images/figma-room-1.jpg'

  return (
    <section className="relative w-full overflow-hidden" style={{ height: 914 }}>
      {/* Animated dynamic background */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeBg}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={activeBg}
              alt="360 Tour"
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized={activeBg.startsWith('/payload')}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 z-0" style={{
        background: 'linear-gradient(90deg,rgba(246,163,198,0.05) 0%,rgba(246,163,198,0.05) 100%),linear-gradient(90deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.5) 100%)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)',
      }} />

      {/* 360° text block — top: 73 per Figma */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-10" style={{ top: 73 }}>
        <p className="font-cormorant leading-none text-center"
          style={{ fontSize: 128, color: '#fbf7ee', textShadow: '0 0 12px rgba(255,255,255,0.2)', lineHeight: 1 }}>
          360<sup style={{ fontSize: 82, lineHeight: 0 }}>°</sup>
        </p>
        <svg className="w-[min(480px,80vw)] h-[28px]" viewBox="0 0 480 28" fill="none" style={{ marginTop: -4 }}>
          <path d="M 48 6 Q 240 28 432 6" stroke="#fbf7ee" strokeWidth="1.3" fill="none"/>
          <path d="M 48 6 Q 240 -16 432 6" stroke="#fbf7ee" strokeWidth="1.3" fill="none"/>
          <polyline points="423,0 435,6 423,13" stroke="#fbf7ee" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="font-cormorant font-bold text-center leading-none mt-[10px]"
          style={{ fontSize: 36, color: '#fbf7ee' }}>
          {t('hospitalName')}
        </p>
      </div>

      {/* Button — top: 384 per Figma */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: 384 }}>
        <Link href="/360-tour"
          className="flex items-center justify-center font-dm-sans text-white hover:opacity-90 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          style={{ background: '#b89148', borderRadius: 12, fontSize: 24, paddingLeft: 56, paddingRight: 56, paddingTop: 16, paddingBottom: 16, boxShadow: '0 0 12px 4px rgba(255,255,255,0.2),0 4px 16px 4px rgba(122,95,44,0.12)' }}>
          {t('startDiscovering')}
        </Link>
      </div>

      {/* 5-card drag carousel — anchored to bottom */}
      <div className="absolute left-0 right-0 overflow-hidden z-10" style={{ bottom: 48, height: 400 }}>
        <motion.div
          className="flex items-center justify-center h-full"
          style={{ gap: 40 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (info.offset.x < -40) next()
            else if (info.offset.x > 40) prev()
          }}
        >
          {slots.map(({ id, name, image, offset }) => {
            const key = String(offset)
            const isCenter = offset === 0
            return (
              <motion.div key={`${key}-${id}`}
                className="relative overflow-hidden flex-shrink-0 cursor-pointer"
                style={{ width: `${W[key]}vw`, height: H[key], borderRadius: isCenter ? 16 : 12, outline: '0.5px solid rgba(251,247,238,0.8)', boxShadow: '0 4px 12px 3px rgba(89,69,34,0.2), 0 0 12px 4px rgba(255,255,255,0.2)' }}
                animate={{ opacity: isCenter ? 1 : 0.8, scale: isCenter ? 1 : 0.95 }}
                whileHover={{ scale: isCenter ? 1.02 : 0.97, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => {
                  if (offset < 0) prev()
                  else if (offset > 0) next()
                  else { trackTourView(1, name); router.push('/360-tour') }
                }}
              >
                {image && <Image src={image} alt={name} fill className="object-cover" sizes={`${W[key]}vw`} unoptimized={image.startsWith('/payload')} />}
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: isCenter ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.8)', backdropFilter: isCenter ? 'blur(4px)' : 'blur(2px)', WebkitBackdropFilter: isCenter ? 'blur(4px)' : 'blur(2px)', transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
                  <p className="font-dm-sans font-semibold text-[#fbf7ee] text-center px-4 line-clamp-4"
                    style={{ fontSize: isCenter ? 30 : 24 }}>{name}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

    </section>
  )
}
