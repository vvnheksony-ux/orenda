import { getTranslations } from 'next-intl/server'
import BookAppointmentButton from '@/components/shared/BookAppointmentButton'
import SideHeroCarousel from '@/components/shared/SideHeroCarousel'
import { DEFAULT_SHARED_HERO_SLIDES } from '@/components/shared/defaultHeroSlides'

export default async function AboutHero() {
  const t = await getTranslations('AboutHero')
  const cta = (
    <BookAppointmentButton
      label={t('bookAppointment')}
      className="inline-flex min-h-[34px] items-center gap-[8px] rounded-[10px] border-[1.5px] border-[#b89148] px-3 py-2 font-dm-sans text-[11px] text-[#5c4924] transition-all duration-200 hover:bg-[#b89148] hover:text-[#5c4924] sm:min-h-[46px] sm:rounded-[12px] sm:px-5 sm:py-3 sm:text-[15px] lg:min-h-[64px] lg:px-8 lg:text-[20px]"
    />
  )

  return (
    <SideHeroCarousel
      slides={DEFAULT_SHARED_HERO_SLIDES.map(slide => ({ ...slide, title: t('title'), lines: [t('desc1'), t('desc2')] as [string, string], cta }))}
    />
  )
}
