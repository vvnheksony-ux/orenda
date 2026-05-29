'use client'

import { useState } from 'react'
import ThreeSixtyViewer from '@/components/shared/ThreeSixtyViewer'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import SiteLayout from '@/components/layout/SiteLayout'

export default function ThreeSixtyTourPage() {
  const t = useTranslations('TourSection')

  const ROOMS = [
    { id: 'standard', name: t('roomResting'), thumb: '/images/room-card.jpg', src: '/images/360/StandardRoom.JPG' },
    { id: 'opd1', name: t('roomTreatment'), thumb: '/images/room-card.jpg', src: '/images/360/OPD-1stFloor.JPG' },
    { id: 'opd2', name: t('roomOperating'), thumb: '/images/room-card.jpg', src: '/images/360/OPD-2ndFloor.JPG' },
    { id: 'opd3', name: t('roomRecovery'), thumb: '/images/room-card.jpg', src: '/images/360/OPD-3rdFloor.JPG' },
    { id: 'king', name: t('roomConsultation'), thumb: '/images/room-card.jpg', src: "/images/360/King's Room/KingRoom-Patient.JPG" },
  ]

  const [activeRoomId, setActiveRoomId] = useState(ROOMS[0].id)
  const activeRoom = ROOMS.find(r => r.id === activeRoomId) || ROOMS[0]

  return (
    <SiteLayout>
      <main className="w-full bg-[#fcfbf8] pt-[140px] xl:pt-[180px] pb-[80px] xl:pb-[120px]">
        <div className="max-w-[1600px] mx-auto px-[40px] xl:px-[80px]">
          
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-[40px] xl:mb-[60px]">
            <h1 className="font-cormorant font-bold text-[48px] xl:text-[64px] text-[#2c241b] leading-none mb-[16px]">
              {t('title')}
            </h1>
            <p className="font-dm-sans text-[18px] xl:text-[22px] text-[#6b5a45] max-w-2xl">
              Immerse yourself in our world-class medical facilities with our interactive 360° virtual tour. Select a room below to start exploring.
            </p>
          </div>

          {/* Viewer Container */}
          <div className="relative w-full h-[600px] xl:h-[800px] rounded-[24px] xl:rounded-[32px] overflow-hidden shadow-[0_24px_64px_rgba(107,90,69,0.15)] border-[8px] border-white">
            
            <ThreeSixtyViewer key={activeRoom.src} src={activeRoom.src} />

            {/* Premium Room Selector inside the viewer */}
            <div className="absolute bottom-[32px] left-1/2 -translate-x-1/2 z-50">
              <div className="bg-[#f7f5f2]/80 backdrop-blur-xl border border-white/60 p-[12px] rounded-[24px] shadow-lg flex items-center gap-[12px]">
                {ROOMS.map((room) => {
                  const isActive = room.id === activeRoomId
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`relative overflow-hidden transition-all duration-300 rounded-[16px] ${
                        isActive 
                          ? 'w-[160px] h-[100px] ring-2 ring-[#b89148] shadow-md scale-100' 
                          : 'w-[120px] h-[80px] opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <Image
                        src={room.thumb}
                        alt={room.name}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute inset-0 flex items-end justify-center pb-2 transition-colors ${isActive ? 'bg-black/10' : 'bg-black/40'}`}>
                        <span className="font-dm-sans font-medium text-white text-[13px] drop-shadow-md text-center leading-tight px-2">
                          {room.name}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

        </div>
      </main>
    </SiteLayout>
  )
}
