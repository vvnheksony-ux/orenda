import SiteLayout from '@/components/layout/SiteLayout'

export default function Loading() {
  return (
    <SiteLayout>
      <div className="min-h-screen pb-[120px] pt-[90px] lg:pt-[150px]" style={{ background: 'var(--background)' }}>
        {/* Hero image */}
        <div className="narrow-shell mb-10">
          <div className="relative w-full h-[320px] md:h-[460px] xl:h-[574px] rounded-[10px] overflow-hidden bg-[#ece3d2] animate-pulse" />
        </div>

        <div className="narrow-shell flex flex-col gap-5">
          {/* Title */}
          <div className="h-[36px] xl:h-[44px] w-3/4 rounded-[12px] bg-[#e8d9b8] animate-pulse" />

          {/* Body */}
          <div className="flex flex-col gap-4">
            <div className="h-[22px] w-[160px] rounded-full bg-[#e7dcc7] animate-pulse" />
            <div className="flex flex-col gap-2 pl-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[18px] rounded-full bg-[#f0ebe0] animate-pulse" style={{ width: `${55 + (i % 3) * 12}%` }} />
              ))}
            </div>

            <div className="h-[22px] w-[220px] rounded-full bg-[#e7dcc7] animate-pulse mt-2" />
            <div className="flex flex-col gap-2 pl-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[18px] rounded-full bg-[#f0ebe0] animate-pulse" style={{ width: `${60 + (i % 3) * 10}%` }} />
              ))}
            </div>

            <div className="h-[22px] w-[260px] rounded-full bg-[#e7dcc7] animate-pulse mt-2" />
            <div className="flex flex-col gap-2 pl-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[18px] rounded-full bg-[#f0ebe0] animate-pulse" style={{ width: `${58 + (i % 3) * 11}%` }} />
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="h-[24px] w-[280px] rounded-[12px] bg-[#e8d9b8] animate-pulse mt-2" />

          {/* Apply button */}
          <div className="h-[56px] w-[200px] rounded-[12px] bg-[#e8d9b8] animate-pulse mt-4" />
        </div>
      </div>
    </SiteLayout>
  )
}
