import Image from 'next/image'
import Link from 'next/link'
import SiteLayout from '@/components/layout/SiteLayout'

const STATS = [
  { value: '20k+', label: 'Patients Served' },
  { value: '50+', label: 'Specialists' },
  { value: '24/7', label: 'Emergency Care' },
  { value: '99%', label: 'Patient Satisfaction' },
]

const VALUES = [
  { title: 'Compassionate Care', desc: 'We treat every patient with dignity, empathy, and respect — because healing goes beyond medicine.' },
  { title: 'Clinical Excellence', desc: 'Our specialists are trained at world-class institutions and continuously pursue the latest medical advancements.' },
  { title: 'Innovation', desc: 'We invest in state-of-the-art technology to provide accurate diagnoses and effective treatments.' },
  { title: 'Transparency', desc: 'We believe patients deserve clear communication about their health, treatment options, and costs.' },
]

export default function AboutPage() {
  return (
    <SiteLayout>
      <div className="min-h-screen" style={{ background: '#fbf7ee' }}>

        {/* Hero */}
        <div className="relative h-[480px] flex items-end overflow-hidden">
          <Image src="/images/hero-bg.jpg" alt="Orienda Hospital" fill className="object-cover object-center" sizes="100vw" priority />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(59,45,23,0.85) 0%, rgba(59,45,23,0.3) 60%, transparent 100%)' }} />
          <div className="relative z-10 max-w-4xl mx-auto px-8 pb-16">
            <h1 className="font-cormorant font-bold text-[72px] text-white leading-none mb-4">About Orienda</h1>
            <p className="font-dm-sans text-[20px] text-white/90 max-w-2xl">Cambodia&apos;s premier international hospital, committed to compassionate and world-class healthcare.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white py-12 px-5">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="font-cormorant font-bold text-[48px] text-gold-900 leading-none">{s.value}</p>
                <p className="font-dm-sans text-[14px] text-gold-700 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-5xl mx-auto px-5 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-dm-sans text-[13px] font-medium text-gold-600 uppercase tracking-widest mb-3">Our Mission</p>
            <h2 className="font-cormorant font-bold text-[48px] text-gold-900 leading-tight mb-6">Healing with Heart, Leading with Excellence</h2>
            <p className="font-dm-sans text-[16px] text-gold-800 leading-[1.8] mb-4">
              Orienda International Hospital is committed to transparent and compassionate healthcare. Our focus on patient satisfaction and well-being drives our continuous improvement in providing exceptional medical care.
            </p>
            <p className="font-dm-sans text-[16px] text-gold-800 leading-[1.8]">
              Founded with a vision to bring world-class medical services to Cambodia, we combine cutting-edge technology with a deeply human approach to health and healing.
            </p>
          </div>
          <div className="relative h-[400px] rounded-[24px] overflow-hidden shadow-[0px_8px_40px_rgba(122,95,44,0.15)]">
            <Image src="/images/why-bg.jpg" alt="Hospital" fill className="object-cover" sizes="600px" />
          </div>
        </div>

        {/* Values */}
        <div className="bg-white py-20 px-5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none mb-3">Our Values</h2>
              <p className="font-dm-sans text-[16px] text-gold-800">The principles that guide everything we do</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {VALUES.map(v => (
                <div key={v.title} className="p-8 rounded-[20px] border border-gold-100 hover:shadow-[0px_4px_20px_rgba(122,95,44,0.10)] transition-shadow" style={{ background: '#fdfaf5' }}>
                  <div className="w-10 h-10 rounded-full mb-4 flex items-center justify-center" style={{ background: '#b89148' }}>
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                  <h3 className="font-cormorant font-bold text-[24px] text-gold-900 mb-2">{v.title}</h3>
                  <p className="font-dm-sans text-[15px] text-gold-800 leading-[1.7]">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-20 px-5 text-center">
          <h2 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none mb-4">Ready to Experience Excellence?</h2>
          <p className="font-dm-sans text-[16px] text-gold-800 mb-8">Book an appointment with our specialists today</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/appointments" className="inline-flex items-center justify-center px-10 py-4 rounded-full font-dm-sans text-[17px] text-white transition-opacity hover:opacity-90" style={{ background: '#b89148' }}>
              Book Appointment
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-10 py-4 rounded-full font-dm-sans text-[17px] text-gold-900 border border-gold-400 hover:bg-white transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
