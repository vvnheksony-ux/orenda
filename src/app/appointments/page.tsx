'use client'

import { useState, useEffect } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'

const DOCTORS_FALLBACK = [
  { id: 'kuon-linka', name: 'Dr. Kuon Linka', specialty: 'Gynecologist Obstetrician', department: 'Obstetrics & Gynecology' },
  { id: 'kim-lumpiny', name: 'Dr. Kim Lumpiny', specialty: 'Gynecologist Obstetrician', department: 'Obstetrics & Gynecology' },
  { id: 'chhit-maryan', name: 'Dr. Chhit Maryan', specialty: 'Gynecologist Obstetrician', department: 'Obstetrics & Gynecology' },
  { id: 'chhorvichet', name: 'Dr. Chhor Vichet', specialty: 'Gynecologist, Obstetrician', department: 'Obstetrics & Gynecology' },
  { id: 'sin-rachana', name: 'Dr. Sin Rachana', specialty: 'Gynecologist, Obstetrician', department: 'Obstetrics & Gynecology' },
  { id: 'siv-kimleng', name: 'Dr. Siv Kimleng', specialty: 'Obstetrician and Gynecologist', department: 'Obstetrics & Gynecology' },
  { id: 'engmuyteang', name: 'Dr. Eang Muyteang', specialty: 'Gynecologist, Obstetrician', department: 'Obstetrics & Gynecology' },
  { id: 'heng-fa', name: 'Dr. Heng Fa', specialty: 'Gynecologist and Sonography', department: 'Obstetrics & Gynecology' },
  { id: 'sreng-kimsrean', name: 'Dr. Sreng Kimsrean', specialty: 'Obstetrician and Gynecologist', department: 'Obstetrics & Gynecology' },
  { id: 'nuth-sodara', name: 'Dr. Nuth Sodara', specialty: 'Gynecologist Obstetrician', department: 'Obstetrics & Gynecology' },
  { id: 'dr-sor-sreipich', name: 'Dr. Sor Sreipich', specialty: 'Obstetrician, Gynecologist', department: 'Obstetrics & Gynecology' },
  { id: 'dr-chak-chanlida', name: 'Dr. Chak Chanlida', specialty: 'Obstetrician, Gynecologist', department: 'Obstetrics & Gynecology' },
  { id: 'dr-soeu-chanvisal', name: 'Dr. Soeu Chanvisal', specialty: 'Obstetrician, Gynecologist', department: 'Obstetrics & Gynecology' },
  { id: 'dr-pel-monyratha', name: 'Dr. Pel Monyratha', specialty: 'Obstetrician, Gynecologist', department: 'Obstetrics & Gynecology' },
  { id: 'um-hemsophirum', name: 'Dr. Um Hemsophirum', specialty: 'Pediatrician, Neonatal and NICU', department: 'Pediatrics' },
  { id: 'saveang-lichea', name: 'Dr. Saveang Lichea', specialty: 'Pediatrician', department: 'Pediatrics' },
  { id: 'meyputhi', name: 'Dr. Mey Puthi', specialty: 'Pediatrician', department: 'Pediatrics' },
  { id: 'than-soklang', name: 'Than Soklang', specialty: 'Pediatrician', department: 'Pediatrics' },
  { id: 'lim-bolyly', name: 'Dr. Lim Bolyly', specialty: 'Pediatrician', department: 'Pediatrics' },
  { id: 'habsokchamnap', name: 'Dr. Hab Sokchamnap', specialty: 'Pediatrician', department: 'Pediatrics' },
  { id: 'dr-hen-seang', name: 'Dr. Hen Seang', specialty: 'Pediatrician, Neonatal', department: 'Pediatrics' },
  { id: 'dr-norng-sedaseny', name: 'Dr. Norng Sedaseny', specialty: 'Pediatrician, Neonatal', department: 'Pediatrics' },
  { id: 'dr-keo-santepheap', name: 'Dr. Keo Santepheap', specialty: 'Pediatrician, Neonatal', department: 'Pediatrics' },
  { id: 'dr-mao-sineath', name: 'Dr. Mao Sineath', specialty: 'Pediatrician, Neonatal', department: 'Pediatrics' },
  { id: 'dr-an-eangnay', name: 'Dr. An Eangnay', specialty: 'Pediatrician, Neonatal', department: 'Pediatrics' },
  { id: 'phoeun-sarath', name: 'Dr. Phoeun Sarath', specialty: 'Emergency, ICU', department: 'Emergency & ICU' },
  { id: 'ngeth-pathy', name: 'Dr. NGETH Pathy', specialty: 'Anesthesia, Emergency, ICU', department: 'Emergency & ICU' },
  { id: 'phok-sovann', name: 'Dr. Phok Sovann', specialty: 'ICU', department: 'Emergency & ICU' },
  { id: 'mak-heangsovann', name: 'Dr. MAK Heangsovann', specialty: 'Anesthesia, Emergency, ICU', department: 'Emergency & ICU' },
  { id: 'em-ekvitou', name: 'Dr. Em Ekvitou', specialty: 'Anesthesia, Emergency, ICU', department: 'Emergency & ICU' },
  { id: 'dr-eng-borey', name: 'Dr. Eng Borey', specialty: 'Emergency, Anesthesia, ICU', department: 'Emergency & ICU' },
  { id: 'dr-born-sophea', name: 'Dr. Born Sophea', specialty: 'Emergency, ICU, Anesthesiologist', department: 'Emergency & ICU' },
  { id: 'elsokry', name: 'Dr. El Sokry', specialty: 'General Medicines', department: 'General Medicine' },
  { id: 'sornbophaphal', name: 'Dr. Sorn Bophaphal', specialty: 'General Medicines', department: 'General Medicine' },
  { id: 'nou-chantrea', name: 'Dr. Nou Chantrea', specialty: 'General Medicines', department: 'General Medicine' },
  { id: 'eang-kimchhuong', name: 'Dr. Eang Kimchhuong', specialty: 'General Medicines', department: 'General Medicine' },
  { id: 'tha-sokchan', name: 'Dr. THA Sokchan', specialty: 'General Medicines', department: 'General Medicine' },
  { id: 'sok-khanpisey', name: 'Dr. Sok Khanpisey', specialty: 'General Medicines', department: 'General Medicine' },
  { id: 'heang-enghorng', name: 'Dr. Heang Enghorng', specialty: 'General Medicines', department: 'General Medicine' },
  { id: 'dr-sros-piseth', name: 'Dr. Sros Piseth', specialty: 'General Medicines', department: 'General Medicine' },
  { id: 'vutha', name: 'Dr. Than Vutha', specialty: 'Diabetologist', department: 'General Medicine' },
  { id: 'lim-lihaung', name: 'Dr. LIM Lihaung', specialty: 'Radiologist', department: 'Imaging Center' },
  { id: 'dr-chea-piseth', name: 'Dr. Chea Piseth', specialty: 'Sonographer', department: 'Imaging Center' },
  { id: 'enghongseng', name: 'Dr. Eng Hongseng', specialty: 'Neurosurgery', department: 'Neuro Surgery' },
  { id: 'eudaldo', name: 'Dr. Eudaldo Gonzalez Martinez', specialty: 'Orthopedic and Trauma Specialist', department: 'Orthopedics' },
  { id: 'antony', name: 'Dr. Anthony Alvarez Morales', specialty: 'General Surgery Specialist', department: 'General Surgery' },
  { id: 'vengsothea', name: 'Dr. Veng Sothea', specialty: 'Dermatology', department: 'Dermatology' },
  { id: 'srengpor', name: 'Dr. Sreng Por', specialty: 'Dermatology', department: 'Dermatology' },
  { id: 'dr-nguon-darath', name: 'Dr. Nguon Darath', specialty: 'Dermatologist', department: 'Dermatology' },
]

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
]

const BRANCHES = ['Chamkarmon Branch', 'Branch']

type Doctor = { id: string; name: string; specialty: string; department: string }

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS_FALLBACK)
  const [form, setForm] = useState({
    patient_name: '', patient_phone: '', patient_email: '',
    doctor_id: '', department_id: '', branch_id: '',
    preferred_date: '', preferred_time: '', message: '', language: 'en',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/doctors')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && Array.isArray(d) && d.length > 0) setDoctors(d) })
      .catch(() => {})
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
      <div className="min-h-screen flex items-center justify-center pt-32" style={{ background: '#fbf7ee' }}>
        <div className="text-center flex flex-col items-center gap-6 px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#b89148' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none">Appointment Booked</h1>
          <p className="font-dm-sans text-[18px] text-gold-800 max-w-md">We received your request. Our team will contact you shortly to confirm your appointment.</p>
          <a href="/" className="mt-4 inline-flex items-center justify-center px-10 py-4 rounded-full font-dm-sans text-[16px] text-white" style={{ background: '#b89148' }}>Back to Home</a>
        </div>
      </div>
    </SiteLayout>
  )

  return (
    <SiteLayout>
      <div className="min-h-screen pt-32 pb-20 px-5" style={{ background: '#fbf7ee' }}>
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
