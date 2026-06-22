import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'

export default async function FacilitiesSection() {
  const t = await getTranslations('FacilitiesSection')
  return (
    <section className="w-full overflow-hidden">
      <div className="page-shell flex flex-col gap-[32px] lg:gap-[46px] items-center pt-[48px] lg:pt-[78px] pb-[48px] lg:pb-[80px]">

        {/* Header */}
        <div className="flex flex-col gap-[12px] lg:gap-[16px] items-start w-full">
          <h2 className="font-cormorant font-bold text-[36px] lg:text-[48px] text-[#3b2d17] leading-none">
            {t('title')}
          </h2>
          <p className="font-dm-sans text-[16px] lg:text-[20px] text-[#594522]">
            {t('subtitle')}
          </p>
        </div>

        {/* Mobile layout */}
        <div className="flex flex-col gap-[24px] w-full lg:hidden">
          {/* Large facility image */}
          <div className="relative overflow-hidden rounded-[16px] w-full" style={{ height: 220, boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)', background: '#f9f9f9' }}>
            <Image src="/images/facility-main.jpg" alt="Orienda Facilities" fill className="object-cover" sizes="100vw" priority />
          </div>
          {/* Visit text + button */}
          <div className="flex flex-col gap-[16px] text-[#3b2d17]">
            <p className="font-cormorant font-bold text-[28px] leading-none">{t('visitTitle')}</p>
            <p className="font-dm-sans font-light text-[16px] leading-[1.5]">{t('visitDesc')}</p>
          </div>
          <Link href="/360-tour" className="flex items-center justify-center gap-[8px] bg-[#b89148] text-white rounded-[12px] font-dm-sans text-[16px] px-[24px] py-[14px] hover:bg-[#c8a25a] transition-colors self-start">
            {t('discoverMore')}
            <ArrowRight size={18} />
          </Link>
          {/* See More pill */}
          <div className="flex justify-center pt-[8px]">
            <Link href="/about" className="px-8 py-3 bg-transparent rounded-[32px] outline outline-[1.5px] outline-offset-[-1.5px] outline-[#b89148] inline-flex justify-center items-center font-dm-sans text-base font-normal text-[#5c4924] hover:bg-[#b89148]/10 transition-colors">
              See More
            </Link>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex gap-[40px] items-start w-full">

          {/* Left: Visit text block */}
          <div className="flex gap-[40px] items-center shrink-0">
            <div className="flex flex-col gap-[40px] items-start w-[378px]">
              <div className="flex flex-col gap-[24px] text-[#3b2d17]">
                <p className="font-cormorant font-bold text-[48px] leading-none">{t('visitTitle')}</p>
                <p className="font-dm-sans font-light text-[24px] leading-[1.5]">
                  {t('visitDesc')}
                </p>
              </div>
              <Link
                href="/360-tour"
                className="flex items-center justify-center gap-[8px] bg-[#b89148] text-white rounded-[12px] font-dm-sans text-[20px] px-[24px] py-[16px] hover:bg-[#c8a25a] transition-colors"
              >
                {t('discoverMore')}
                <ArrowRight size={20} />
              </Link>
            </div>

            {/* Center: large facility photo */}
            <div
              className="relative overflow-hidden rounded-[16px] shrink-0"
              style={{ width: 517, height: 421, boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)', background: '#f9f9f9' }}
            >
              <Image
                src="/images/facility-main.jpg"
                alt="Orienda Facilities"
                fill
                className="object-cover"
                sizes="517px"
                priority
              />
            </div>
          </div>

          {/* Right: small image + text card */}
          <div className="flex flex-col gap-[16px] items-end flex-1">
            <div
              className="relative overflow-hidden rounded-[16px] shrink-0 w-full"
              style={{ height: 227, maxWidth: 338, boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)', background: '#f9f9f9' }}
            >
              <Image
                src="/images/facility-small.jpg"
                alt="Medical Facilities"
                fill
                className="object-cover"
                sizes="338px"
              />
            </div>
            <div className="flex flex-col gap-[24px] items-start text-[#3b2d17] w-full max-w-[338px]">
              <p className="font-cormorant font-bold text-[24px] leading-none">{t('facilitiesTitle')}</p>
              <p className="font-dm-sans text-[16px] leading-[1.5]">
                {t('facilitiesDesc')}
              </p>
            </div>
            <Link
              href="/about"
              className="flex items-center justify-center bg-[#b89148] text-white rounded-[12px] font-dm-sans text-[16px] px-[24px] py-[12px] hover:bg-[#c8a25a] transition-colors"
            >
              {t('discoverMore')}
            </Link>
          </div>

        </div>

      </div>
    </section>
  )
}
