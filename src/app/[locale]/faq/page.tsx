'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import SiteLayout from '@/components/layout/SiteLayout'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQ { id: string; question: string; answer: string }

export default function FAQPage() {
  const locale = useLocale()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    fetch(`/api/faqs?locale=${locale}&limit=50`)
      .then(r => r.json())
      .then(d => {
        const docs = d.docs || d || []
        setFaqs(docs.map((f: any) => ({
          id: String(f.id),
          question: f.question ?? '',
          answer: f.answer ?? '',
        })))
      })
      .catch(() => {})
  }, [locale])

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-20 px-5" style={{ background: '#fbf7ee' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-cormorant font-bold text-[56px] text-gold-900 leading-none mb-3">Frequently Asked Questions</h1>
            <p className="font-dm-sans text-[18px] text-gold-800">Find answers to common questions about our services and policies.</p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i
              return (
                <div key={faq.id} className="bg-white rounded-[16px] shadow-[0px_4px_16px_rgba(122,95,44,0.08)] overflow-hidden transition-all">
                  <button
                    onClick={() => toggle(i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-cormorant font-bold text-[22px] text-gold-900">{faq.question}</span>
                    {isOpen ? <ChevronUp className="text-gold-700" /> : <ChevronDown className="text-gold-700" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-gold-50/50">
                      <p className="font-dm-sans text-[16px] text-gold-800 leading-relaxed">{faq.answer}</p>
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
