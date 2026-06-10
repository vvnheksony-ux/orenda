import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import BookAppointmentButton from '@/components/shared/BookAppointmentButton'

export default async function AboutHero() {
  const t = await getTranslations('AboutHero')
  return (
    <div className="flex items-stretch justify-between gap-[40px] w-full rounded-[24px] bg-white overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.10)] min-h-[472px]">

      {/* Left — text content */}
      <div className="flex flex-col gap-[32px] justify-center py-[56px] pl-[64px] pr-[32px] flex-1 min-w-0">
        {/* Eyebrow */}
        <p className="font-dm-sans text-[16px] text-[#b89148] uppercase tracking-widest leading-none">
          {t('eyebrow')}
        </p>

        <h1 className="font-cormorant font-bold text-[52px] text-[#3b2d17] leading-tight">
          {t('title')}
        </h1>

        <div className="font-dm-sans font-light text-[20px] text-[#594522] leading-[1.6] flex flex-col gap-[12px]">
          <p>{t('desc1')}</p>
          <p>{t('desc2')}</p>
        </div>

        <BookAppointmentButton
          label={t('bookAppointment')}
          className="flex items-center gap-[8px] w-fit h-[48px] px-[24px] py-[14px] border-[1.5px] border-[#b89148] rounded-[12px] hover:bg-[#b89148] hover:text-[#5c4924] font-dm-sans text-[18px] text-[#5c4924] transition-all duration-200"
        />
      </div>

      {/* Right — hospital image */}
      <div className="relative shrink-0 w-[560px] self-stretch">
        <Image
          src="/images/about/about-hero-3.jpg"
          alt="Orienda International Hospital"
          fill
          className="object-cover"
          sizes="560px"
          priority
        />
      </div>
    </div>
  )
}
