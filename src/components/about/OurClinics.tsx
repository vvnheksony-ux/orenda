import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { RevealGroup, RevealItem } from '@/components/shared/Reveal'

export default async function OurClinics() {
  const t = await getTranslations('OurClinics')
  return (
    <RevealGroup className="flex flex-col gap-[40px] items-end w-full max-w-[1356px]">

      {/* Title */}
      <RevealItem className="w-full">
        <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none text-center w-full">
          {t('title')}
        </h2>
      </RevealItem>

      {/* Image + first paragraph row */}
      <RevealItem className="flex flex-col lg:flex-row gap-6 lg:gap-[40px] items-start w-full">
        <div className="relative shrink-0 w-full lg:w-[536px] h-[260px] sm:h-[360px] lg:h-[510px] rounded-[24px] overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] bg-white">
          <Image
            src="/images/about/about-vision.jpg"
            alt="Our Clinics"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 536px"
          />
        </div>
        <p className="flex-1 font-dm-sans font-light text-[16px] sm:text-[18px] lg:text-[24px] text-[#3b2d17] leading-[1.8] min-w-0">
          {t('para1')}
        </p>
      </RevealItem>

      {/* Full-width second paragraph */}
      <RevealItem className="w-full">
        <p className="font-dm-sans font-light text-[16px] sm:text-[18px] lg:text-[24px] text-[#3b2d17] leading-[1.8] w-full">
          {t('para2')}
        </p>
      </RevealItem>

    </RevealGroup>
  )
}
