import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { RevealGroup, RevealItem } from '@/components/shared/Reveal'

export default async function VisionMission() {
  const t = await getTranslations('VisionMission')

  return (
    <RevealGroup className="flex flex-col gap-[40px] w-full">

      {/* Header */}
      <RevealItem className="flex flex-col gap-3 text-center w-full">
        <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none">{t('title')}</h2>
        <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522] leading-none">{t('subtitle')}</p>
      </RevealItem>

      {/* Vision: image left, text card right overlapping */}
      <RevealItem className="flex flex-col gap-6 w-full lg:relative md:block lg:min-h-[500px]">
        <div className="relative lg:absolute left-0 top-0 rounded-[22px] overflow-hidden bg-white shadow-[0px_3.6px_27px_10.8px_rgba(220,189,114,0.12)] h-[240px] sm:h-[320px] lg:h-[459px] w-full lg:w-[51%] z-20">
          <Image src="/images/about/about-vision.jpg" alt="Our Vision" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 51vw" />
        </div>
        <div className="relative lg:absolute flex flex-col justify-center gap-4 lg:gap-[22px] bg-[#fbf7ee] rounded-[22px] shadow-[0px_3.6px_27px_10.8px_rgba(138,124,88,0.12)] px-5 py-6 sm:px-8 lg:pl-[12%] lg:pr-[6%] lg:py-[36px] w-full lg:w-auto lg:left-[43%] lg:right-0 lg:top-[112px] lg:min-h-[310px] z-10">
          <h3 className="font-cormorant font-bold text-[32px] sm:text-[38px] lg:text-[43px] text-[#3b2d17] leading-none">{t('visionTitle')}</h3>
          <p className="font-dm-sans font-normal text-[16px] sm:text-[18px] lg:text-[22px] text-[#3b2d17] leading-[1.5]">{t('visionDesc')}</p>
        </div>
      </RevealItem>

      {/* Mission: text card left, image right overlapping */}
      <RevealItem className="flex flex-col gap-6 w-full lg:relative md:block lg:min-h-[472px] -mt-[20px]">
        <div className="relative lg:absolute right-0 top-0 rounded-[22px] overflow-hidden bg-white shadow-[0px_3.6px_27px_10.8px_rgba(220,189,114,0.12)] h-[240px] sm:h-[320px] lg:h-[431px] w-full lg:w-[54%] order-1 lg:order-2 z-20">
          <Image src="/images/about/about-mission.jpg" alt="Our Mission" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 54vw" />
        </div>
        <div className="relative lg:absolute flex flex-col justify-center gap-4 lg:gap-[22px] bg-[#fbf7ee] rounded-[22px] shadow-[0px_3.6px_27px_10.8px_rgba(138,124,88,0.12)] px-5 py-6 sm:px-8 lg:pl-[3%] lg:pr-[18%] lg:py-[36px] order-2 lg:order-1 w-full lg:w-auto lg:left-0 lg:right-[43%] lg:top-[110px] lg:min-h-[305px] z-10">
          <h3 className="font-cormorant font-bold text-[32px] sm:text-[38px] lg:text-[43px] text-[#3b2d17] leading-none">{t('missionTitle')}</h3>
          <p className="font-dm-sans font-normal text-[16px] sm:text-[18px] lg:text-[22px] text-[#3b2d17] leading-[1.5]">{t('missionDesc')}</p>
        </div>
      </RevealItem>

    </RevealGroup>
  )
}
