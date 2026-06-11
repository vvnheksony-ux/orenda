import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

export default async function VisionMission() {
  const t = await getTranslations('VisionMission')

  return (
    <div className="flex flex-col gap-[40px] w-full">

      {/* Header */}
      <div className="flex flex-col gap-3 text-center w-full">
        <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">{t('title')}</h2>
        <p className="font-dm-sans text-[20px] text-[#594522] leading-none">{t('subtitle')}</p>
      </div>

      {/* Vision: image left, text card right overlapping */}
      <div className="relative w-full" style={{ height: '459px' }}>
        <div
          className="absolute left-0 top-0 rounded-[22px] overflow-hidden bg-white shadow-[0px_3.6px_27px_10.8px_rgba(220,189,114,0.12)]"
          style={{ width: '51%', height: '459px', zIndex: 10 }}
        >
          <Image src="/images/about/about-vision.jpg" alt="Our Vision" fill className="object-cover" sizes="51vw" />
        </div>
        <div
          className="absolute flex flex-col justify-center gap-[22px] bg-[#fbf7ee] rounded-[22px] shadow-[0px_3.6px_27px_10.8px_rgba(138,124,88,0.12)]"
          style={{ left: '44%', right: 0, top: '74px', minHeight: '310px', paddingLeft: '126px', paddingRight: '36px', paddingTop: '36px', paddingBottom: '36px', zIndex: 0 }}
        >
          <h3 className="font-cormorant font-bold text-[43px] text-black leading-none">{t('visionTitle')}</h3>
          <p className="font-dm-sans font-normal text-[22px] text-black leading-[1.5]">{t('visionDesc')}</p>
        </div>
      </div>

      {/* Mission: text card left, image right overlapping */}
      <div className="relative w-full" style={{ height: '431px' }}>
        <div
          className="absolute right-0 top-0 rounded-[22px] overflow-hidden bg-white shadow-[0px_3.6px_27px_10.8px_rgba(220,189,114,0.12)]"
          style={{ width: '53%', height: '431px', zIndex: 10 }}
        >
          <Image src="/images/about/about-mission.jpg" alt="Our Mission" fill className="object-cover" sizes="53vw" />
        </div>
        <div
          className="absolute flex flex-col justify-center gap-[22px] bg-[#fbf7ee] rounded-[22px] shadow-[0px_3.6px_27px_10.8px_rgba(138,124,88,0.12)]"
          style={{ left: 0, right: '42%', top: '63px', minHeight: '305px', paddingLeft: '36px', paddingRight: '66px', paddingTop: '36px', paddingBottom: '36px', zIndex: 0 }}
        >
          <h3 className="font-cormorant font-bold text-[43px] text-black leading-none">{t('missionTitle')}</h3>
          <p className="font-dm-sans font-normal text-[22px] text-black leading-[1.5]">{t('missionDesc')}</p>
        </div>
      </div>

    </div>
  )
}
