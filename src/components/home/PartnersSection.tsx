import Image from 'next/image'

/* Figma: Partners — 1512×218px, cream bg, single row of 98×98px logo cards gap-[16px] */
const PARTNERS = [
  { src: '/images/partner-1.png', alt: 'Batapana Bank' },
  { src: '/images/partner-2.png', alt: 'Partner' },
  { src: '/images/partner-3.png', alt: 'Baby Plus' },
  { src: '/images/partner-1.png', alt: 'Batapana Bank' },
  { src: '/images/partner-2.png', alt: 'Partner' },
  { src: '/images/partner-3.png', alt: 'Baby Plus' },
  { src: '/images/partner-1.png', alt: 'Batapana Bank' },
  { src: '/images/partner-2.png', alt: 'Partner' },
  { src: '/images/partner-3.png', alt: 'Baby Plus' },
  { src: '/images/partner-1.png', alt: 'Batapana Bank' },
  { src: '/images/partner-2.png', alt: 'Partner' },
  { src: '/images/partner-3.png', alt: 'Baby Plus' },
  { src: '/images/partner-1.png', alt: 'Batapana Bank' },
]

export default function PartnersSection() {
  return (
    <section className="w-full overflow-hidden bg-[#fbf7ee] py-[120px] lg:py-[160px]">

      {/* Header */}
      <div className="flex flex-col gap-[20px] items-center text-center pb-[40px] xl:pb-[60px]">
        <h2 className="font-cormorant font-bold text-[48px] lg:text-[64px] xl:text-[72px] text-gold-900 leading-none">
          Partners
        </h2>
        <p className="font-dm-sans text-[20px] lg:text-[24px] xl:text-[26px] text-gold-800">
          Orienda&apos;s International Hospital Partners
        </p>
      </div>

      {/* Infinite marquee — duplicated list so loop is seamless */}
      <div className="w-full overflow-hidden">
        <div className="flex gap-[16px] animate-marquee" style={{ width: 'max-content' }}>
          {[...PARTNERS, ...PARTNERS].map((partner, i) => (
            <div
              key={i}
              className="relative rounded-[12px] shrink-0 overflow-hidden"
              style={{ width: 98, height: 98 }}
            >
              <Image
                src={partner.src}
                alt={partner.alt}
                fill
                className="object-cover"
                sizes="98px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
