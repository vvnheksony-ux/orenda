import Image from 'next/image'

/* Figma: Two branch cards side by side, each 756px wide × 450px tall
   B1 (left): image fills card, info card overlaid at bottom
   B2 (right): image + semi-transparent cream overlay with info */

export default function MapSection() {
  return (
    <section className="flex flex-col lg:flex-row w-full h-[450px] overflow-hidden">
      
      {/* Branch 1 — Chamkarmon (Left) */}
      <div className="relative flex-1 group overflow-hidden">
        <Image
          src="/images/branch-building.jpg"
          alt="Orienda International Hospital Chamkarmon"
          fill
          className="object-cover object-center transition-transform duration-1000 group-hover:scale-110"
          sizes="756px"
        />
        {/* Info Card Overlay */}
        <div className="absolute bottom-[40px] left-[40px] right-[40px] bg-white p-[24px] rounded-[12px] shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] border border-[rgba(234,214,164,0.60)]">
          <p className="font-cormorant font-bold text-[24px] text-gold-900 leading-tight">
            Orienda International Hospital (Chamkarmon Branch)
          </p>
          <div className="flex justify-between items-end mt-[12px]">
            <p className="font-dm-sans text-[14px] text-gold-800 max-w-[400px]">
              66, Street 31cc, 3, Phnom Penh 120605
            </p>
            <button className="px-[24px] py-[10px] bg-gold-500 text-white font-dm-sans font-bold text-[14px] uppercase tracking-wider rounded-[8px] hover:bg-gold-600 transition-colors">
              View Map
            </button>
          </div>
        </div>
      </div>

      {/* Branch 2 — Sen Sok (Right) */}
      <div className="relative flex-1 group overflow-hidden">
        <Image
          src="/images/map-branch.png"
          alt="Orienda International Hospital Branch"
          fill
          className="object-cover object-center"
          sizes="756px"
        />
      </div>
    </section>
  )
}
