'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { X } from 'lucide-react'
import ThreeSixtyViewer from '../shared/ThreeSixtyViewer'

  // We will define ROOMS and FACILITY_CARDS inside the component

// Figma exact dims
const RC = { w: 504.858, h: 300,  rounded: 14.575, border: 0.607, blur: 4.858, textSize: 29.15 }
const RS = { w: 415.667, h: 247,  rounded: 12,     border: 0.5,   blur: 4,     textSize: 24    }
const RGAP = 40

function rxCenter(offset: number) {
  if (offset === 0) return 0
  const s = Math.sign(offset), a = Math.abs(offset)
  if (a === 1) return s * (RC.w / 2 + RGAP + RS.w / 2)
  return s * (RC.w / 2 + RGAP + RS.w + RGAP + RS.w / 2)
}

function RoomCard({ room, offset, dir, onPrev, onNext, onOpenViewer }: {
  room: { name: string, image: string, viewerSrc?: string }
  offset: number
  dir: number
  onPrev: () => void
  onNext: () => void
  onOpenViewer: (src: string) => void
}) {
  const abs   = Math.abs(offset)
  const cfg   = abs === 0 ? RC : RS
  const { w, h, rounded, border, blur, textSize } = cfg

  const x = useMotionValue(rxCenter(offset) - w / 2)
  const y = useMotionValue(-h / 2)
  const prevRef = useRef<number | null>(null)

  useEffect(() => {
    const prev = prevRef.current ?? offset
    prevRef.current = offset
    if (Math.abs(offset - prev) > 1) x.set(rxCenter(dir > 0 ? 3 : -3) - w / 2)
    const cx = animate(x, rxCenter(offset) - w / 2, { type: 'spring', stiffness: 320, damping: 32 })
    const cy = animate(y, -h / 2,                   { type: 'spring', stiffness: 320, damping: 32 })
    return () => { cx.stop(); cy.stop() }
  }, [offset])

  return (
    <motion.div
      style={{
        position: 'absolute', left: '50%', top: '50%',
        width: w, height: h, x, y,
        zIndex: 3 - abs,
        cursor: offset !== 0 ? 'pointer' : (room.viewerSrc ? 'pointer' : 'default'),
      }}
      onClick={() => { 
        if (offset < 0) onPrev()
        if (offset > 0) onNext()
        if (offset === 0 && room.viewerSrc) onOpenViewer(room.viewerSrc)
      }}
    >
      <div
        className="relative w-full h-full overflow-hidden bg-[rgba(245,236,212,0.2)] group"
        style={{
          borderRadius: rounded,
          border: `${border}px solid #fbf7ee`,
          boxShadow: '0px 0px 12px 4px rgba(255,255,255,0.20), 0px 4px 12px 3px rgba(89,69,34,0.20)',
        }}
      >
        {/* Background image */}
        <Image src={room.image} alt={room.name} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" sizes="520px" />

        {/* Dark blurred overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center transition-colors duration-300"
          style={{
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            background: offset === 0 ? 'rgba(0,0,0,0.30)' : 'rgba(0,0,0,0.60)',
          }}
        >
          <p
            className="font-dm-sans font-semibold text-[#fbf7ee] text-center whitespace-nowrap drop-shadow-md"
            style={{ fontSize: textSize }}
          >
            {room.name}
          </p>
          {offset === 0 && room.viewerSrc && (
            <div className="mt-4 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/40 text-white font-dm-sans text-sm shadow-lg hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0">
              Click to view 360°
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Removed hardcoded FACILITY_CARDS

export default function TourSection() {
  const t = useTranslations('TourSection')

  const ROOMS = [
    { name: t('roomResting'),      image: '/images/room-card.jpg', viewerSrc: '/images/360/StandardRoom.JPG' },
    { name: t('roomTreatment'),    image: '/images/room-card.jpg', viewerSrc: '/images/360/OPD-1stFloor.JPG' },
    { name: t('roomOperating'),    image: '/images/room-card.jpg', viewerSrc: '/images/360/OPD-2ndFloor.JPG' },
    { name: t('roomRecovery'),     image: '/images/room-card.jpg', viewerSrc: '/images/360/OPD-3rdFloor.JPG' },
    { name: t('roomConsultation'), image: '/images/room-card.jpg', viewerSrc: "/images/360/King's Room/KingRoom-Patient.JPG" },
  ]
  const NR = ROOMS.length

  const FACILITY_CARDS = [
    {
      image: '/images/facility-left.png',
      title: t('facility1Title'),
      description: t('facility1Desc'),
    },
    {
      image: '/images/facility-right.png',
      title: t('facility2Title'),
      description: t('facility2Desc'),
    },
  ]

  const [activeRoom, setActiveRoom] = useState(0)
  const [roomDir,    setRoomDir]    = useState(1)
  const router = useRouter()
  const prevRoom = () => { setRoomDir(-1); setActiveRoom(i => (i - 1 + NR) % NR) }
  const nextRoom = () => { setRoomDir(1);  setActiveRoom(i => (i + 1) % NR) }
  const roomCards = ROOMS.map((room, ri) => {
    let offset = ri - activeRoom
    if (offset >  2) offset -= NR
    if (offset < -2) offset += NR
    return { room, ri, offset }
  })

  return (
    <>
      {/* ── Discovers Our Facilities ── */}
      <section className="w-full px-[40px] xl:px-[80px] py-[120px] lg:py-[160px]">
        <div className="flex flex-col gap-[60px] items-center">

          {/* Header */}
          <div className="flex flex-col gap-[20px] items-center w-full">
            <h2 className="font-cormorant font-bold text-[48px] lg:text-[64px] xl:text-[72px] text-gold-900 leading-none text-center">
              {t('title')}
            </h2>
            <p className="font-dm-sans text-[20px] lg:text-[24px] xl:text-[26px] text-gold-800 text-center max-w-3xl">
              {t('subtitle')}
            </p>
          </div>

          {/* Two cards */}
          <div className="flex flex-col lg:flex-row gap-[40px] lg:gap-[60px] xl:gap-[80px] items-start justify-center w-full max-w-[1800px] mx-auto">
            {FACILITY_CARDS.map((card) => (
              <div key={card.title} className="flex flex-col gap-[24px] xl:gap-[32px] items-center flex-1">
                {/* Image */}
                <div className="relative w-full rounded-[16px] xl:rounded-[24px] overflow-hidden shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] h-[320px] lg:h-[400px] xl:h-[480px]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-[16px] xl:gap-[20px] items-center w-full">
                  <h3 className="font-cormorant font-bold text-[40px] lg:text-[48px] xl:text-[56px] text-gold-900 leading-none text-center">
                    {card.title}
                  </h3>
                  <p className="font-dm-sans text-[16px] lg:text-[18px] xl:text-[20px] text-gold-900 leading-[1.6] text-center max-w-2xl">
                    {card.description}
                  </p>
                </div>

                {/* CTA */}
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-[32px] py-[14px] rounded-full font-dm-sans text-[16px] text-white transition-opacity hover:opacity-90"
                  style={{ background: '#b89148' }}
                >
                  {t('discoverMore')}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 360° Virtual Tour ── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: '914px' }}
      >
        {/* Background image */}
        <Image
          src="/images/room-bg.jpg"
          alt="Orienda Hospital Interior"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Blurred dark overlay — matches Figma backdrop-blur 17.2px + black 50% */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(17.2px)',
            WebkitBackdropFilter: 'blur(17.2px)',
            background: 'linear-gradient(90deg,rgba(246,163,198,0.10) 0%,rgba(246,163,198,0.10) 100%), linear-gradient(90deg,rgba(0,0,0,0.50) 0%,rgba(0,0,0,0.50) 100%)',
          }}
        />

        {/* 360° content — centered, top 73px from Figma */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-10"
          style={{ top: '73px' }}
        >
          {/* Inner group: "360°" text + orbit icon */}
          <div className="flex flex-col items-center">
            {/* 360° */}
            <p
              className="font-cormorant text-[#fbf7ee] text-center leading-none"
              style={{
                fontSize: '128px',
                textShadow: '0px 0px 12px rgba(255,255,255,0.20)',
              }}
            >
              360<span style={{ fontSize: '82.56px', verticalAlign: 'super', lineHeight: 0 }}>°</span>
            </p>

            {/* Orbit icon — 680×64, wider than text, overflows centered */}
            <div style={{ width: 680, height: 64 }}>
              <svg width="680" height="64" viewBox="0 0 680 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Near-complete flat ellipse arc (large arc, clockwise = goes up-over-top to end at left) */}
                <path
                  d="M 484 50 A 246 18 0 1 1 196 50"
                  stroke="#fbf7ee"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.85"
                />
                {/* Arrowhead at left end, tip pointing left (counterclockwise direction) */}
                <path
                  d="M 210 44 L 196 50 L 210 56"
                  stroke="#fbf7ee"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.85"
                />
              </svg>
            </div>
          </div>

          {/* Hospital name */}
          <p
            className="font-cormorant font-bold text-[#fbf7ee] text-center whitespace-nowrap"
            style={{ fontSize: '40px' }}
          >
            {t('hospitalName')}
          </p>
        </div>

        {/* Start Discovering button — top 384px from Figma */}
        <button
          onClick={() => router.push('/360-tour')}
          className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center font-dm-sans text-[24px] text-white rounded-[12px] transition-opacity hover:opacity-90"
          style={{
            top: '384px',
            paddingLeft: 56, paddingRight: 56,
            paddingTop: 16, paddingBottom: 16,
            background: '#b89148',
            boxShadow: '0px 0px 12px 4px rgba(255,255,255,0.20), 0px 4px 16px 4px rgba(122,95,44,0.12)',
            whiteSpace: 'nowrap',
          }}
        >
          {t('startDiscovering')}
        </button>

        {/* Room cards carousel */}
        <div
          className="absolute z-10 overflow-hidden"
          style={{ bottom: 0, left: 0, right: 0, height: RC.h + 80 }}
        >
          <motion.div
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) nextRoom()
              else if (info.offset.x > 50) prevRoom()
            }}
            style={{ cursor: 'grab', zIndex: 20 }}
            whileDrag={{ cursor: 'grabbing' }}
          />
          {roomCards.map(({ room, ri, offset }) => (
            <RoomCard
              key={ri}
              room={room}
              offset={offset}
              dir={roomDir}
              onPrev={prevRoom}
              onNext={nextRoom}
              onOpenViewer={() => router.push('/360-tour')}
            />
          ))}
        </div>
      </section>
    </>
  )
}
