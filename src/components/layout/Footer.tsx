import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('Footer')

  const LEFT_COLS = [
    {
      heading: t('aboutUs'),
      links: [t('ourMission'), t('news'), t('jobOpportunity')],
    },
    {
      heading: t('packagesPromotions'),
      links: [t('hotPromotion'), t('packages')],
    },
    {
      heading: t('actions'),
      links: [t('bookAppointment'), t('sendInquiry'), t('ourDoctors'), t('viewClinics')],
    },
  ]

  const RIGHT_COLS = [
    {
      heading: t('contactUs'),
      links: ['(+855) 016 593 789', '(+855) 012 593 789', 'Orienda@gmail.com'],
      underline: true,
      gap: 12,
    },
    {
      heading: t('emergency'),
      links: ['(+855) 023 232 789', '(+855) 078 233 789', '(+855) 096 6233 789'],
      underline: true,
      gap: 12,
    },
    {
      heading: t('address'),
      links: ['66, Street 31cc, 3, Phnom Penh 120605', '66, Street 31cc, 3, Phnom Penh 120605'],
      underline: true,
      gap: 12,
    },
    {
      heading: t('open'),
      links: [t('hours24')],
      underline: true,
      gap: 0,
    },
    {
      heading: t('socialMedia'),
      links: ['Facebook', 'Facebook', 'Facebook', 'Facebook', 'Facebook', 'Facebook'],
      underline: false,
      gap: 4,
    },
  ]

  return (
    <footer className="w-full bg-gold-900 p-[80px]">
      <div className="flex flex-col xl:flex-row gap-[80px] items-start xl:items-end w-full">

        {/* Left column — brand + nav */}
        <div className="flex flex-col gap-[40px] shrink-0 xl:w-[578px]">

          <div className="flex flex-col font-cormorant font-bold text-gold-50 leading-none">
            <p className="text-[128px] leading-none">ORIENDA</p>
            <p className="text-[64px] leading-none">International Hospital</p>
          </div>

          <div className="flex flex-col gap-[40px]">
            {LEFT_COLS.map((col) => (
              <div key={col.heading} className="flex items-start justify-between w-full">
                <p className="font-cormorant font-semibold text-[24px] text-gold-50 leading-none shrink-0">
                  {col.heading}
                </p>
                <div className="flex flex-col text-right">
                  {col.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="font-dm-sans font-light text-[16px] text-gold-200 leading-[1.5] hover:text-gold-50 transition-colors"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — contact/social */}
        <div className="flex flex-col gap-[40px] flex-1">
          {RIGHT_COLS.map((col) => (
            <div key={col.heading} className="flex items-start justify-between w-full">
              <p className="font-cormorant font-semibold text-[24px] text-gold-50 leading-none shrink-0 whitespace-nowrap">
                {col.heading}
              </p>
              <div className="flex flex-col items-end" style={{ gap: col.gap }}>
                {col.links.map((link, i) => (
                  <a
                    key={i}
                    href="#"
                    className="font-dm-sans font-normal text-[16px] text-gold-200 leading-none hover:text-gold-50 transition-colors"
                    style={{ textDecoration: col.underline ? 'underline' : 'none' }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </footer>
  )
}
