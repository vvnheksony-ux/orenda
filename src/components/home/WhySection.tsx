import { ArrowRight } from 'lucide-react'

const STATS = [
  {
    pct: '99%',
    label: 'Patient satisfaction',
    body: 'Based on patient satisfaction surveys conducted at Orienda International Hospital.',
  },
  {
    pct: '99%',
    label: 'Patient satisfaction',
    body: 'Based on patient satisfaction surveys conducted at Orienda International Hospital.',
  },
  {
    pct: '99%',
    label: 'Patient satisfaction',
    body: 'Based on patient satisfaction surveys conducted at Orienda International Hospital.',
  },
  {
    pct: '99%',
    label: 'Patient satisfaction',
    body: 'Based on patient satisfaction surveys conducted at Orienda International Hospital.',
  },
]

function StatCard({ pct, label, body }: { pct: string; label: string; body: string }) {
  return (
    <div
      className="bg-[rgba(245,236,212,0.4)] border border-gold-50 rounded-[12px] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)] overflow-hidden"
      style={{ padding: '24px 40px', width: 330 }}
    >
      <div
        className="flex flex-col gap-1 items-center text-center"
        style={{ paddingTop: 10, paddingBottom: 20, width: 250 }}
      >
        <div className="flex items-center justify-center gap-4 w-full">
          <span className="font-cormorant font-bold text-[36px] text-gold-700 leading-none whitespace-nowrap">
            {pct}
          </span>
          <span className="font-cormorant font-bold text-[24px] text-gold-900 leading-none whitespace-nowrap">
            {label}
          </span>
        </div>
        <p className="font-dm-sans text-[15px] text-gold-900 leading-[1.3] w-full mt-1">
          {body}
        </p>
      </div>
    </div>
  )
}

export default function WhySection() {
  return (
    <section className="w-full bg-gold-50 overflow-hidden">

      {/* ── Desktop stagger layout (lg+) ─────────────────── */}
      <div className="relative hidden lg:block" style={{ height: 800 }}>

        {/* Left text column */}
        <div
          className="absolute flex flex-col justify-between"
          style={{ left: 120, top: 80, width: 695, height: 280 }}
        >
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <p className="font-dm-sans font-medium text-[14px] text-gold-500 uppercase tracking-[0.18em]">
                Why Choose Us
              </p>
              <h2 className="font-cormorant font-bold text-[48px] text-gold-900 leading-[1.15]">
                Committed To Your Health And Happiness
              </h2>
            </div>
            <p className="font-dm-sans font-light text-[24px] text-gold-700 leading-[1.4] line-clamp-2">
              Orienda International Hospital provides a comprehensive range of medical services
              delivered by a team of highly skilled professionals using the latest technology.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-gold-500 text-white px-5 py-3.5 rounded-[12px] font-dm-sans text-base w-fit hover:bg-gold-700 transition-colors">
            See More
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Card 1 — top-right */}
        <div className="absolute" style={{ top: 80, left: 'calc(50% + 305.5px)' }}>
          <StatCard {...STATS[0]} />
        </div>
        {/* Card 2 — middle */}
        <div className="absolute" style={{ top: 320, left: 'calc(50% - 24.5px)' }}>
          <StatCard {...STATS[1]} />
        </div>
        {/* Card 3 — bottom-left */}
        <div className="absolute" style={{ top: 560, left: 'calc(50% - 354.5px)' }}>
          <StatCard {...STATS[2]} />
        </div>
        {/* Card 4 — bottom-right */}
        <div className="absolute" style={{ top: 560, left: 'calc(50% + 305.5px)' }}>
          <StatCard {...STATS[3]} />
        </div>
      </div>

      {/* ── Mobile stacked layout (< lg) ─────────────────── */}
      <div className="lg:hidden px-6 py-16 flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <p className="font-dm-sans font-medium text-[13px] text-gold-500 uppercase tracking-[0.18em]">
            Why Choose Us
          </p>
          <h2 className="font-cormorant font-bold text-[36px] text-gold-900 leading-tight">
            Committed To Your Health And Happiness
          </h2>
          <p className="font-dm-sans font-light text-[18px] text-gold-700 leading-[1.5]">
            Orienda International Hospital provides a comprehensive range of medical services
            delivered by a team of highly skilled professionals using the latest technology.
          </p>
          <button className="flex items-center gap-2 bg-gold-500 text-white px-5 py-3.5 rounded-[12px] font-dm-sans text-base w-fit hover:bg-gold-700 transition-colors">
            See More
            <ArrowRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-[rgba(245,236,212,0.4)] border border-gold-50 rounded-[12px] shadow-[0px_4px_12px_3px_rgba(89,69,34,0.2)] p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-cormorant font-bold text-[32px] text-gold-700 leading-none">
                  {stat.pct}
                </span>
                <span className="font-cormorant font-bold text-[20px] text-gold-900 leading-none">
                  {stat.label}
                </span>
              </div>
              <p className="font-dm-sans text-[14px] text-gold-900 leading-[1.3]">{stat.body}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
