'use client'

import { useState } from 'react'
import Link from 'next/link'
import SiteLayout from '@/components/layout/SiteLayout'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQS = [
  { q: 'What are your operating hours?', a: 'Orienda International Hospital is open 24/7 for emergency services. Outpatient clinics operate from 8:00 AM to 5:00 PM.' },
  { q: 'Do you accept international insurance?', a: 'Yes, we accept a wide range of international and local insurance providers. Please contact our billing department for a specific list.' },
  { q: 'How do I book an appointment?', a: 'You can book an appointment directly through this website, via our Member Lite app, or by calling our hotline at (+855) 081 811 789.' },
  { q: 'Do you offer translation services?', a: 'Yes, we provide translation services in English, Khmer, and Chinese to ensure clear communication with our international medical team.' },
  { q: 'What should I bring to my first appointment?', a: 'Please bring your ID/Passport, insurance card, and any previous medical records or test results relevant to your condition.' }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[160px] xl:pt-[200px] pb-20 px-5" style={{ background: '#fbf7ee' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-cormorant font-bold text-[56px] text-gold-900 leading-none mb-3">Frequently Asked Questions</h1>
            <p className="font-dm-sans text-[18px] text-gold-800">Find answers to common questions about our services and policies.</p>
          </div>

          <div className="flex flex-col gap-4">
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i
              return (
                <div key={i} className="bg-white rounded-[16px] shadow-[0px_4px_16px_rgba(122,95,44,0.08)] overflow-hidden transition-all">
                  <button 
                    onClick={() => toggle(i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-cormorant font-bold text-[22px] text-gold-900">{faq.q}</span>
                    {isOpen ? <ChevronUp className="text-gold-700" /> : <ChevronDown className="text-gold-700" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-gold-50/50">
                      <p className="font-dm-sans text-[16px] text-gold-800 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-12 bg-white rounded-[20px] p-8 text-center shadow-[0px_4px_16px_rgba(122,95,44,0.08)]">
            <h2 className="font-cormorant font-bold text-[32px] text-gold-900 mb-2">Still have questions?</h2>
            <p className="font-dm-sans text-[16px] text-gold-800 mb-6">Our support team is here to help you.</p>
            <Link href="/contact" className="inline-block px-8 py-3 rounded-full font-dm-sans text-[16px] text-white transition-opacity hover:opacity-90" style={{ background: '#b89148' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
