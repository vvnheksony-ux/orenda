import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import { CLINIC_DETAILS } from '@/lib/clinics'

/* ── data ── */
const BANNER_ITEMS = [
  { icon: '/images/clinics/banner-icon1.png', title: 'Discover our clinics',  desc: 'Choose by name, specialty and more.' },
  { icon: '/images/clinics/banner-icon2.png', title: 'Discover our clinics',  desc: 'Ask about our treatments and services' },
  { icon: '/images/clinics/banner-icon3.png', title: 'Discover our clinics',  desc: 'Schedule your visit online.' },
]

const WOMEN_CLINICS = [
  { name: 'Obstetric',         icon: '/images/clinics/obstetric-icon.png'  },
  { name: 'Gynecology',        icon: '/images/clinics/obstetric-icon2.png' },
  { name: "Women's Health",    icon: '/images/clinics/obstetric-icon3.png' },
]

const GENERAL_CLINICS = [
  { name: 'Spine Center' },
  { name: 'Spine Center' },
  { name: 'Spine Center' },
  { name: 'Spine Center' },
  { name: 'Spine Center' },
  { name: 'Spine Center' },
  { name: 'Spine Center' },
  { name: 'Spine Center' },
  { name: 'Spine Center' },
  { name: 'Spine Center' },
  { name: 'Spine Center' },
  { name: 'Spine Center' },
]

