import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

const STATS = [
  {
    pct: '99%',
    label: 'Patient satisfaction',
    body: 'Based on 2004 patient feedback surveys across departments. Patients highlighted clear communication, staff friendliness, and modern facilities as key reasons for satisfaction.',
  },
  {
    pct: '99%',
    label: 'Patient satisfaction',
    body: 'Based on 2004 patient feedback surveys across departments. Patients highlighted clear communication, staff friendliness, and modern facilities as key reasons for satisfaction.',
  },
  {
    pct: '99%',
    label: 'Patient satisfaction',
    body: 'Based on 2004 patient feedback surveys across departments. Patients highlighted clear communication, staff friendliness, and modern facilities as key reasons for satisfaction.',
  },
  {
    pct: '99%',
    label: 'Patient satisfaction',
    body: 'Based on 2004 patient feedback surveys across departments. Patients highlighted clear communication, staff friendliness, and modern facilities as key reasons for satisfaction.',
  },
]

function StatCard({ pct, label, body }: { pct: string; label: string; body: string }) {
  return (
    <div
      className="bg-white/20 backdrop-blur-md border border-white/40 rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden"
      style={{ padding: '28px 32px', width: 330 }}
    >
      <div
        className="flex flex-col gap-1 items-center text-center"
        style={{ paddingTop: 10, paddingBottom: 10, width: '100%' }}
      >
        <div className="flex items-center justify-center gap-4 w-full">
          <span className="font-cormorant font-bold text-[40px] text-gold-900 leading-none whitespace-nowrap">
            {pct}
          </span>
          <span className="font-cormorant font-bold text-[22px] text-gold-900 leading-none whitespace-nowrap">
            {label}
          </span>
        </div>
        <p className="font-dm-sans text-[15px] text-gold-900/90 leading-[1.4] w-full mt-4">
          {body}
        </p>
      </div>
    </div>
  )
}

export default function WhySection() {
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

      {/* ── Desktop stagger layout (lg+) ─────────────────── */}
      <div className="relative z-10 hidden lg:block max-w-[1800px] mx-auto" style={{ height: 800 }}>

        {/* Left text column */}
        <div
          className="absolute flex flex-col justify-between"
          style={{ left: 80, top: 120, width: 650, height: 400 }}
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <p className="font-dm-sans font-medium text-[16px] xl:text-[18px] text-gold-700 uppercase tracking-[0.18em]">
                Why Choose Us
              </p>
              <h2 className="font-cormorant font-bold text-[48px] lg:text-[64px] xl:text-[72px] text-gold-900 leading-[1.1]">
                Why Orienda Is Your Best Choice?
              </h2>
            </div>
            <p className="font-dm-sans font-light text-[20px] lg:text-[24px] xl:text-[26px] text-gold-900/80 leading-[1.5]">
              Orienda International Hospital is the premier choice for healthcare in Cambodia, combining award-winning international standards with compassionate, patient-centered care.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#A2834E] text-white px-8 py-5 rounded-[8px] font-dm-sans text-xl font-medium w-fit hover:bg-gold-800 transition-colors mt-auto">
            Discover More
            <ArrowRight size={24} />
          </button>
        </div>

        {/* Card 1 — top-right */}
        <div className="absolute" style={{ top: 80, left: 'calc(50% + 220px)' }}>
          <StatCard {...STATS[0]} />
        </div>
        {/* Card 2 — middle */}
        <div className="absolute" style={{ top: 320, left: 'calc(50% - 100px)' }}>
          <StatCard {...STATS[1]} />
        </div>
        {/* Card 3 — bottom-left */}
        <div className="absolute" style={{ top: 560, left: 'calc(50% - 420px)' }}>
          <StatCard {...STATS[2]} />
        </div>
        {/* Card 4 — bottom-right */}
        <div className="absolute" style={{ top: 560, left: 'calc(50% + 220px)' }}>
          <StatCard {...STATS[3]} />
        </div>
      </div>

      {/* ── Mobile stacked layout (< lg) ─────────────────── */}
      <div className="relative z-10 lg:hidden px-6 py-16 flex flex-col gap-10">
        <div className="flex flex-col gap-6 relative">
          <p className="font-dm-sans font-medium text-[13px] text-gold-700 uppercase tracking-[0.18em]">
            Why Choose Us
          </p>
          <h2 className="font-cormorant font-bold text-[40px] text-gold-900 leading-[1.1]">
            Why Orienda Is Your Best Choice?
          </h2>
          <p className="font-dm-sans font-light text-[18px] text-gold-900/80 leading-[1.5]">
            Orienda International Hospital is the premier choice for healthcare in Cambodia, combining award-winning international standards with compassionate, patient-centered care.
          </p>
          <button className="flex items-center gap-2 bg-[#A2834E] text-white px-6 py-3.5 rounded-[8px] font-dm-sans text-base w-fit hover:bg-gold-800 transition-colors">
            Discover More
            <ArrowRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-white/20 backdrop-blur-md border border-white/40 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6"
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
