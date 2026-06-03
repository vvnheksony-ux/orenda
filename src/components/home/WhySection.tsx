import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

const STATS = [
  {
    value: '99%',
    label: 'Patient satisfaction',
    body: 'Based on 2004 patient feedback surveys across departments. Patients highlighted clear communication, staff friendliness, and modern facilities as key reasons for satisfaction.',
  },
  {
    value: 'Over 100,000',
    label: 'Patient Visit since 2024',
    body: 'Including both Cambodian and International patients from over 20 countries a sign of growing trust in local healthcare quality.',
  },
  {
    value: '0%',
    label: 'Readmission Rate',
    body: "Orienda's readmission rate stands at 0%, reflecting consistent follow-up and preventive care success.",
  },
  {
    value: '0.5%',
    label: 'Surgical Infection Rate',
    body: 'A 0.5% surgical infection rate shows our commitment to safe surgeries and careful post-operative care for every patient',
  },
]

function StatCard({ value, label, body }: { value: string; label: string; body: string }) {
  return (
    <div
      className="flex flex-col items-center overflow-hidden rounded-[12px] border border-[#fbf7ee] bg-[#fbf7ee] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)]"
      style={{ width: '322px', padding: '24px 40px' }}
    >
      <div className="flex flex-col items-center gap-[12px] text-center pt-[10px] pb-[20px] w-[212px]">
        <div className="flex flex-col items-center gap-[16px] font-cormorant font-bold leading-none whitespace-nowrap">
          <span className="text-[36px] text-[#7a5f2c]">{value}</span>
          <span className="text-[24px] text-[#3b2d17]">{label}</span>
        </div>
        <p className="font-dm-sans font-normal text-[15px] text-[#3b2d17] leading-[1.3] w-[212px]">
          {body}
        </p>
      </div>
    </div>
  )
}

export default function WhySection() {
  const t = useTranslations('WhySection')

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '872px', background: 'rgba(245,236,212,0.45)' }}>

      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/figma-facility-1.jpg"
          alt="Why Orienda"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* Blur overlay */}
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.1)]" style={{ backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)' }} />

      {/* Content */}
      <div className="absolute flex flex-col items-start" style={{ left: 81, top: 78, gap: 82 }}>

        {/* Text block */}
        <div className="flex flex-col gap-[20px] items-start" style={{ width: 695 }}>
          <div className="flex flex-col gap-[16px] text-[#3b2d17]">
            <h2 className="font-cormorant font-bold text-[48px] leading-none">
              Why Orienda Is Your Best Choice?
            </h2>
            <p className="font-dm-sans font-light text-[24px] leading-[1.4] overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
              Orienda International Hospital is the premier choice for healthcare in Cambodia, combining award-winning international standards with a proven track record of life-saving success. As an ISO-certified institution, we provide 24/7 comprehensive medical services—ranging from specialized fertility and maternity care to emergency air ambulance transport—all powered by a dedicated team of over 800 professionals.
            </p>
          </div>
          <button className="flex items-center gap-[8px] bg-[#b89148] text-white rounded-[12px] font-dm-sans text-[16px] px-[20px]" style={{ height: 48 }}>
            {t('discoverMore')}
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Staggered 4 stat cards — exact Figma positions */}
        <div className="relative" style={{ width: 1351, height: 340 }}>
          {/* Card 1: top-0 left-0 */}
          <div className="absolute" style={{ top: 0, left: 0 }}>
            <StatCard {...STATS[0]} />
          </div>
          {/* Card 2: top-0 left-685.64 */}
          <div className="absolute" style={{ top: 0, left: 686 }}>
            <StatCard {...STATS[1]} />
          </div>
          {/* Card 3: top-86 left-342.82 */}
          <div className="absolute" style={{ top: 86, left: 343 }}>
            <StatCard {...STATS[2]} />
          </div>
          {/* Card 4: top-86 left-1028.46 */}
          <div className="absolute" style={{ top: 86, left: 1028 }}>
            <StatCard {...STATS[3]} />
          </div>
        </div>

      </div>
    </section>
  )
}
