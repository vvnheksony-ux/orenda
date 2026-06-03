'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'
import ThreeSixtyViewer from '@/components/shared/ThreeSixtyViewer'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ROOMS as ROOM_DATA } from '@/lib/rooms'

const ROOMS = ROOM_DATA.map(r => ({
  id: r.id,
  name: r.name,
  desc: r.desc.split('\n\n')[0].slice(0, 60) + '…',
  src: r.src,
  thumb: r.src,
}))

export default function ThreeSixtyTourPage() {
  const t = useTranslations('TourSection')
  const [activeRoom, setActiveRoom] = useState<string | null>(null)

  const selectedRoom = ROOMS.find(r => r.id === activeRoom)

  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="flex flex-col gap-[80px] items-center pb-[120px] px-[80px] pt-[120px] 2xl:pt-[196px]">

          {/* Panoramic banner */}
          <div className="w-full h-[572px] rounded-[28px] overflow-hidden relative shrink-0">
            <Image
              src="/images/360-page-banner.jpg"
              alt="360 Tour Banner"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>

          {/* Room cards */}
          <div className="flex flex-col gap-[40px] items-center w-full">
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">
                Visit Our Rooms
              </h2>
              <p className="font-dm-sans text-[20px] text-[#594522] w-full">
                See full 360 degree views of our rooms
              </p>
            </div>

            {/* 2-col grid */}
            <div className="flex flex-wrap gap-[40px] items-center w-full">
              {ROOMS.map((room) => (
                <div
                  key={room.id}
                  className="bg-white flex flex-1 flex-col items-center min-w-[300px] overflow-hidden rounded-[24px]"
                  style={{ boxShadow: '0px 4px 30px 12px rgba(138,124,88,0.12)' }}
                >
                  {/* Room photo */}
                  <div className="relative h-[376px] w-full bg-[#f3f3f3] overflow-hidden shrink-0">
                    <Image
                      src={room.thumb}
                      alt={room.name}
                      fill
                      className="object-cover"
                      sizes="656px"
                    />
                  </div>

                  {/* Card footer */}
                  <div className="flex flex-wrap gap-y-[24px] items-end justify-between p-[40px] w-full">
                    <div className="flex flex-col gap-[12px] items-center justify-center text-center whitespace-nowrap">
                      <p className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">{room.name}</p>
                      <p className="font-dm-sans text-[20px] text-[#594522]">{room.desc}</p>
                    </div>
                    <Link
                      href={`/360-tour/${room.id}` as any}
                      className="flex items-center h-[48px] px-[20px] py-[14px] border-[1.5px] border-[#b89148] rounded-[12px] gap-[4px] shrink-0"
                    >
                      <span className="font-dm-sans text-[18px] text-[#5c4924] px-[8px]">Learn More</span>
                      <ArrowRight size={20} className="text-[#5c4924]" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 360 viewer modal */}
      {selectedRoom && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center"
          onClick={() => setActiveRoom(null)}
        >
          <div
            className="relative w-[90vw] h-[80vh] rounded-[16px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <ThreeSixtyViewer src={selectedRoom.src} />
            <button
              onClick={() => setActiveRoom(null)}
              className="absolute top-[16px] right-[16px] z-10 bg-black/50 text-white rounded-full w-[40px] h-[40px] flex items-center justify-center font-dm-sans text-[20px] hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
            <div className="absolute top-[16px] left-[16px] z-10 bg-black/50 px-[16px] py-[8px] rounded-[8px]">
              <p className="font-dm-sans text-white text-[16px]">{selectedRoom.name}</p>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  )
}
