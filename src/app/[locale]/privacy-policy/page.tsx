import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Privacy Policy' }

import { getTranslations } from 'next-intl/server'
import SiteLayout from '@/components/layout/SiteLayout'
import Reveal from '@/components/shared/Reveal'

export default async function PrivacyPolicyPage() {
  const t = await getTranslations('PrivacyPolicy')

  const SECTIONS = [
    { title: t('section1Title'), body: t('section1Body') },
    { title: t('section2Title'), body: t('section2Body') },
    { title: t('section3Title'), body: t('section3Body') },
    { title: t('section4Title'), body: t('section4Body') },
    { title: t('section5Title'), body: t('section5Body') },
    { title: t('section6Title'), body: t('section6Body') },
  ]
  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">
        <div className="narrow-shell flex flex-col gap-10 pb-[120px] pt-[90px] lg:pt-[150px]">
          <Reveal className="flex flex-col gap-3">
            <h1 className="font-cormorant font-bold text-[40px] lg:text-[52px] text-[#3b2d17] leading-none">{t('heading')}</h1>
            <p className="font-dm-sans text-[15px] text-[#6b5836]">{t('subtitle')}</p>
          </Reveal>

          <div className="flex flex-col gap-8">
            {SECTIONS.map((s) => (
              <section key={s.title} className="flex flex-col gap-2">
                <h2 className="font-cormorant font-bold text-[24px] lg:text-[28px] text-[#9a7838] leading-tight">{s.title}</h2>
                <p className="font-dm-sans text-[15px] lg:text-[16px] text-[#3b2d17] leading-[1.8]">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
