'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAnalytics } from '@/lib/use-analytics'
import { Link } from '@/i18n/routing'
import BookAppointmentModal from '@/components/shared/BookAppointmentModal'

export default function Footer() {
  const t = useTranslations('Footer')
  const { trackCallClick } = useAnalytics()
  const [bookOpen, setBookOpen] = useState(false)

  const LEFT_COLS = [
    {
      heading: t('aboutUs'),
      items: [
        { label: t('ourMission'), href: '/about' as const },
        { label: t('news'), href: '/news' as const },
        { label: t('jobOpportunity'), href: '/career' as const },
      ],
    },
    {
      heading: t('packagesPromotions'),
      items: [
        { label: t('hotPromotion'), href: '/promotions' as const },
        { label: t('packages'), href: '/promotions' as const },
      ],
    },
    {
      heading: t('actions'),
      items: [
        { label: t('bookAppointment'), href: null },
        { label: t('sendInquiry'), href: '/inquiry' as const },
        { label: t('ourDoctors'), href: '/doctors' as const },
        { label: t('viewClinics'), href: '/departments' as const },
      ],
    },
  ]

  const CONTACT_PHONES = ['(+855) 016 593 789', '(+855) 012 593 789']
  const CONTACT_EMAIL = 'Orienda@gmail.com'
  const EMERGENCY_PHONES = ['(+855) 023 232 789', '(+855) 078 233 789', '(+855) 096 6233 789']
  const ADDRESSES = [
    { name: 'Orienda Hospital (Duong Ngeap)', label: '66, Street 31cc, 3, Phnom Penh 120605', mapUrl: 'https://maps.google.com/?q=Phnom+Penh+Cambodia' },
    { name: 'Orienda Hospital (Chaktomuk)', label: '66, Street 31cc, 3, Phnom Penh 120605', mapUrl: 'https://maps.google.com/?q=Phnom+Penh+Cambodia' },
  ]
  const SOCIAL = [
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
    { label: 'TikTok', href: 'https://tiktok.com' },
    { label: 'Telegram', href: 'https://t.me' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
  ]

  const itemRightCls = "font-dm-sans font-light text-[15px] xl:text-[16px] text-gold-200 leading-[1.6] hover:text-gold-50 transition-colors text-right"
  const contactItemCls = "font-dm-sans font-normal text-[15px] xl:text-[16px] text-gold-200 leading-none hover:text-gold-50 transition-colors underline"
  const headingCls = "font-cormorant font-semibold text-[18px] xl:text-[24px] text-gold-50 leading-none shrink-0"

  return (
    <>
    <footer className="w-full bg-gold-900 px-[48px] py-[48px] xl:p-[80px]">
      <div className="flex flex-row flex-wrap items-end gap-12 xl:gap-[80px] w-full">

        {/* Left column — brand + nav */}
        <div className="flex-1 min-w-[160px] flex flex-col gap-[23.74px] xl:gap-[40px]">

          <Link href="/" className="flex flex-col font-cormorant font-bold text-gold-50 leading-none hover:opacity-90 transition-opacity">
            <p className="text-[60px] xl:text-[128px] leading-none">ORIENDA</p>
            <p className="text-[36px] xl:text-[64px] leading-none">{t('internationalHospital')}</p>
          </Link>

          <div className="flex flex-col gap-[23.74px] xl:gap-[40px]">
            {LEFT_COLS.map((col) => (
              <div key={col.heading} className="flex items-start justify-between w-full">
                <p className={headingCls}>{col.heading}</p>
                <div className="flex flex-col items-end">
                  {col.items.map(({ label, href }) =>
                    href === null ? (
                      <button
                        key={label}
                        onClick={() => { trackCallClick('footer'); setBookOpen(true) }}
                        className={itemRightCls}
                      >
                        {label}
                      </button>
                    ) : (
                      <Link key={label} href={href} className={itemRightCls}>{label}</Link>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — contact/social */}
        <div className="w-full xl:flex-1 flex flex-col gap-[23.74px] xl:gap-[40px]">

          {/* Contact Us */}
          <div className="flex items-start justify-between w-full">
            <p className={headingCls}>{t('contactUs')}</p>
            <div className="flex flex-col items-end gap-2 xl:gap-[12px]">
              {CONTACT_PHONES.map(p => (
                <a key={p} href={`tel:${p.replace(/\D/g,'')}`} onClick={() => trackCallClick('footer')}
                  className={contactItemCls}>{p}</a>
              ))}
              <a href={`mailto:${CONTACT_EMAIL}`} className={contactItemCls}>{CONTACT_EMAIL}</a>
            </div>
          </div>

          {/* Emergency */}
          <div className="flex items-start justify-between w-full">
            <p className={headingCls}>{t('emergency')}</p>
            <div className="flex flex-col items-end gap-2 xl:gap-[12px]">
              {EMERGENCY_PHONES.map(p => (
                <a key={p} href={`tel:${p.replace(/\D/g,'')}`} onClick={() => trackCallClick('footer')}
                  className={contactItemCls}>{p}</a>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start justify-between w-full">
            <p className={headingCls}>{t('address')}</p>
            <div className="flex flex-col items-end gap-2 xl:gap-[12px]">
              {ADDRESSES.map(({ name, label, mapUrl }, i) => (
                <a key={i} href={mapUrl} target="_blank" rel="noopener noreferrer"
                  className={contactItemCls}>
                  {name}<br />{label}
                </a>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-start justify-between w-full">
            <p className={headingCls}>{t('open')}</p>
            <p className={contactItemCls}>{t('hours24')}</p>
          </div>

          {/* Social Media */}
          <div className="flex items-start justify-between w-full">
            <p className={headingCls}>{t('socialMedia')}</p>
            <div className="flex flex-col items-end gap-[4px]">
              {SOCIAL.map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="font-dm-sans font-normal text-[15px] xl:text-[16px] text-gold-200 leading-none hover:text-gold-50 transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
    <BookAppointmentModal open={bookOpen} onClose={() => setBookOpen(false)} />
    </>
  )
}
