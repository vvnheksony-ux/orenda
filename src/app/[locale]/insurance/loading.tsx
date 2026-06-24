import SiteLayout from '@/components/layout/SiteLayout'

export default function Loading() {
  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">
        <div className="page-shell flex flex-col gap-[56px] lg:gap-[80px] items-center pb-[120px] pt-[90px] lg:pt-[150px]">

          {/* Hero card */}
          <div className="w-full h-[320px] md:h-[440px] xl:h-[520px] rounded-[16px] bg-[#ece3d2] animate-pulse" />

          {/* Insurance section */}
          <div className="flex flex-col gap-[40px] items-center w-full">
            {/* Heading */}
            <div className="flex flex-col gap-[12px] items-center w-full">
              <div className="h-[48px] w-[260px] rounded-[12px] bg-[#e8d9b8] animate-pulse" />
              <div className="h-[20px] w-[180px] rounded-full bg-[#f0ebe0] animate-pulse" />
            </div>

            {/* Insurer cards grid */}
            <div className="flex flex-wrap gap-5 lg:gap-[40px] items-stretch justify-center w-full">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white flex w-full sm:flex-1 flex-col sm:flex-row gap-5 lg:gap-[40px] items-center min-w-0 sm:min-w-[320px] overflow-hidden px-5 sm:px-6 lg:px-[40px] py-5 lg:py-[24px] rounded-[16px]"
                  style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}
                  aria-hidden="true"
                >
                  <div className="shrink-0 size-[120px] rounded-[8px] bg-[#ece3d2] animate-pulse" />
                  <div className="h-[24px] w-3/5 rounded-full bg-[#f0ebe0] animate-pulse" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
