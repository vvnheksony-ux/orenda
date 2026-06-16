import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

export default async function VisionMission() {
  const t = await getTranslations('VisionMission')

  return (
    <div className="flex flex-col gap-[40px] w-full">

      {/* Header */}
      <div className="flex flex-col gap-3 text-center w-full">
        <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none">{t('title')}</h2>
        <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522] leading-none">{t('subtitle')}</p>
      </div>

      {/* Vision: image left, text card right overlapping */}
      <div className="flex flex-col gap-6 w-full lg:relative lg:block lg:min-h-[459px]">
        <div className="relative lg:absolute left-0 top-0 rounded-[22px] overflow-hidden bg-white shadow-[0px_3.6px_27px_10.8px_rgba(220,189,114,0.12)] h-[240px] sm:h-[320px] lg:h-[459px] w-full lg:w-[51%] z-10">
          <Image src="/images/about/about-vision.jpg" alt="Our Vision" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 51vw" />
        </div>
        <div className="relative lg:absolute flex flex-col justify-center gap-4 lg:gap-[22px] bg-[#fbf7ee] rounded-[22px] shadow-[0px_3.6px_27px_10.8px_rgba(138,124,88,0.12)] px-5 py-6 sm:px-8 lg:pl-[126px] lg:pr-[36px] lg:py-[36px] w-full lg:left-[44%] lg:right-0 lg:top-[74px] lg:min-h-[310px] z-0">
          <h3 className="font-cormorant font-bold text-[32px] sm:text-[38px] lg:text-[43px] text-black leading-none">{t('visionTitle')}</h3>
          <p className="font-dm-sans font-normal text-[16px] sm:text-[18px] lg:text-[22px] text-black leading-[1.5]">{t('visionDesc')}</p>
        </div>
      </div>

      {/* Mission: text card left, image right overlapping */}
      <div className="flex flex-col gap-6 w-full lg:relative lg:block lg:min-h-[431px]">
        <div className="relative lg:absolute right-0 top-0 rounded-[22px] overflow-hidden bg-white shadow-[0px_3.6px_27px_10.8px_rgba(220,189,114,0.12)] h-[240px] sm:h-[320px] lg:h-[431px] w-full lg:w-[53%] order-1 lg:order-2 z-10">
          <Image src="/images/about/about-mission.jpg" alt="Our Mission" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 53vw" />
        </div>
        <div className="relative lg:absolute flex flex-col justify-center gap-4 lg:gap-[22px] bg-[#fbf7ee] rounded-[22px] shadow-[0px_3.6px_27px_10.8px_rgba(138,124,88,0.12)] px-5 py-6 sm:px-8 lg:pl-[36px] lg:pr-[66px] lg:py-[36px] order-2 lg:order-1 w-full lg:left-0 lg:right-[42%] lg:top-[63px] lg:min-h-[305px] z-0">
          <h3 className="font-cormorant font-bold text-[32px] sm:text-[38px] lg:text-[43px] text-black leading-none">{t('missionTitle')}</h3>
          <p className="font-dm-sans font-normal text-[16px] sm:text-[18px] lg:text-[22px] text-black leading-[1.5]">{t('missionDesc')}</p>
        </div>
      </div>

    </div>
  )
}
