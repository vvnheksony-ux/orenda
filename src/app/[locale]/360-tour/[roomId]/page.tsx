'use client'

import Image from 'next/image'
import { Maximize2, ArrowRight } from 'lucide-react'
import { useState, use } from 'react'
import { notFound } from 'next/navigation'
import SiteLayout from '@/components/layout/SiteLayout'
import ThreeSixtyViewer from '@/components/shared/ThreeSixtyViewer'
import { Link } from '@/i18n/routing'
import { ROOMS } from '@/lib/rooms'

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)
  const room = ROOMS.find(r => r.id === roomId)
  if (!room) notFound()

  const [expanded, setExpanded] = useState(false)
  const [descParts] = useState(() => room.desc.split('\n\n'))

  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="flex flex-col gap-[80px] items-center pb-[120px] px-[80px] pt-[120px] 2xl:pt-[196px]">

          {/* 360 Viewer Banner */}
          <div
            className="relative w-full h-[598px] rounded-[24px] overflow-hidden shrink-0 backdrop-blur-[5px]"
            style={{ background: 'linear-gradient(180deg, rgba(245,236,212,0.1) 0%, rgba(184,145,72,0.1) 100%)' }}
          >
            <ThreeSixtyViewer src={room.src} />
            {/* Expand button */}
            <button
              onClick={() => setExpanded(true)}
              className="absolute bottom-[24px] right-[24px] z-20 size-[60px] rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <Maximize2 size={24} className="text-[#3b2d17]" />
            </button>
          </div>

          {/* Title + description + side photo */}
          <div className="flex gap-[40px] items-start w-full">
            {/* Left: title + text */}
            <div className="flex flex-col gap-[40px] items-center justify-center shrink-0 w-[744px]">
              <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none text-center w-full">
                {room.name}
              </h1>
              <div className="font-dm-sans font-normal text-[24px] text-black w-full">
                {descParts.map((p, i) => (
                  <p key={i} className="leading-[1.8] mb-[32px] last:mb-0">{p}</p>
                ))}
              </div>
            </div>
            {/* Right: first extra photo */}
            <div className="flex-1 min-w-0 h-[376px] overflow-hidden rounded-[12px] bg-[#f3f3f3] relative">
              <Image
                src={room.extraPhotos[0]}
                alt={room.name}
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
          </div>

          {/* 3 extra photos row */}
          <div className="flex gap-[40px] items-start w-full">
            {room.extraPhotos.slice(1).map((photo, i) => (
              <div key={i} className="flex-1 min-w-0 h-[376px] overflow-hidden rounded-[12px] bg-[#f3f3f3] relative">
                <Image
                  src={photo}
                  alt={`${room.name} ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              </div>
            ))}
          </div>

          {/* Meet Our Specialist */}
          <div className="flex flex-col gap-[40px] items-center w-full max-w-[1432px]">
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">Meet Our Specialist</h2>
              <p className="font-dm-sans text-[20px] text-[#594522]">Meet Our Specialists in This Department</p>
            </div>

            <div className="flex flex-wrap gap-[40px] items-center justify-center w-full">
              {room.doctors.map((doc, i) => (
                <div
                  key={i}
                  className="bg-[#fbf7ee] flex flex-col gap-[40px] h-[400px] items-center justify-center overflow-hidden relative rounded-[16px] shrink-0 w-[300px]"
                  style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-[206px] opacity-[0.64] pointer-events-none"
                    style={{ background: 'linear-gradient(133deg, rgba(234,214,164,0.6) 0%, rgba(184,145,72,0.8) 49%, rgba(234,214,164,0.6) 100%)' }}
                  />
                  <div className="relative rounded-full overflow-hidden shrink-0 size-[146px] bg-[#fbf7ee]" style={{ boxShadow: '0px 4px 30px 12px rgba(184,145,72,0.2)' }}>
                    <Image src="/images/centers/doctor-thumb.jpg" alt={doc.name} fill className="object-cover" sizes="146px" />
                  </div>
                  <div className="flex flex-col h-[145px] items-center justify-between shrink-0">
                    <div className="flex flex-col gap-[16px] items-center text-center text-[#3b2d17] capitalize overflow-hidden">
                      <p className="font-cormorant font-medium text-[24px] w-[217px] leading-none">{doc.name}</p>
                      <p className="font-dm-sans text-[16px] w-[186px] leading-none">{doc.specialty}</p>
                    </div>
                    <button className="bg-[#b89148] flex h-[32px] items-center justify-center overflow-hidden px-[12px] py-[8px] rounded-[12px] w-[145px]" style={{ boxShadow: '0px 2px 6px 6px rgba(0,0,0,0.05)' }}>
                      <span className="font-dm-sans text-[12px] text-[#fbf7ee]">View Profile</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/doctors"
              className="flex items-center h-[32px] px-[12px] py-[8px] border border-[#b89148] rounded-[12px] gap-[4px] w-[145px] justify-center"
              style={{ boxShadow: '0px 2px 6px 0px rgba(0,0,0,0.05)' }}
            >
              <span className="font-dm-sans text-[12px] text-[#5c4924]">See More</span>
              <ArrowRight size={16} className="text-[#5c4924]" />
            </Link>
          </div>

        </div>
      </div>

      {/* Full-screen modal */}
      {expanded && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setExpanded(false)}>
          <div className="relative w-[95vw] h-[90vh] rounded-[16px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <ThreeSixtyViewer src={room.src} />
            <button onClick={() => setExpanded(false)} className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 text-xl">✕</button>
          </div>
        </div>
      )}
    </SiteLayout>
  )
}
