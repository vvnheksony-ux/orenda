import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

const CLINICS = [
  { name: 'Obstetric',      image: '/images/specialty-obstetric.png',  circle: true  },
  { name: 'Gynecology',     image: '/images/specialty-gynecology.png', circle: true  },
  { name: 'Imaging Center', image: '/images/specialty-imaging.png',    circle: false },
  { name: 'Neuro Surgery',  image: '/images/specialty-neuro.png',      circle: false },
  { name: 'Pediatric',      image: '/images/specialty-pediatric.png',  circle: false },
  { name: 'Cardiology',     image: '/images/specialty-neuro.png',      circle: false },
  { name: 'Orthopedics',    image: '/images/specialty-neuro.png',      circle: false },
]

export default function ClinicSection() {
  return (
    <section className="w-full px-[40px] xl:px-[46px] pt-[120px] pb-[80px]">
      <div className="flex flex-col gap-[40px] items-center">

        <div className="flex flex-col gap-[24px] items-center">
          <h2 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none text-center whitespace-nowrap">
            Clinic &amp; Centered
          </h2>
          <p className="font-dm-sans text-[20px] text-gold-800 text-center">
            Choose an option below to quickly find the service you need
          </p>
        </div>

        <div className="grid grid-cols-4 gap-[20px] max-w-[1100px] mx-auto w-full">
          {CLINICS.map((clinic) => (
            <button
              key={clinic.name}
              className="aspect-square flex flex-col gap-[20px] items-center justify-center rounded-[12px] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity w-full"
              style={{
                background: 'rgba(245,236,212,0.20)',
                boxShadow: '0px 4px 12px 3px rgba(89,69,34,0.20)',
              }}
            >
              <div
                className="relative shrink-0 overflow-hidden"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: clinic.circle ? 9999 : 0,
                  background: clinic.circle ? '#ffffff' : 'transparent',
                }}
              >
                <Image
                  src={clinic.image}
                  alt={clinic.name}
                  fill
                  className="object-contain"
                  sizes="100px"
                />
              </div>
              <p className="font-cormorant font-bold text-[24px] text-neutral-800 leading-none whitespace-nowrap">
                {clinic.name}
              </p>
            </button>
          ))}

          {/* See More */}
          <button
            className="aspect-square flex items-center justify-center gap-[8px] rounded-[12px] cursor-pointer hover:opacity-90 transition-opacity w-full"
            style={{
              background: 'rgba(184,145,72,0.60)',
              boxShadow: '0px 4px 12px 3px rgba(89,69,34,0.20)',
            }}
          >
            <p className="font-cormorant font-bold text-[24px] text-gold-50 leading-none whitespace-nowrap">
              See More
            </p>
            <ChevronRight className="w-[24px] h-[24px] text-gold-50" strokeWidth={1.5} />
          </button>
        </div>

      </div>
    </section>
  )
}
