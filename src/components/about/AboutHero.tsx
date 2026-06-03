import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function AboutHero() {
  return (
    <div className="flex gap-[16px] h-[472px] items-center justify-center w-full">
      {/* Left arrow */}
      <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
        <ChevronLeft size={40} />
      </button>

      {/* Main card */}
      <div className="bg-white flex h-[472px] items-center justify-end overflow-hidden relative rounded-[16px] flex-1 max-w-[1352px]">
        {/* Hospital image — right side */}
        <div className="relative h-[448px] rounded-[16px] shrink-0 w-[650px] overflow-hidden">
          <Image
            src="/images/about/about-hero-3.jpg"
            alt="Orienda International Hospital"
            fill
            className="object-cover rounded-[16px]"
            sizes="650px"
          />
        </div>

        {/* Text block — absolute left */}
        <div className="absolute left-[58px] top-[79px] flex flex-col gap-[40px] items-start w-[618px]">
          <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">
            Orienda International Hospital
          </h1>
          <p className="font-dm-sans font-light text-[24px] text-[#594522] leading-[1.4]">
            We dedicated to providing safe and reliable medical services.{' '}
            Schedule and appointment to experience world-class healthcare.
          </p>
          <Link
            href="/about"
            className="flex items-center h-[48px] px-[20px] py-[14px] border-[1.5px] border-[#b89148] rounded-[12px] gap-[4px]"
          >
            <span className="font-dm-sans text-[18px] text-[#5c4924] px-[8px]">Learn More</span>
            <ArrowRight size={20} className="text-[#5c4924]" />
          </Link>
        </div>
      </div>

      {/* Right arrow */}
      <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
        <ChevronRight size={40} />
      </button>
    </div>
  )
}
