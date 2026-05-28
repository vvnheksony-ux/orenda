import Image from 'next/image'
import { useTranslations } from 'next-intl'

/* Figma: Two branch cards side by side, each 756px wide × 450px tall
   B1 (left): image fills card, info card overlaid at bottom
   B2 (right): image + semi-transparent cream overlay with info */

export default function MapSection() {
  const t = useTranslations('MapSection')

  return (
    <section className="flex flex-col lg:flex-row w-full h-[650px] overflow-hidden">
      
      {/* Left Side (Blur + Text) */}
      <div className="relative flex-1 overflow-hidden">
        <Image
          src="/images/branch-building.jpg"
          alt="Orienda International Hospital Chamkarmon Background"
          fill
          className="object-cover object-left"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {/* Full blur overlay - transparent with heavy glass blur */}
        <div 
          className="absolute inset-0 bg-white/30"
          style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        />
        
        {/* Info Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-[40px] lg:px-[60px] xl:px-[80px] z-10">
          <div className="max-w-[460px]">
            <h3 className="font-cormorant font-bold text-[32px] xl:text-[40px] text-[#3e2c1c] leading-[1.2] mb-4 drop-shadow-sm">
              {t('hospitalName')}<br />{t('branch')}
            </h3>
            <p className="font-dm-sans text-[16px] xl:text-[18px] text-[#3e2c1c] mb-6 font-medium">
              {t('address')}
            </p>
            <div className="flex flex-col gap-2 mb-8 font-medium">
              <p className="font-dm-sans text-[16px] xl:text-[18px] text-[#5e4b37]">
                {t('hours')}
              </p>
              <p className="font-dm-sans text-[16px] xl:text-[18px] text-[#5e4b37]">
                (+855) 081 811 789
              </p>
            </div>
            <button className="self-start px-[32px] py-[12px] bg-[#b89552] text-white font-dm-sans font-medium text-[16px] rounded-[24px] hover:bg-[#a3803d] transition-colors shadow-lg">
              {t('viewMap')}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side (Just Image) */}
      <div className="relative flex-1 overflow-hidden">
        <Image
          src="/images/branch-building.jpg"
          alt="Orienda International Hospital Chamkarmon"
          fill
          className="object-cover object-right"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </section>
  )
}
