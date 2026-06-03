'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRouter, Link } from '@/i18n/routing'
import { useAnalytics } from '@/lib/use-analytics'

export default function TourSection() {
  const t = useTranslations('TourSection')
  const router = useRouter()
  const { trackTourView } = useAnalytics()

  const ROOMS = [
    { name: t('roomResting'),      image: '/images/figma-room-1.jpg' },
    { name: t('roomTreatment'),    image: '/images/figma-room-2.jpg' },
    { name: t('roomOperating'),    image: '/images/figma-room-3.jpg' },
    { name: t('roomRecovery'),     image: '/images/figma-room-1.jpg' },
    { name: t('roomConsultation'), image: '/images/figma-room-2.jpg' },
  ]

  const [activeRoom, setActiveRoom] = useState(0)
  const NR = ROOMS.length
  const prevRoom = () => setActiveRoom(i => (i - 1 + NR) % NR)
  const nextRoom = () => setActiveRoom(i => (i + 1) % NR)

  // 3 visible cards: offset -1, 0, +1 relative to active
  const visibleRooms = [-1, 0, 1].map(offset => {
    const idx = (activeRoom + offset + NR) % NR
    return { ...ROOMS[idx], offset, idx }
  })

  return (
    <>
      {/* ── SUB-SECTION 1: Discovers Our Facilities ── */}
      <section className="w-full py-[120px] px-[80px]">
        <div className="flex flex-col gap-[60px] items-center">

          {/* Header */}
          <div className="flex flex-col gap-[16px] items-center">
            <h2
              className="font-cormorant font-bold text-center leading-none"
              style={{ fontSize: '48px', color: '#3b2d17' }}
            >
              {t('title')}
            </h2>
            <p
              className="font-dm-sans text-center"
              style={{ fontSize: '20px', color: '#594522' }}
            >
              {t('subtitle')}
            </p>
          </div>

          {/* Two facility cards */}
          <div className="flex gap-[40px] w-full max-w-[1352px] mx-auto">

            {/* Left card — Visit */}
            <div className="flex-1 rounded-[16px] overflow-hidden relative min-h-[480px]">
              <Image
                src="/images/figma-facility-1.jpg"
                alt={t('facility1Title')}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1400px) 50vw, 676px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-[40px] flex flex-col gap-[16px]">
                <h3
                  className="font-cormorant font-bold text-white leading-none"
                  style={{ fontSize: '32px' }}
                >
                  {t('facility1Title')}
                </h3>
                <p className="font-dm-sans text-white/90 text-[16px] leading-[1.6]">
                  {t('facility1Desc')}
                </p>
                <Link
                  href="/doctors"
                  className="self-start inline-flex items-center justify-center font-dm-sans text-white text-[16px] transition-opacity hover:opacity-90"
                  style={{
                    background: '#b89148',
                    borderRadius: '32px',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  {t('discoverMore')}
                </Link>
              </div>
            </div>

            {/* Right card — Our Medical Facilities */}
            <div className="flex-1 rounded-[16px] overflow-hidden relative min-h-[480px]">
              <Image
                src="/images/figma-facility-2.jpg"
                alt={t('facility2Title')}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1400px) 50vw, 676px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-[40px] flex flex-col gap-[16px]">
                <h3
                  className="font-cormorant font-bold text-white leading-none"
                  style={{ fontSize: '32px' }}
                >
                  {t('facility2Title')}
                </h3>
                <p className="font-dm-sans text-white/90 text-[16px] leading-[1.6]">
                  {t('facility2Desc')}
                </p>
                <Link
                  href="/doctors"
                  className="self-start inline-flex items-center justify-center font-dm-sans text-white text-[16px] transition-opacity hover:opacity-90"
                  style={{
                    background: '#b89148',
                    borderRadius: '32px',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  {t('discoverMore')}
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SUB-SECTION 2: 360° Tour ── */}
      <section
        className="w-full py-[80px] flex flex-col items-center gap-[48px]"
        style={{ background: '#2a2620' }}
      >
        {/* Hero block */}
        <div className="flex flex-col items-center gap-[16px]">
          <p
            className="font-cormorant font-bold text-center leading-none"
            style={{ fontSize: '160px', color: '#c9a96e' }}
          >
            360°
          </p>

          <button
            onClick={() => {
              trackTourView(1, 'General Entrance')
              router.push('/360-tour')
            }}
            className="font-dm-sans text-white text-[18px] transition-opacity hover:opacity-90"
            style={{
              background: '#b89148',
              borderRadius: '32px',
              paddingLeft: '48px',
              paddingRight: '48px',
              paddingTop: '14px',
              paddingBottom: '14px',
            }}
          >
            {t('startDiscovering')}
          </button>

          <p
            className="font-cormorant font-bold text-center mt-[8px]"
            style={{ fontSize: '40px', color: '#fbf7ee' }}
          >
            {t('hospitalName')}
          </p>
        </div>

        {/* Room thumbnail cards */}
        <motion.div
          className="flex gap-[24px] items-center justify-center"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) nextRoom()
            else if (info.offset.x > 50) prevRoom()
          }}
        >
          {visibleRooms.map(({ name, image, offset, idx }) => (
            <motion.div
              key={idx}
              className="relative overflow-hidden flex-shrink-0 cursor-pointer"
              style={{
                width: '415px',
                height: '247px',
                borderRadius: '12px',
                border: '1px solid rgba(251,247,238,0.30)',
              }}
              animate={{ opacity: offset === 0 ? 1 : 0.6, scale: offset === 0 ? 1 : 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={() => {
                if (offset < 0) prevRoom()
                else if (offset > 0) nextRoom()
                else {
                  trackTourView(idx + 1, name)
                  router.push('/360-tour')
                }
              }}
            >
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover object-center"
                sizes="415px"
              />
              <div
                className="absolute inset-0 flex items-end p-[20px]"
                style={{
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  background: 'rgba(0,0,0,0.72)',
                }}
              >
                <p className="font-dm-sans font-semibold text-[#fbf7ee] text-[20px]">
                  {name}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Dot indicators */}
        <div className="flex gap-[8px] items-center">
          {ROOMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveRoom(i)}
              className="transition-all"
              style={{
                width: i === activeRoom ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === activeRoom ? '#c9a96e' : 'rgba(251,247,238,0.30)',
              }}
            />
          ))}
        </div>
      </section>
    </>
  )
}
