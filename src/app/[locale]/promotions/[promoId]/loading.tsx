import SiteLayout from '@/components/layout/SiteLayout'

export default function Loading() {
  return (
    <SiteLayout>
      <div className="min-h-screen pt-[90px] lg:pt-[150px] pb-[120px]" style={{ background: 'var(--background)' }}>
        <div className="content-shell flex flex-col gap-10">

          {/* Hero image */}
          <div className="relative w-full h-[240px] md:h-[380px] xl:h-[500px] rounded-[16px] overflow-hidden bg-[#ece3d2] animate-pulse" />

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="h-[22px] w-[180px] rounded-full bg-[#e7dcc7] animate-pulse" />
            <div className="h-[22px] w-[200px] rounded-full bg-[#e7dcc7] animate-pulse" />
          </div>

          {/* Title */}
          <div className="h-[32px] w-3/4 rounded-[12px] bg-[#e8d9b8] animate-pulse" />

          {/* Body */}
          <div className="flex flex-col gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[18px] rounded-full bg-[#f0ebe0] animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />
            ))}
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-4">
            <div className="h-[64px] w-[240px] rounded-[12px] bg-[#e8d9b8] animate-pulse" />
          </div>

        </div>

        {/* Explore More */}
        <div className="mt-20 content-shell">
          <div className="h-[36px] w-[260px] rounded-[12px] bg-[#e8d9b8] animate-pulse mb-8" />
          <div className="flex gap-6 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-1 min-w-[260px] h-[280px] rounded-[16px] bg-[#ece3d2] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
