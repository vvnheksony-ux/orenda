'use client'

import { useState } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'

const SUBJECTS = ['General Inquiry', 'Medical Services', 'Appointments', 'Billing', 'Feedback', 'Other']

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.message) { setError('Name and message are required.'); return }
    setStatus('loading'); setError('')
    const res = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, status: 'unread', language: 'en' }) })
    if (!res.ok) { const d = await res.json(); setStatus('error'); setError(d.error || 'Something went wrong.'); return }
    setStatus('success')
  }

  if (status === 'success') return (
    <SiteLayout>
      <div className="min-h-screen flex items-center justify-center pt-[160px] xl:pt-[200px] pb-20" style={{ background: '#fbf7ee' }}>
        <div className="text-center flex flex-col items-center gap-6 px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#b89148' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none">Message Sent</h1>
          <p className="font-dm-sans text-[18px] text-gold-800 max-w-md">Thank you for reaching out. We&apos;ll get back to you as soon as possible.</p>
          <a href="/" className="mt-4 inline-flex items-center justify-center px-10 py-4 rounded-full font-dm-sans text-[16px] text-white" style={{ background: '#b89148' }}>Back to Home</a>
        </div>
      </div>
    </SiteLayout>
  )

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[160px] xl:pt-[200px] pb-20 px-5" style={{ background: '#fbf7ee' }}>
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">
            <h1 className="font-cormorant font-bold text-[56px] text-gold-900 leading-none mb-3">Contact Us</h1>
            <p className="font-dm-sans text-[18px] text-gold-800">We&apos;re here to help — reach out anytime</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Info cards */}
            <div className="flex flex-col gap-5">
              {[
                { icon: '📍', title: 'Address', lines: ['66, Street 31cc, 3', 'Phnom Penh 120605'] },
                { icon: '📞', title: 'Phone', lines: ['(+855) 081 811 789'] },
                { icon: '🕐', title: 'Hours', lines: ['Open 24 hours', '7 days a week'] },
              ].map(c => (
                <div key={c.title} className="bg-white rounded-[16px] p-6 shadow-[0px_4px_16px_rgba(122,95,44,0.08)]">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <p className="font-cormorant font-bold text-[20px] text-gold-900 mb-1">{c.title}</p>
                  {c.lines.map(l => <p key={l} className="font-dm-sans text-[14px] text-gold-800">{l}</p>)}
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={submit} className="lg:col-span-2 bg-white rounded-[24px] shadow-[0px_4px_32px_rgba(122,95,44,0.10)] p-8 flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name *" value={form.name} onChange={v => set('name', v)} placeholder="Your name" />
                <Field label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="+855 ..." type="tel" />
              </div>
              <Field label="Email" value={form.email} onChange={v => set('email', v)} placeholder="your@email.com" type="email" />
              <SelectField label="Subject" value={form.subject} onChange={v => set('subject', v)} options={SUBJECTS} />
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans text-[14px] font-medium text-gold-900">Message *</label>
                <textarea value={form.message} onChange={e => set('message', e.target.value)} placeholder="How can we help you?" rows={5}
                  className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none resize-none focus:border-gold-500 transition-colors"
                  style={{ background: '#fdfaf5' }} />
              </div>
              {error && <p className="font-dm-sans text-[14px] text-red-600">{error}</p>}
              <button type="submit" disabled={status === 'loading'}
                className="w-full py-4 rounded-full font-dm-sans text-[18px] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: '#b89148' }}>
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-dm-sans text-[14px] font-medium text-gold-900">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors"
        style={{ background: '#fdfaf5' }} />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-dm-sans text-[14px] font-medium text-gold-900">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors appearance-none"
        style={{ background: '#fdfaf5' }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
