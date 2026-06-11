'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import SiteLayout from '@/components/layout/SiteLayout'
import { ChevronRight, ChevronLeft, Phone } from 'lucide-react'
import { DatePicker, CustomSelect } from '@/components/shared/FormControls'

const INQUIRY_TYPES = ['General Inquiry', 'Appointment Request', 'Medical Record', 'Billing', 'Feedback', 'Other']
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']
const NATIONALITIES = ['Cambodian', 'Thai', 'Vietnamese', 'Chinese', 'Korean', 'Japanese', 'American', 'Other']
const COUNTRIES = ['Cambodia', 'Thailand', 'Vietnam', 'China', 'Korea', 'Japan', 'United States', 'Other']

export default function InquiryPage() {
  const [hospitalNames, setHospitalNames] = useState<string[]>([])
  const [form, setForm] = useState({
    condition: '', inquiryType: '', hospitalName: '', question: '',
    firstName: '', lastName: '', email: '', phone: '',
    dob: '', gender: '', nationality: '', country: '',
  })
  const [consents, setConsents] = useState([false, false, false])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/branches')
      .then(r => r.json())
      .then(d => { if (d.docs?.length) setHospitalNames(d.docs.map((b: { name: string }) => b.name)) })
      .catch(() => {})
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const toggleConsent = (i: number) => setConsents(c => c.map((v, idx) => idx === i ? !v : v))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName) { setError('First name is required.'); return }
    if (!form.email && !form.phone) { setError('Please provide an email or phone number.'); return }
    if (!consents[0]) { setError('Please accept the Terms of Service and Privacy Notice.'); return }
    setStatus('loading'); setError('')

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email || null,
          phone: form.phone || null,
          subject: form.inquiryType || 'General Inquiry',
          message: [
            form.condition   && `Condition/Treatment: ${form.condition}`,
            form.hospitalName && `Hospital: ${form.hospitalName}`,
            form.question    && `Question: ${form.question}`,
            form.dob         && `Date of Birth: ${form.dob}`,
            form.gender      && `Gender: ${form.gender}`,
            form.nationality && `Nationality: ${form.nationality}`,
            form.country     && `Country: ${form.country}`,
          ].filter(Boolean).join('\n'),
          language: 'en',
        }),
      })

      clearTimeout(timeout)

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || `Server error (${res.status})`)
      }

      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    }
  }

  if (status === 'success') return (
    <SiteLayout>
      <div className="min-h-screen flex items-center justify-center pt-[160px] pb-20" style={{ background: '#fbf7ee' }}>
        <div className="text-center flex flex-col items-center gap-6 px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#b89148' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none">Inquiry Sent</h1>
          <p className="font-dm-sans text-[18px] text-gold-800 max-w-md">Thank you! We&apos;ve received your inquiry and will get back to you shortly.</p>
          <Link href="/" className="mt-4 inline-flex items-center justify-center px-10 py-4 rounded-full font-dm-sans text-[16px] text-white" style={{ background: '#b89148' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </SiteLayout>
  )

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: '#fbf7ee' }}>
        <div className="max-w-[1352px] mx-auto px-5 xl:px-0 flex flex-col gap-20">

          {/* ── Hero banner ── */}
          <div className="relative bg-white rounded-[16px] overflow-hidden h-[320px] md:h-[400px] xl:h-[472px] shadow-[0px_4px_16px_rgba(122,95,44,0.08)]">
            {/* Left: hospital image */}
            <div className="absolute left-0 top-0 bottom-0 w-[42%] overflow-hidden">
              <Image
                src="/images/inquiry-hero.jpg"
                alt="Orienda International Hospital"
                fill
                className="object-cover object-center"
                sizes="562px"
                priority
              />
            </div>

            {/* Left chevron */}
            <button className="absolute left-3 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full hover:bg-gold-50 transition-colors z-10">
              <ChevronLeft size={24} className="text-gold-700" />
            </button>
            <button className="absolute right-3 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full hover:bg-gold-50 transition-colors z-10">
              <ChevronRight size={24} className="text-gold-700" />
            </button>

            {/* Right: content */}
            <div className="absolute left-[44%] top-0 bottom-0 right-0 flex flex-col justify-between p-10 xl:p-[80px] xl:pb-10">
              <div className="flex flex-col gap-6 xl:gap-10">
                <h1 className="font-cormorant font-bold text-[28px] xl:text-[48px] text-gold-900 leading-none">
                  Orienda International Hospital
                </h1>
                <div className="font-dm-sans font-light text-[14px] xl:text-[24px] text-gold-800 flex flex-col gap-3 leading-normal">
                  <p>We dedicated to providing safe and reliable medical services.</p>
                  <p>Schedule and appointment to experience world-class healthcare.</p>
                </div>
              </div>
              <a
                href="tel:016593789"
                className="self-start flex items-center gap-2 px-5 py-3 rounded-[12px] font-dm-sans text-[16px] xl:text-[18px] text-white hover:opacity-90 transition-opacity"
                style={{ background: '#b89148' }}
              >
                <Phone size={20} />
                Contact Now
              </a>
            </div>
          </div>

          {/* ── Inquiry Form ── */}
          <div
            className="rounded-[16px] p-8 xl:p-10 shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)]"
            style={{ background: '#fbf7ee' }}
          >
            <form onSubmit={submit} className="flex flex-col gap-16">

              {/* Header */}
              <div className="text-center flex flex-col gap-2">
                <h2 className="font-cormorant font-bold text-[28px] text-gold-900 leading-none">Send Inquiry</h2>
                <p className="font-dm-sans text-[16px] text-gold-800">Book an appointment with us today</p>
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-6">
                <Field label="Condition/Treatment of Interest" value={form.condition} onChange={v => set('condition', v)} placeholder="e.g. Cardiology, General Checkup" />
                <CustomSelect label="Type of Inquiry" value={form.inquiryType} onChange={v => set('inquiryType', v)} options={INQUIRY_TYPES} placeholder="Select type" labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />
                <CustomSelect label="Hospital Name" value={form.hospitalName} onChange={v => set('hospitalName', v)} options={hospitalNames} placeholder="Select hospital" labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />

                {/* Your Question */}
                <div className="flex flex-col gap-2">
                  <label className="font-dm-sans font-medium text-[16px] text-gold-900">Your Question</label>
                  <textarea
                    value={form.question}
                    onChange={e => set('question', e.target.value)}
                    placeholder="Enter your message here"
                    rows={6}
                    className="w-full px-4 py-3 rounded-[12px] border border-[#dcbd72] font-dm-sans text-[16px] text-gold-900 outline-none resize-none focus:border-gold-500 transition-colors bg-white"
                  />
                </div>

                {/* First + Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="First Name" value={form.firstName} onChange={v => set('firstName', v)} placeholder="John" />
                  <Field label="Last Name" value={form.lastName} onChange={v => set('lastName', v)} placeholder="Doe" />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} placeholder="your@email.com" />
                  <Field label="Phone Number" type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="098 000 999" />
                </div>

                {/* DOB + Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DatePicker label="Date of Birth" value={form.dob} onChange={v => set('dob', v)} placeholder="Select date of birth" labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />
                  <CustomSelect label="Gender" value={form.gender} onChange={v => set('gender', v)} options={GENDERS} placeholder="Select gender" labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />
                </div>

                {/* Nationality + Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomSelect label="Nationality" value={form.nationality} onChange={v => set('nationality', v)} options={NATIONALITIES} placeholder="Select nationality" labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />
                  <CustomSelect label="Country of Residence" value={form.country} onChange={v => set('country', v)} options={COUNTRIES} placeholder="Select country" labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex flex-col gap-4">
                {[
                  "I have read and acknowledged the Hospital's Terms of Service and Privacy Notice.",
                  "I confirm and certify that any of my personal information I have provided to the Hospital is true, correct and present. I also certify that I have a legal right to disclose any information of other individuals to the Hospital, or I have notified or obtained consent to the disclosure from the data subject thereof.",
                  "I hereby consent the Hospital to send me information about products, services, advertisements, or promotional programs that will benefit me via all channels I have given to the Hospital.",
                ].map((text, i) => (
                  <label key={i} className="flex gap-4 items-start cursor-pointer">
                    <button
                      type="button"
                      onClick={() => toggleConsent(i)}
                      className="shrink-0 size-6 rounded-[12px] border-[1.5px] flex items-center justify-center transition-colors mt-0.5"
                      style={{
                        borderColor: '#b89148',
                        background: consents[i] ? '#b89148' : 'transparent',
                      }}
                    >
                      {consents[i] && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span className="font-dm-sans text-[16px] text-gold-900 leading-normal">{text}</span>
                  </label>
                ))}
              </div>

              {error && <p className="font-dm-sans text-[14px] text-red-600 text-center">{error}</p>}

              {/* Submit */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-4 rounded-[12px] font-dm-sans font-semibold text-[20px] text-gold-50 hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ background: '#b89148', minWidth: '232px' }}
                >
                  {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-dm-sans font-medium text-[16px] text-gold-900">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-[12px] border border-[#dcbd72] font-dm-sans text-[16px] text-gold-900 outline-none focus:border-gold-500 transition-colors bg-white"
      />
    </div>
  )
}

