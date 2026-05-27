import Image from 'next/image'
import { ChevronRight, ArrowRight } from 'lucide-react'

const SIDE_NEWS = [
  { title: 'ACLEDA Bank Teams Up with GreenTech Solutions to Launch Sustainable Financing Programs for Small Businesses', image: '/images/news-thumb-1.jpg' },
  { title: 'ACLEDA Bank Collaborates with Orienda International Hospital on Providing the International Quality Standards for Health Services', image: '/images/news-thumb-1.jpg' },
  { title: 'ACLEDA Bank Introduces New Mobile Banking Features to Enhance Customer Convenience and Security', image: '/images/news-thumb-1.jpg' },
  { title: 'ACLEDA Bank Introduces New Mobile Banking Features to Enhance Customer Convenience and Security', image: '/images/news-thumb-1.jpg' },
]

export default function NewsSection() {
  return (
    <section className="w-full py-[120px] lg:py-[160px] px-[40px] xl:px-[80px]">
      <div className="max-w-[1800px] mx-auto flex flex-col gap-[60px]">

        {/* Heading */}
        <div className="flex flex-col gap-[20px] text-center w-full">
          <h2 className="font-cormorant font-bold text-[48px] lg:text-[64px] xl:text-[72px] text-gold-900 leading-none w-full">
            News
          </h2>
          <p className="font-dm-sans text-[20px] lg:text-[24px] xl:text-[26px] text-gold-800 leading-none w-full">
            A selected team of experts committed to your health
          </p>
        </div>

        {/* Content row */}
        <div className="flex flex-col lg:flex-row gap-[40px] xl:gap-[60px] items-stretch justify-center w-full">

          {/* Featured — 760×588, no border-radius, frosted caption */}
          <div className="relative bg-white overflow-hidden shrink-0 shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)]" style={{ width: 760, height: 588 }}>
            <div className="absolute left-0 w-[760px]" style={{ height: 516, top: -4 }}>
              <Image
                src="/images/news-featured.jpg"
                alt="Cambodian Oknha Association, Orienda International Hospital Signing MoU"
                fill
                className="object-cover"
                sizes="760px"
              />
            </div>
            {/* Frosted caption */}
            <div className="absolute bottom-0 left-0 w-full backdrop-blur-[6.45px] bg-[rgba(255,255,255,0.9)] p-[24px] flex flex-col gap-[12px] items-end">
              <p className="font-dm-sans font-medium text-[16px] text-black leading-[1.5] w-full">
                Cambodian Oknha Association , Orienda International Hospital Signing MoU
              </p>
              <button className="flex items-center gap-[8px] border border-gold-500 rounded-[12px] h-[32px] px-[12px] py-[8px] shrink-0 hover:bg-gold-50 transition-colors">
                <span className="font-dm-sans text-[12px] text-gold-800">Read More</span>
                <ArrowRight size={16} className="text-gold-800" />
              </button>
            </div>
          </div>

          {/* Side items — plain rows with border-b */}
          <div className="flex flex-col shrink-0" style={{ width: 632 }}>
            {SIDE_NEWS.map((item, i) => (
              <div
                key={i}
                className="bg-white flex items-center overflow-hidden cursor-pointer hover:bg-gold-50/30 transition-colors"
                style={{ borderBottom: i < SIDE_NEWS.length - 1 ? '0.5px solid rgba(89,69,34,0.8)' : '0.5px solid rgba(89,69,34,0.2)' }}
              >
                {/* Thumbnail — no border-radius */}
                <div className="relative shrink-0 overflow-hidden" style={{ width: 240, height: 147 }}>
                  <Image src={item.image} alt={item.title} fill className="object-cover" sizes="240px" />
                </div>
                {/* Text + chevron */}
                <div className="flex flex-1 gap-[10px] items-center justify-center pl-[22px] pr-[12px] py-[12px]">
                  <p className="flex-1 font-dm-sans text-[16px] text-neutral-black leading-[1.5]">
                    {item.title}
                  </p>
                  <ChevronRight className="shrink-0 w-[24px] h-[24px] text-gold-700" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
