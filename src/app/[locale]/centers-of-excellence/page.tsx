import Image from 'next/image'
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'

const STATS = [
  { value: '99%',  label: 'Success Rate' },
  { value: '20k',  label: 'Surgeries' },
  { value: '100%', label: 'Satisfaction' },
]

const TESTIMONIALS = [
  "The care and attention I received here completely changed my recovery journey. The team didn't just treat my symptoms; they listened to my concerns and built a plan tailored exactly to my needs. I highly recommend them to anyone looking for truly compassionate healthcare.",
  "The care and attention I received here completely changed my recovery journey. The team didn't just treat my symptoms; they listened to my concerns and built a plan tailored exactly to my needs. I highly recommend them to anyone looking for truly compassionate healthcare.",
  "The care and attention I received here completely changed my recovery journey. The team didn't just treat my symptoms; they listened to my concerns and built a plan tailored exactly to my needs. I highly recommend them to anyone looking for truly compassionate healthcare.",
  "The care and attention I received here completely changed my recovery journey. The team didn't just treat my symptoms; they listened to my concerns and built a plan tailored exactly to my needs. I highly recommend them to anyone looking for truly compassionate healthcare.",
  "The care and attention I received here completely changed my recovery journey. The team didn't just treat my symptoms; they listened to my concerns and built a plan tailored exactly to my needs. I highly recommend them to anyone looking for truly compassionate healthcare.",
]

const DOCTORS = [
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
  { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
]

export default function CentersOfExcellencePage() {
  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] w-full">
        <div className="flex flex-col gap-[96px] items-center pb-[120px] pt-[120px] 2xl:pt-[196px]">

          {/* Hero */}
          <div className="flex flex-col gap-[56px] items-start px-[96px] w-full relative">
            <div className="flex flex-col gap-[24px] w-full relative">
              <div className="absolute right-0 top-0 w-[713px] h-[590px] pointer-events-none overflow-hidden">
                <Image src="/images/centers/neurosurgery.jpg" alt="Neurosurgery" fill className="object-cover" sizes="713px" priority />
              </div>
              <div className="flex gap-[32px] items-center relative z-10">
                <button className="shrink-0 text-[#594522] opacity-70 hover:opacity-100 transition-opacity">
                  <ArrowLeft size={32} />
                </button>
                <div className="flex flex-col gap-[16px]">
                  <p className="font-dm-sans text-[20px] text-[#594522] leading-none">Centers of Excellence</p>
                  <h1 className="font-cormorant font-bold text-[56px] text-[#3b2d17] leading-none">Neurosurgery</h1>
                </div>
              </div>
              <p className="font-dm-sans font-normal text-[20px] text-black leading-normal w-[760px] relative z-10">
                Our Neurosurgery Center of Excellence combines world-class surgical expertise with groundbreaking technology to treat complex conditions of the brain, spine, and nervous system.
              </p>
            </div>
            <div className="flex flex-col gap-[46px] items-start relative z-10">
              <div className="flex gap-[36px] items-center">
                {STATS.map((s) => (
                  <div key={s.label} className="flex flex-col gap-[24px] items-center justify-center w-[189px] h-[175px] rounded-[12px] overflow-hidden" style={{ background: 'rgba(245,236,212,0.15)', boxShadow: '0px 4px 12px 3px rgba(89,69,34,0.2)' }}>
                    <p className="font-cormorant text-[48px] text-[#594522] leading-normal text-center">{s.value}</p>
                    <p className="font-dm-sans text-[16px] text-[#9a7838] capitalize leading-none">{s.label}</p>
                  </div>
                ))}
              </div>
              <button className="flex items-center justify-center px-[24px] py-[16px] rounded-[12px] overflow-hidden w-[232px] bg-[#b89148]">
                <span className="font-dm-sans font-semibold text-[20px] text-[#fbf7ee]">Book Appointment</span>
              </button>
            </div>
          </div>

          {/* Patient Testimonials */}
          <div className="flex flex-col gap-[52px] items-center w-full px-[46px]">
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">Patient Testimonials</h2>
              <p className="font-dm-sans text-[20px] text-[#594522] w-full">Hear from those we&apos;ve had the privilege to care for.</p>
            </div>
            <div className="grid grid-cols-2 gap-[46px] w-full">
              {TESTIMONIALS.map((text, i) => (
                <div key={i} className="relative flex flex-col gap-[16px] p-[32px] rounded-[12px] h-[273px]" style={{ background: 'rgba(245,236,212,0.15)', boxShadow: '0px 4px 12px 3px rgba(89,69,34,0.2)' }}>
                  <div className="absolute top-[32px] left-[32px] text-[#594522] opacity-40">
                    <Quote size={32} className="-scale-y-100 rotate-180" />
                  </div>
                  <div className="flex flex-col gap-[16px] justify-end h-full">
                    <p className="font-dm-sans text-[16px] text-[#3b2d17] leading-normal capitalize">{text}</p>
                    <p className="font-cormorant font-bold text-[20px] text-[#3b2d17] leading-none">- Sarah</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meet Our Specialist */}
          <div className="flex flex-col gap-[40px] items-center pb-[72px] w-full max-w-[1432px]">
            <div className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">Meet Our Specialist</h2>
              <p className="font-dm-sans text-[20px] text-[#594522]">Meet Our Specialists in This Department</p>
            </div>
            <div className="flex flex-wrap gap-[40px] items-center justify-center w-full">
              {DOCTORS.map((doc, i) => (
                <div key={i} className="bg-[#fbf7ee] flex flex-col gap-[40px] h-[400px] items-center justify-center overflow-hidden relative rounded-[16px] shrink-0 w-[300px]" style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}>
                  <div className="absolute top-0 left-0 w-full h-[206px] opacity-[0.64] pointer-events-none" style={{ background: 'linear-gradient(133deg, rgba(234,214,164,0.6) 0%, rgba(184,145,72,0.8) 49%, rgba(234,214,164,0.6) 100%)' }} />
                  <div className="relative rounded-full overflow-hidden shrink-0 size-[146px]" style={{ boxShadow: '0px 4px 30px 12px rgba(184,145,72,0.2)' }}>
                    <Image src="/images/centers/doctor-thumb.jpg" alt={doc.name} fill className="object-cover" sizes="146px" />
                  </div>
                  <div className="flex flex-col h-[145px] items-center justify-between shrink-0">
                    <div className="flex flex-col gap-[16px] items-center text-center text-[#3b2d17] capitalize overflow-hidden">
                      <p className="font-cormorant font-medium text-[24px] w-[217px] leading-none">{doc.name}</p>
                      <p className="font-dm-sans text-[16px] w-[186px] leading-none">{doc.specialty}</p>
                    </div>
                    <button className="bg-[#b89148] flex h-[32px] items-center justify-center overflow-hidden px-[12px] py-[8px] rounded-[12px] w-[145px]" style={{ boxShadow: '0px 2px 6px 6px rgba(0,0,0,0.05)' }}>
                      <span className="font-dm-sans text-[12px] text-[#fbf7ee]">View Profile</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/doctors" className="flex items-center h-[32px] px-[12px] py-[8px] border border-[#b89148] rounded-[12px] gap-[4px] w-[145px] justify-center" style={{ boxShadow: '0px 2px 6px 0px rgba(0,0,0,0.05)' }}>
              <span className="font-dm-sans text-[12px] text-[#5c4924]">See More</span>
              <ArrowRight size={16} className="text-[#5c4924]" />
            </Link>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
