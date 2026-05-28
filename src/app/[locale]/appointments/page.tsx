'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SiteLayout from '@/components/layout/SiteLayout'

type Doctor = { id: string; name: string; specialty: string; department: string }

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState({
    patient_name: '', patient_phone: '', patient_email: '',
    doctor_id: '', department_id: '', branch_id: '',
    preferred_date: '', preferred_time: '', message: '', language: 'en',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch('/api/doctors')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) setDoctors(data)
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // Auto-fill department when doctor selected
  const selectDoctor = (doctorId: string) => {
    const doc = doctors.find(d => d.id === doctorId)
    setForm(f => ({ ...f, doctor_id: doctorId, department_id: doc?.department ?? f.department_id }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.patient_name || !form.patient_phone || !form.preferred_date || !form.preferred_time) {
      setError('Please fill in all required fields.')
      return
    }
    setStatus('loading')
    setError('')
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status: 'pending' }),
    })
    if (!res.ok) { const d = await res.json(); setStatus('error'); setError(d.error || 'Something went wrong.'); return }
    setStatus('success')
  }

  // Group doctors by department for the select
  const byDept = doctors.reduce<Record<string, Doctor[]>>((acc, d) => {
    acc[d.department] = acc[d.department] ?? []
    acc[d.department].push(d)
    return acc
  }, {})

  if (status === 'success') return (
    <SiteLayout>
      <div className="min-h-screen flex items-center justify-center pt-[160px] xl:pt-[200px] pb-20" style={{ background: '#fbf7ee' }}>
        <div className="text-center flex flex-col items-center gap-6 px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#b89148' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none">Appointment Booked</h1>
          <p className="font-dm-sans text-[18px] text-gold-800 max-w-md">We received your request. Our team will contact you shortly to confirm your appointment.</p>
          <Link href="/" className="mt-4 inline-flex items-center justify-center px-10 py-4 rounded-full font-dm-sans text-[16px] text-white" style={{ background: '#b89148' }}>Back to Home</Link>
        </div>
      </div>
    </SiteLayout>
  )

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[160px] xl:pt-[200px] pb-20 px-5" style={{ background: '#fbf7ee' }}>
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-12">
            <h1 className="font-cormorant font-bold text-[56px] text-gold-900 leading-none mb-3">Book Appointment</h1>
            <p className="font-dm-sans text-[18px] text-gold-800">Fill in your details and we&apos;ll confirm your booking</p>
          </div>

          <form onSubmit={submit} className="bg-white rounded-[24px] shadow-[0px_4px_32px_rgba(122,95,44,0.10)] p-8 md:p-12 flex flex-col gap-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name *" value={form.patient_name} onChange={v => set('patient_name', v)} placeholder="Your full name" />
              <Field label="Phone Number *" value={form.patient_phone} onChange={v => set('patient_phone', v)} placeholder="+855 ..." type="tel" />
            </div>

            <Field label="Email Address" value={form.patient_email} onChange={v => set('patient_email', v)} placeholder="your@email.com" type="email" />

            {/* Doctor selector — grouped by department */}
            <div className="flex flex-col gap-2">
              <label className="font-dm-sans text-[14px] font-medium text-gold-900">Select Doctor</label>
              <select
                value={form.doctor_id}
                onChange={e => selectDoctor(e.target.value)}
                className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors appearance-none"
                style={{ background: '#fdfaf5' }}
              >
                <option value="">Any available doctor</option>
                {Object.entries(byDept).map(([dept, docs]) => (
                  <optgroup key={dept} label={dept}>
                    {docs.map(d => (
                      <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Branch" value={form.branch_id} onChange={v => set('branch_id', v)} options={BRANCHES} />
              <Field label="Department" value={form.department_id} onChange={v => set('department_id', v)} placeholder="Auto-filled from doctor" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Preferred Date *" value={form.preferred_date} onChange={v => set('preferred_date', v)} type="date" />
              <SelectField label="Preferred Time *" value={form.preferred_time} onChange={v => set('preferred_time', v)} options={TIME_SLOTS} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-dm-sans text-[14px] font-medium text-gold-900">Message / Symptoms</label>
              <textarea
                value={form.message}
                onChange={e => set('message', e.target.value)}
                placeholder="Describe your symptoms or any notes for the doctor..."
                rows={4}
                className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none resize-none focus:border-gold-500 transition-colors"
                style={{ background: '#fdfaf5' }}
              />
            </div>

            {error && <p className="font-dm-sans text-[14px] text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 rounded-full font-dm-sans text-[18px] text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ background: '#b89148' }}
            >
              {status === 'loading' ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </SiteLayout>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-dm-sans text-[14px] font-medium text-gold-900">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors"
        style={{ background: '#fdfaf5' }}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-dm-sans text-[14px] font-medium text-gold-900">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors appearance-none"
        style={{ background: '#fdfaf5' }}
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