/* ── components ── */
function PinkClinicCard({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="bg-white flex flex-col gap-[24px] items-center overflow-hidden p-[24px] rounded-[16px] shrink-0 w-[300px]" style={{ boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}>
      {/* Pink gradient circle */}
      <div className="relative rounded-full overflow-hidden shrink-0 size-[120px]" style={{ background: 'linear-gradient(180deg, rgba(255,244,249,0.4) 0%, rgba(242,135,180,0.4) 100%)', boxShadow: '0px 4px 30px 12px rgba(242,135,180,0.2)' }}>
        <Image src={icon} alt={name} fill className="object-cover rounded-full" sizes="120px" />
      </div>
      <div className="flex flex-col gap-[24px] items-center w-full">
        <p className="font-cormorant font-medium text-[24px] text-[#4f1b31] text-center capitalize leading-none whitespace-nowrap">{name}</p>
        <button className="flex items-center h-[32px] px-[12px] py-[8px] border-[1.5px] border-[#f6a3c6] rounded-[12px] gap-[4px]">
          <span className="font-dm-sans text-[16px] text-[#5c4924] px-[8px]">Learn More</span>
          <ArrowRight size={16} className="text-[#5c4924]" />
        </button>
      </div>
    </div>
  )
}

function GoldClinicCard({ name }: { name: string }) {
  return (
    <div className="bg-white flex flex-col gap-[24px] items-center overflow-hidden p-[24px] rounded-[16px] shrink-0 w-[300px]" style={{ boxShadow: '0px 4px 16px 4px rgba(122,95,44,0.12)' }}>
      {/* Gold gradient circle */}
      <div className="relative rounded-full overflow-hidden shrink-0 size-[120px] bg-[#fbf7ee]" style={{ boxShadow: '0px 4px 30px 12px rgba(184,145,72,0.2)' }}>
        <Image src="/images/clinics/spine-icon.png" alt={name} fill className="object-contain p-[10px]" sizes="120px" />
      </div>
      <div className="flex flex-col gap-[24px] items-center w-full">
        <p className="font-cormorant font-medium text-[24px] text-[#3b2d17] text-center capitalize leading-none whitespace-nowrap">{name}</p>
        <button className="flex items-center h-[32px] px-[12px] py-[8px] border-[1.5px] border-[#b89148] rounded-[12px] gap-[4px]">
          <span className="font-dm-sans text-[16px] text-[#5c4924] px-[8px]">Learn More</span>
          <ArrowRight size={16} className="text-[#5c4924]" />
        </button>
      </div>
    </div>
  )
}

/* ── page ── */
export default function ClinicsPage() {
  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="flex flex-col gap-[80px] items-center pb-[120px] px-[80px] pt-[120px] 2xl:pt-[196px]">

          {/* Hero slider */}
          <div className="flex gap-[16px] h-[472px] items-center justify-center w-full">
            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronLeft size={40} />
            </button>
            <div className="bg-white flex h-[472px] items-center justify-end overflow-hidden relative rounded-[16px] flex-1 max-w-[1352px]">
              <div className="relative h-[448px] rounded-[16px] shrink-0 w-[650px] overflow-hidden mr-[12px]">
                <Image src="/images/about/about-hero-3.jpg" alt="Orienda International Hospital" fill className="object-cover rounded-[16px]" sizes="650px" priority />
              </div>
              <div className="absolute left-[58px] top-[79px] flex flex-col gap-[40px] items-start w-[618px]">
                <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">Orienda International Hospital</h1>
                <div className="font-dm-sans font-light text-[24px] text-[#594522] leading-[1.4]">
                  <p className="mb-[12px]">We dedicated to providing safe and reliable medical services.</p>
                  <p>Schedule and appointment to experience world-class healthcare.</p>
                </div>
                <Link href="/about" className="flex items-center h-[48px] px-[20px] py-[14px] border-[1.5px] border-[#b89148] rounded-[12px] gap-[4px]">
                  <span className="font-dm-sans text-[18px] text-[#5c4924] px-[8px]">Learn More</span>
                  <ArrowRight size={20} className="text-[#5c4924]" />
                </Link>
              </div>
            </div>
            <button className="shrink-0 text-[#594522] opacity-60 hover:opacity-100 transition-opacity">
              <ChevronRight size={40} />
            </button>
          </div>

          {/* Gold info banner */}
          <div className="w-full max-w-[1352px] h-[200px] rounded-[16px] overflow-hidden flex items-center justify-center" style={{ background: 'rgba(184,145,72,0.8)', boxShadow: '0px 4px 24px 3px rgba(184,145,72,0.2)' }}>
            <div className="flex items-center justify-center w-full h-full">
              {BANNER_ITEMS.map((item, i) => (
                <div key={i} className={`flex flex-col gap-[16px] items-center justify-center h-full flex-1 ${i < BANNER_ITEMS.length - 1 ? 'border-r-2 border-[#f5ecd4]' : ''}`}>
                  <div className="relative size-[97px]">
                    <Image src={item.icon} alt={item.title} fill className="object-contain" sizes="97px" />
                  </div>
                  <div className="flex flex-col gap-[8px] items-center text-center">
                    <p className="font-dm-sans font-medium text-[24px] text-[#fbf7ee] leading-none capitalize">{item.title}</p>
                    <p className="font-dm-sans text-[16px] text-[#f5ecd4] leading-none capitalize">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinics & Departments */}
          <div className="flex flex-col gap-[120px] items-center w-full">

            {/* Header */}
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">Clinics &amp; Departments</h2>
              <p className="font-dm-sans text-[20px] text-[#594522] w-full">A selected team of experts committed to your health</p>
            </div>

            {/* Women & Children */}
            <div className="flex flex-col gap-[40px] items-start w-full">
              <div className="flex flex-col gap-[8px] text-center w-full">
                <h3 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">Women &amp; Children</h3>
                <p className="font-dm-sans text-[16px] text-[#594522]">A selected team of experts committed to your health</p>
              </div>
              <div className="flex flex-wrap gap-[40px] items-center justify-center w-full">
                {WOMEN_CLINICS.map((c) => (
                  <PinkClinicCard key={c.name} name={c.name} icon={c.icon} />
                ))}
              </div>
            </div>

            {/* General Hospital */}
            <div className="flex flex-col gap-[40px] items-start w-full">
              <div className="flex flex-col gap-[8px] text-center w-full">
                <h3 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">General Hospital</h3>
                <p className="font-dm-sans text-[18px] text-[#594522]">A selected team of experts committed to your health</p>
              </div>
              <div className="flex flex-wrap gap-[40px] items-center justify-center w-full">
                {GENERAL_CLINICS.map((c, i) => (
                  <GoldClinicCard key={i} name={c.name} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
