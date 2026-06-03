import Image from 'next/image'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

export default function NewsSection() {
  const t = useTranslations('NewsSection')

  const SIDE_NEWS = [
    { title: t('side1'), image: '/images/figma-news-2.jpg' },
    { title: t('side2'), image: '/images/figma-news-2.jpg' },
    { title: t('side3'), image: '/images/figma-news-2.jpg' },
    { title: t('side4'), image: '/images/figma-news-2.jpg' },
  ]

  return (
    <section className="py-[80px] bg-[#fbf7ee]">
      <div className="flex flex-col gap-[80px] items-center justify-center">

        {/* Header */}
        <div className="flex flex-col gap-[12px] text-center w-full px-[80px]">
          <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">
            {t('title')}
          </h2>
          <p className="font-dm-sans text-[20px] text-[#594522] leading-none">
            {t('subtitle')}
          </p>
        </div>

        {/* Content row — fixed 1352px, mirrors Figma exactly */}
        <div className="flex gap-[37px] items-center justify-center w-[1352px]">

          {/* Left featured card: flex-1 resolves to ~683px, h-588, overflow clipped */}
          <div className="flex-1 min-w-0 h-[588px] relative overflow-hidden bg-white">

            {/* Image: 760×516, overflows right — clipped by parent overflow-hidden */}
            <div className="absolute top-[-4px] left-0 w-[760px] h-[516px]">
              <Image
                src="/images/figma-news-1.jpg"
                alt={t('featuredTitle')}
                fill
                className="object-cover pointer-events-none"
                sizes="760px"
              />
            </div>

            {/* White frosted caption at bottom, full container width */}
            <div className="absolute bottom-0 left-0 w-full flex flex-col gap-[12px] items-end p-[24px] bg-white/90 backdrop-blur-[6.45px]">
              <p className="font-dm-sans font-medium text-[16px] text-black leading-[1.5] w-full">
                {t('featuredTitle')}
              </p>
              <Link
                href="/"
                className="flex items-center justify-center h-[32px] px-[12px] py-[8px] border border-[#b89148] rounded-[12px] overflow-hidden shrink-0"
              >
                <span className="font-dm-sans text-[12px] text-[#594522] px-[8px]">
                  {t('readMore')}
                </span>
                <ArrowRight size={16} className="text-[#594522] -scale-x-100" />
              </Link>
            </div>
          </div>

          {/* Right: 4 stacked news items, fixed 632px */}
          <div className="shrink-0 w-[632px] flex flex-col items-start justify-center">
            {SIDE_NEWS.map((item, i) => (
              <div
                key={i}
                className="flex items-center w-full bg-white overflow-hidden"
                style={{
                  borderBottom: `0.5px solid ${i < 3 ? 'rgba(89,69,34,0.8)' : 'rgba(89,69,34,0.2)'}`,
                }}
              >
                {/* Thumbnail */}
                <div className="relative shrink-0 w-[240px] h-[147px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover pointer-events-none"
                    sizes="240px"
                  />
                </div>
                {/* Text + chevron */}
                <div className="flex flex-1 gap-[10px] items-center justify-center pl-[22px] pr-[12px] py-[12px] min-w-0">
                  <p className="flex-1 font-dm-sans font-normal text-[16px] text-[#050505] leading-[1.5] min-w-0">
                    {item.title}
                  </p>
                  <ChevronRight size={24} className="shrink-0 text-[#594522]" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
