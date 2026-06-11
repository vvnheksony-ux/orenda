'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SiteLayout from '@/components/layout/SiteLayout'

export default function EmergencyPage() {
  const [form, setForm] = useState({ contact_info: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')

  useEffect(() => {
    fetch('/api/branches')
      .then(r => r.json())
      .then(d => { if (d.docs?.[0]?.phone) setEmergencyPhone(d.docs[0].phone) })
      .catch(() => {})
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contact_info || !form.message) { setError('All fields required.'); return }
    setStatus('loading'); setError('')
    const res = await fetch('/api/emergency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!res.ok) { const d = await res.json(); setStatus('error'); setError(d.error || 'Something went wrong.'); return }
    setStatus('success')
  }

  if (status === 'success') return (
    <SiteLayout>
      <div className="min-h-screen flex items-center justify-center pt-[100px] lg:pt-[212px]" style={{ background: '#fbf7ee' }}>
        <div className="text-center flex flex-col items-center gap-6 px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-600">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none">Alert Sent</h1>
          <p className="font-dm-sans text-[18px] text-gold-800 max-w-md">Our emergency team has been notified.{emergencyPhone ? <> Call <strong>{emergencyPhone}</strong> for immediate assistance.</> : ' We will contact you shortly.'}</p>
          <Link href="/" className="mt-4 inline-flex items-center justify-center px-10 py-4 rounded-full font-dm-sans text-[16px] text-white" style={{ background: '#b89148' }}>Back to Home</Link>
        </div>
      </div>
    </SiteLayout>
  )

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-20 px-5" style={{ background: '#fbf7ee' }}>
        <div className="max-w-xl mx-auto">

          {/* Emergency banner */}
          <div className="bg-red-600 rounded-[16px] p-6 mb-10 text-center">
            <p className="font-dm-sans text-white text-[14px] mb-1">For life-threatening emergencies call immediately</p>
            {emergencyPhone && (
              <a href={`tel:${emergencyPhone.replace(/\s/g, '')}`} className="font-cormorant font-bold text-[32px] text-white">
                {emergencyPhone}
              </a>
            )}
          </div>

          <div className="text-center mb-10">
            <h1 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none mb-3">Emergency Contact</h1>
            <p className="font-dm-sans text-[16px] text-gold-800">Send an emergency alert to our medical team</p>
          </div>

          <form onSubmit={submit} className="bg-white rounded-[24px] shadow-[0px_4px_32px_rgba(122,95,44,0.10)] p-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-dm-sans text-[14px] font-medium text-gold-900">Your Contact Info *</label>
              <input type="text" value={form.contact_info} onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))}
                placeholder="Phone number or name"
                className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-red-500 transition-colors"
                style={{ background: '#fdfaf5' }} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-dm-sans text-[14px] font-medium text-gold-900">Emergency Description *</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Describe the emergency situation..." rows={5}
                className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none resize-none focus:border-red-500 transition-colors"
                style={{ background: '#fdfaf5' }} />
            </div>
            {error && <p className="font-dm-sans text-[14px] text-red-600">{error}</p>}
            <button type="submit" disabled={status === 'loading'}
              className="w-full py-4 rounded-full font-dm-sans text-[18px] text-white bg-red-600 hover:opacity-90 transition-opacity disabled:opacity-60">
              {status === 'loading' ? 'Sending Alert...' : 'Send Emergency Alert'}
            </button>
          </form>
        </div>
      </div>
    </SiteLayout>
  )
}
