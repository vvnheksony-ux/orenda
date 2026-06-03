import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'

const INSURERS = [
  { name: 'Mekong Microinsurance' },
  { name: 'Mekong Microinsurance' },
  { name: 'Mekong Microinsurance' },
  { name: 'Mekong Microinsurance' },
  { name: 'Indochina Coverage Partners' },
  { name: 'Indochina Coverage Partners' },
  { name: 'River Delta Assurance' },
  { name: 'River Delta Assurance' },
]

export default function InsurancePage() {
  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="flex flex-col gap-[80px] items-center pb-[120px] px-[80px] pt-[120px] 2xl:pt-[196px]">

          {/* Hero slider card */}
          <div className="flex gap-[16px] h-[472px] items-center justify-center w-full">
            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronLeft size={40} />
            </button>

            <div className="bg-white flex h-[472px] items-center justify-end overflow-hidden relative rounded-[16px] flex-1 max-w-[1352px]">
              {/* Hospital image */}
              <div className="relative h-[448px] rounded-[16px] shrink-0 w-[650px] overflow-hidden mr-[12px]">
                <Image
                  src="/images/insurance/hero-3.jpg"
                  alt="Orienda International Hospital"
                  fill
                  className="object-cover rounded-[16px]"
                  sizes="650px"
                  priority
                />
              </div>
              {/* Text */}
              <div className="absolute left-[58px] top-[79px] flex flex-col gap-[40px] items-start w-[618px]">
                <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">
                  Orienda International Hospital
                </h1>
                <div className="font-dm-sans font-light text-[24px] text-[#594522] leading-[1.4]">
                  <p className="mb-[12px]">We dedicated to providing safe and reliable medical services.</p>
                  <p>Schedule and appointment to experience world-class healthcare.</p>
                </div>
                <Link
                  href="/about"
                  className="flex items-center h-[48px] px-[20px] py-[14px] border-[1.5px] border-[#b89148] rounded-[12px] gap-[4px]"
                >
                  <span className="font-dm-sans text-[18px] text-[#5c4924] px-[8px]">Learn More</span>
                  <ArrowRight size={20} className="text-[#5c4924]" />
                </Link>
              </div>
            </div>

            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronRight size={40} />
            </button>
          </div>

          {/* Insurance section */}
          <div className="flex flex-col gap-[40px] items-center w-full">

            {/* Header */}
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">
                Insurance
              </h2>
              <p className="font-dm-sans text-[20px] text-[#594522] capitalize w-full">
                What do we accept?
              </p>
            </div>

            {/* Cards grid — 2 columns, 4 rows */}
            <div className="flex flex-wrap gap-[40px] items-center justify-center w-full">
              {INSURERS.map((ins, i) => (
                <div
                  key={i}
                  className="bg-white flex flex-1 gap-[40px] items-center min-w-[560px] overflow-hidden px-[40px] py-[24px] rounded-[16px]"
                  style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}
                >
                  <div className="relative shrink-0 size-[120px]">
                    <Image
                      src="/images/insurance/insurance-logo.png"
                      alt={ins.name}
                      fill
                      className="object-contain"
                      sizes="120px"
                    />
                  </div>
                  <p className="font-dm-sans font-normal text-[24px] text-black text-center whitespace-nowrap">
                    {ins.name}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
