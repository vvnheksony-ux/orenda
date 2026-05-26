import Image from 'next/image'
import { ArrowRight, ChevronRight } from 'lucide-react'

const SIDE_NEWS = [
  { title: 'ACLEDA Bank Teams Up with GreenTech Solutions to Launch Sustainable Financing Programs for Small Businesses', image: '/images/news-thumb-1.jpg' },
  { title: 'ACLEDA Bank Collaborates with Orienda International Hospital on Providing the International Quality Standards for Health Services', image: '/images/news-thumb-1.jpg' },
  { title: 'ACLEDA Bank Introduces New Mobile Banking Features to Enhance Customer Convenience and Security', image: '/images/news-thumb-1.jpg' },
  { title: 'ACLEDA Bank Introduces New Mobile Banking Features to Enhance Customer Convenience and Security', image: '/images/news-thumb-1.jpg' },
]

export default function NewsSection() {
  return (
    <section className="w-full py-[80px] px-[40px] xl:px-[46px]">
      <div className="max-w-[1352px] mx-auto flex flex-col gap-[60px]">

        <h2 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none text-center">
          News
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_533px] gap-[40px] xl:gap-[52px]">

          {/* Main news item */}
          <div className="relative group cursor-pointer h-[578px] rounded-[12px] overflow-hidden shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] border border-[rgba(234,214,164,0.60)]">
            <Image
              src="/images/news-featured.jpg"
              alt="News Featured"
              fill
              className="object-cover"
              sizes="800px"
            />
            {/* Overlay content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-[40px] gap-[20px]">
              <p className="font-dm-sans font-medium text-[16px] text-white/80 uppercase tracking-wider">
                Medical News — May 24, 2026
              </p>
              <h3 className="font-cormorant font-bold text-[32px] text-white leading-tight">
                Cambodian Oknha Association, Orienda International Hospital Signing MoU for Strategic Healthcare Partnership
              </h3>
              <div className="flex items-center gap-[12px] text-white font-dm-sans font-medium">
                Read More
                <div className="w-[32px] h-[32px] rounded-full bg-gold-500 flex items-center justify-center">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Side news list */}
          <div className="flex flex-col gap-[20px]">
            {SIDE_NEWS.map((item, i) => (
              <div
                key={i}
                className="group flex gap-[20px] items-center p-[20px] bg-white rounded-[12px] shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] border border-[rgba(234,214,164,0.60)] cursor-pointer hover:bg-gold-50/10 transition-colors"
              >
                <div className="relative w-[130px] h-[100px] shrink-0 rounded-[8px] overflow-hidden">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex flex-col gap-[8px] flex-1">
                  <p className="font-cormorant font-bold text-[18px] text-gold-900 leading-tight line-clamp-3">
                    {item.title}
                  </p>
                  <ChevronRight className="w-5 h-5 text-gold-500 shrink-0" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
