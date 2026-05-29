'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAnalytics } from '@/lib/use-analytics'

export default function BookAppointmentSection() {
  const { trackCallClick } = useAnalytics()

  return (
    <section className="w-full py-[80px] flex flex-col items-center justify-center" style={{ background: '#fbf7ee' }}>
      <div className="flex flex-col gap-[40px] items-center max-w-[582px] w-full px-[40px]">

        <div className="flex flex-col gap-[12px] items-center text-center w-full">
          <h2 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none w-full">
            Book Appointment
          </h2>
          <p className="font-dm-sans text-[20px] text-gold-800 w-full">
            Learn more about our healthcare services and patient support.
          </p>
        </div>

        <Link
          href="/appointments"
          onClick={() => trackCallClick('home-section')}
          className="flex items-center gap-[12px] bg-gold-500 text-white px-[40px] py-[18px] rounded-full font-dm-sans font-bold text-[16px] uppercase tracking-widest hover:bg-gold-600 transition-colors shadow-lg"
        >
          Book Now
          <ArrowRight size={20} />
        </Link>

      </div>
    </section>
  )
}
