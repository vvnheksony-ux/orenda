import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

  // We will move STATS inside the component to use t()

function StatCard({ pct, label, body }: { pct: string; label: string; body: string }) {
  return (
    <div
      className="bg-[#f7f5f2]/30 backdrop-blur-2xl border border-white/60 rounded-[16px] shadow-[0_8px_32px_rgba(107,90,69,0.12)] overflow-hidden"
      style={{ padding: '24px 28px', width: 280 }}
    >
      <div className="flex flex-col items-center text-center w-full">
        <div className="flex items-baseline justify-center gap-[8px] w-full mb-3">
          <span className="font-cormorant font-bold text-[36px] text-[#A2834E] leading-none whitespace-nowrap drop-shadow-sm">
            {pct}
          </span>
          <span className="font-cormorant font-medium text-[20px] text-[#2c241b] leading-none whitespace-nowrap">
            {label}
          </span>
        </div>
        <p className="font-dm-sans text-[12px] text-[#6b5a45] leading-[1.6] w-full">
          {body}
        </p>
      </div>
    </div>
  )
}

export default function WhySection() {
  const t = useTranslations('WhySection')

  const STATS = Array(4).fill({
    pct: '99%',
    label: t('statSatisfactionLabel'),
    body: t('statSatisfactionBody'),
  })

  return (
    <section className="relative w-full overflow-hidden bg-gold-50 py-[80px] lg:py-[160px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/why-bg.jpg"
          alt="Why Choose Orienda Background"
          fill
          className="object-cover"
          quality={90}
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
      </div>

      {/* ── Desktop layout (lg+) ─────────────────── */}
      <div className="relative z-10 hidden lg:flex items-center justify-between max-w-[1400px] mx-auto px-10 xl:px-20" style={{ minHeight: 700 }}>

        {/* Left text column */}
        <div className="flex flex-col gap-8 max-w-[450px] xl:max-w-[500px]">
          <div className="flex flex-col gap-4">
            <h2 className="font-cormorant font-semibold text-[36px] xl:text-[44px] text-[#2c241b] leading-[1.2]">
              Why Orienda Is Your Best Choice?
            </h2>
            <p className="font-dm-sans font-normal text-[15px] xl:text-[16px] text-[#6b5a45] leading-[1.6]">
              {t('description')}
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#d3b482] text-white px-6 py-3 rounded-full font-dm-sans text-[14px] font-medium w-fit hover:bg-[#b09366] transition-colors mt-2 shadow-sm">
            {t('discoverMore')}
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Right cards column (Staggered Grid) */}
        <div className="flex gap-[20px] xl:gap-[24px] items-start shrink-0">
          {/* Left Column (shifted down) */}
          <div className="flex flex-col gap-[20px] xl:gap-[24px] mt-[120px]">
            <StatCard {...STATS[1]} />
            <StatCard {...STATS[2]} />
          </div>
          {/* Right Column (starts at top) */}
          <div className="flex flex-col gap-[20px] xl:gap-[24px]">
            <StatCard {...STATS[0]} />
            <StatCard {...STATS[3]} />
          </div>
        </div>
      </div>

      {/* ── Mobile stacked layout (< lg) ─────────────────── */}
      <div className="relative z-10 lg:hidden px-6 py-16 flex flex-col gap-10">
        <div className="flex flex-col gap-6 relative">
          <p className="font-dm-sans font-medium text-[13px] text-gold-700 uppercase tracking-[0.18em]">
            {t('subtitle')}
          </p>
          <h2 className="font-cormorant font-bold text-[40px] text-gold-900 leading-[1.1]">
            {t('title')}
          </h2>
          <p className="font-dm-sans font-light text-[18px] text-gold-900/80 leading-[1.5]">
            {t('description')}
          </p>
          <button className="flex items-center gap-2 bg-[#A2834E] text-white px-6 py-3.5 rounded-[8px] font-dm-sans text-base w-fit hover:bg-gold-800 transition-colors">
            {t('discoverMore')}
            <ArrowRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-[#f7f5f2]/30 backdrop-blur-2xl border border-white/50 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-cormorant font-bold text-[32px] text-gold-900 leading-none">
                  {stat.pct}
                </span>
                <span className="font-cormorant font-bold text-[20px] text-gold-900 leading-none">
                  {stat.label}
                </span>
              </div>
              <p className="font-dm-sans text-[14px] text-gold-900/80 leading-[1.4]">{stat.body}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
