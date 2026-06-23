import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Patient Testimonials' }

import { getTranslations } from 'next-intl/server'
import SiteLayout from '@/components/layout/SiteLayout'
import Reveal from '@/components/shared/Reveal'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import FeedbackForm from '@/components/testimonials/FeedbackForm'
import TestimonialsCarousel from '@/components/testimonials/TestimonialsCarousel'

export default async function TestimonialsPage() {
  const t = await getTranslations('Testimonials')

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">
        <div className="flex flex-col items-center pb-[120px] pt-[100px] lg:pt-[212px] w-full">

          <div className="page-shell flex flex-col gap-[80px] items-center">
            {/* Hero */}
            <PromotionStyleHero
              slides={[
                { src: '/images/testimonials/hero-3.jpg', alt: 'Orienda International Hospital' },
                { src: '/images/hero-doctor.jpg', alt: 'Orienda patient care experience' },
              ]}
              title={t('heroTitle')}
              lines={[
                t('heroLine1'),
                t('heroLine2'),
              ]}
            />

            {/* Customer Feedback */}
            <div className="flex flex-col gap-[40px] items-start w-full">
              <div className="flex flex-col gap-[40px] items-start w-full">
                <Reveal className="flex flex-col gap-[12px] text-center w-full">
                  <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none w-full">{t('feedbackHeading')}</h2>
                  <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522] capitalize w-full">{t('feedbackSub')}</p>
                </Reveal>
                <div className="flex flex-col gap-[24px] items-start w-full max-w-[960px] mx-auto">
                  <p className="font-cormorant font-semibold text-[18px] lg:text-[20px] text-[#3b2d17] leading-tight capitalize w-full">
                    {t('feedbackIntro')}
                  </p>
                  <ul className="list-disc pl-[24px] flex flex-col gap-[8px] w-full">
                    <li className="font-dm-sans text-[16px] lg:text-[18px] text-[#594522] leading-normal">
                      <span className="font-semibold">{t('feedbackServiceLabel')}</span>{' '}{t('feedbackService')}
                    </li>
                    <li className="font-dm-sans text-[16px] lg:text-[18px] text-[#594522] leading-normal">
                      <span className="font-semibold">{t('feedbackSafetyLabel')}</span>{' '}{t('feedbackSafety')}
                    </li>
                    <li className="font-dm-sans text-[16px] lg:text-[18px] text-[#594522] leading-normal">
                      <span className="font-semibold">{t('feedbackEthicalLabel')}</span>{' '}{t('feedbackEthical')}
                    </li>
                    <li className="font-dm-sans text-[16px] lg:text-[18px] text-[#594522] leading-normal">
                      {t('feedbackCollection')}
                    </li>
                  </ul>
                </div>
              </div>
              <div className="w-full max-w-[960px] mx-auto">
                <FeedbackForm />
              </div>
            </div>
          </div>

          {/* Customer Testimonials - Full Bleed */}
          <div className="flex flex-col gap-[40px] items-center w-full mt-[80px]">
            <Reveal className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17] leading-none w-full">{t('testimonialsHeading')}</h2>
              <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522] capitalize w-full">{t('testimonialsSub')}</p>
            </Reveal>
            <TestimonialsCarousel />
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
