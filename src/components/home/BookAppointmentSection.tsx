'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useAnalytics } from '@/lib/use-analytics'
import { useTranslations } from 'next-intl'
import BookAppointmentModal from '@/components/shared/BookAppointmentModal'

export default function BookAppointmentSection() {
  const { trackCallClick } = useAnalytics()
  const t = useTranslations('BookAppointmentSection')
  const [open, setOpen] = useState(false)

  return (
    <section className="w-full py-[80px] flex flex-col items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="flex flex-col gap-[40px] items-center max-w-[582px] w-full px-[40px]">

        <div className="flex flex-col gap-[12px] items-center text-center w-full">
          <h2 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none w-full">
            {t('title')}
          </h2>
          <p className="font-dm-sans text-[20px] text-gold-800 w-full">
            {t('subtitle')}
          </p>
        </div>

        <button
          onClick={() => { trackCallClick('home-section'); setOpen(true) }}
          className="flex items-center gap-[12px] bg-gold-500 text-white px-[40px] py-[18px] rounded-full font-dm-sans font-bold text-[16px] uppercase tracking-widest hover:bg-gold-600 transition-colors shadow-lg"
        >
          {t('bookNow')}
          <ArrowRight size={20} />
        </button>

      </div>
      <BookAppointmentModal open={open} onClose={() => setOpen(false)} />
    </section>
  )
}
