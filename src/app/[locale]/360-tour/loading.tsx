import Image from 'next/image'
import SiteLayout from '@/components/layout/SiteLayout'

// Shown while a 360 scene/room loads (incl. switching rooms). A unique, on-brand
// loader: the Orienda emblem with a gold ring rotating around it (evoking the
// 360° rotation) on a dark, immersive backdrop that matches the viewer — so the
// transition is seamless instead of the generic full-screen cream/logo splash.
export default function Loading() {
  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full min-h-screen">
        <div className="page-shell pt-[90px] lg:pt-[150px] pb-[80px] flex flex-col gap-[40px]">
          <div
            className="relative w-full h-[360px] sm:h-[520px] lg:h-[640px] rounded-[28px] overflow-hidden flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 50% 45%, #241a0c 0%, #160f06 70%)',
              boxShadow: '0 8px 60px 8px rgba(184,145,72,0.18)',
              border: '1px solid rgba(184,145,72,0.28)',
            }}
          >
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                {/* outer rotating gold ring — the 360 motion */}
                <div
                  className="absolute w-[132px] h-[132px] rounded-full border-[3px] border-[#b89148]/15 border-t-[#b89148] animate-spin"
                  style={{ animationDuration: '1.4s' }}
                />
                {/* inner counter-rotating hairline ring */}
                <div
                  className="absolute w-[104px] h-[104px] rounded-full border border-[#ead6a4]/20 border-b-[#ead6a4]/70 animate-spin"
                  style={{ animationDuration: '2.4s', animationDirection: 'reverse' }}
                />
                {/* Orienda emblem with a soft gold glow */}
                <div className="relative w-[72px] h-[72px]" style={{ filter: 'drop-shadow(0 0 18px rgba(184,145,72,0.55))' }}>
                  <Image src="/images/logo-emblem.png" alt="Orienda" fill sizes="72px" className="object-contain" priority />
                </div>
              </div>
              <p className="mt-7 font-dm-sans text-[12px] tracking-[4px] uppercase text-[#e8cc88]">Loading 360° view</p>
            </div>
          </div>

          {/* Title + description placeholders */}
          <div className="flex flex-col items-center gap-4">
            <div className="h-[40px] w-[320px] max-w-[80%] rounded-lg bg-[#e8d9b8] animate-pulse" />
            <div className="h-[80px] w-full max-w-[900px] rounded-lg bg-[#e8d9b8] animate-pulse" />
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
