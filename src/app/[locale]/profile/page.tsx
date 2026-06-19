'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, CalendarDays, Check, ChevronRight, Clock, FileText, LogOut, Mail, MapPin, Phone, Save, Stethoscope, User, X } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth-context'
import { setProfileComplete } from '@/lib/profile-status'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

type ProfileForm = {
  display_name: string
  phone: string
  email: string
  date_of_birth: string
  gender: string
  language: string
}

const EMPTY: ProfileForm = {
  display_name: '',
  phone: '',
  email: '',
  date_of_birth: '',
  gender: '',
  language: 'en',
}

const fieldCls = 'w-full border border-[#dcbd72] rounded-[12px] px-4 py-3 font-dm-sans text-[15px] text-[#3b2d17] bg-white outline-none focus:border-[#b89148] transition-colors'
const labelCls = 'font-dm-sans text-[13px] font-medium text-[#6b5836]'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  completed: 'bg-blue-50 text-blue-700 border border-blue-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
}

const formatApptDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Earliest available'

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<ProfileForm>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [appointments, setAppointments] = useState<any[]>([])
  const [apptLoading, setApptLoading] = useState(true)
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/login?next=/profile')
      return
    }

    let cancelled = false
    supabase
      .from('profiles')
      .select('display_name, phone, email_user, date_of_birth, gender, language')
      .eq('id', user.id)
      .single()
      .then(({ data, error: loadError }) => {
        if (cancelled) return
        if (loadError && loadError.code !== 'PGRST116') setError(loadError.message)
        setForm({
          display_name: data?.display_name ?? user.user_metadata?.full_name ?? '',
          phone: data?.phone ?? user.phone ?? '',
          email: data?.email_user ?? user.email ?? '',
          date_of_birth: data?.date_of_birth ?? '',
          gender: data?.gender ?? '',
          language: data?.language ?? 'en',
        })
        setLoading(false)
      }, () => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [authLoading, router, user])

  // Load the signed-in user's appointment history.
  useEffect(() => {
    if (authLoading || !user) return
    let cancelled = false
    setApptLoading(true)
    fetch('/api/appointments')
      .then(r => (r.ok ? r.json() : { docs: [] }))
      .then(d => { if (!cancelled) setAppointments(Array.isArray(d?.docs) ? d.docs : []) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setApptLoading(false) })
    return () => { cancelled = true }
  }, [authLoading, user])

  const set = (key: keyof ProfileForm, value: string) => {
    setSaved(false)
    setForm(current => ({ ...current, [key]: value }))
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return

    const name = form.display_name.trim()
    const phone = form.phone.trim()
    if (!name) { setError('Please enter your full name.'); return }
    if (!phone) { setError('Please enter your phone number.'); return }
    if (phone.replace(/\D/g, '').length < 6) { setError('Please enter a valid phone number.'); return }

    setSaving(true)
    setError('')
    const { error: saveError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        display_name: name,
        phone,
        email_user: form.email.trim() || user.email || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        language: form.language || 'en',
      },
      { onConflict: 'id' },
    )
    setSaving(false)

    if (saveError) {
      setError(saveError.message || 'Could not save your profile. Please try again.')
      return
    }

    setProfileComplete(true)
    setSaved(true)
    // Show a loading screen for ~3s so everything settles, then go home.
    setRedirecting(true)
    setTimeout(() => router.push('/'), 3000)
  }

  const handleSignOut = async () => {
    await signOut()
    setProfileComplete(null)
    router.push('/')
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#fbf7ee] pt-[140px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#b89148] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const initials = (form.display_name || form.email || 'U')
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const completionFields = [form.display_name, form.phone, form.email, form.date_of_birth, form.gender]
  const completeness = Math.round(
    (completionFields.filter(value => value && value.trim()).length / completionFields.length) * 100,
  )

  return (
    <main className="min-h-screen bg-[#fbf7ee] pt-[120px] pb-[80px] px-4">
      {redirecting && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#fbf7ee]">
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-[64px] h-[64px] animate-pulse">
              <Image src="/images/logo-emblem.png" alt="Orienda" fill sizes="64px" className="object-contain" priority />
            </div>
            <div className="w-9 h-9 border-[3px] border-[#b89148] border-t-transparent rounded-full animate-spin" />
            <p className="font-dm-sans text-[14px] text-[#6b5836]">Saving your profile…</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1040px] mx-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex w-fit items-center gap-2 rounded-[12px] border border-[#dcbd72] bg-white/70 px-4 py-2 font-dm-sans text-[14px] text-[#6b5836] hover:bg-white transition-colors"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6 mt-6 items-start">

          {/* Summary card */}
          <aside className="bg-white rounded-[20px] p-7 shadow-[0_10px_40px_rgba(184,145,72,0.14)] flex flex-col items-center text-center gap-4 lg:sticky lg:top-[120px]">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#d8b765] to-[#b89148] flex items-center justify-center text-white font-cormorant font-bold text-[36px] shadow-[0_8px_24px_rgba(184,145,72,0.3)]">
              {initials}
            </div>
            <div className="min-w-0 w-full">
              <h2 className="font-cormorant font-bold text-[26px] text-[#3b2d17] leading-tight truncate">{form.display_name || 'Your name'}</h2>
              <p className="font-dm-sans text-[13px] text-[#6b5836] mt-1 truncate">{form.email || 'No email added'}</p>
            </div>

            <div className="w-full flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2 font-dm-sans text-[13px] text-[#6b5836] bg-[#fbf7ee] rounded-[10px] px-3 py-2.5">
                <Phone size={15} className="text-[#b89148] shrink-0" />
                <span className="truncate">{form.phone || 'No phone added'}</span>
              </div>
              <div className="flex items-center gap-2 font-dm-sans text-[13px] text-[#6b5836] bg-[#fbf7ee] rounded-[10px] px-3 py-2.5">
                <CalendarDays size={15} className="text-[#b89148] shrink-0" />
                <span className="truncate">{form.date_of_birth || 'No date of birth'}</span>
              </div>
            </div>

            <div className="w-full mt-1">
              <div className="flex items-center justify-between font-dm-sans text-[12px] text-[#6b5836] mb-1.5">
                <span>Profile completeness</span>
                <span className="font-semibold text-[#b89148]">{completeness}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f0e6cc] overflow-hidden">
                <div className="h-full bg-[#b89148] rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 h-[44px] rounded-[12px] border border-[#dcbd72] text-[#6b5836] font-dm-sans text-[14px] hover:bg-[#fbf7ee] transition-colors"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </aside>

          {/* Edit form */}
          <form onSubmit={handleSave} className="bg-white rounded-[20px] p-6 sm:p-8 flex flex-col gap-7 shadow-[0_10px_40px_rgba(184,145,72,0.14)]">
            <div className="flex flex-col gap-1">
              <p className="font-dm-sans text-[12px] tracking-[2px] uppercase text-[#b89148]">Orienda International Hospital</p>
              <h1 className="font-cormorant font-bold text-[34px] leading-none text-[#3b2d17]">My Profile</h1>
              <p className="font-dm-sans text-[14px] text-[#6b5836] mt-1">Keep your details up to date for faster appointments.</p>
            </div>

            {/* Personal */}
            <section className="flex flex-col gap-4">
              <h3 className="font-dm-sans text-[13px] font-bold uppercase tracking-[1px] text-[#9a7838]">Personal information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Full name <span className="text-[#b89148]">*</span></label>
                  <input className={fieldCls} value={form.display_name} onChange={event => set('display_name', event.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Date of birth</label>
                  <div className="relative">
                    <CalendarDays size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b89148]" />
                    <input className={`${fieldCls} pl-11`} type="date" value={form.date_of_birth} onChange={event => set('date_of_birth', event.target.value)} />
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-[#f0e6cc]" />

            {/* Contact */}
            <section className="flex flex-col gap-4">
              <h3 className="font-dm-sans text-[13px] font-bold uppercase tracking-[1px] text-[#9a7838]">Contact details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Phone <span className="text-[#b89148]">*</span></label>
                  <div className="relative">
                    <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b89148]" />
                    <input className={`${fieldCls} pl-11`} type="tel" value={form.phone} onChange={event => set('phone', event.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Email</label>
                  <div className="relative">
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b89148]" />
                    <input className={`${fieldCls} pl-11`} type="email" value={form.email} onChange={event => set('email', event.target.value)} />
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-[#f0e6cc]" />

            {/* Preferences */}
            <section className="flex flex-col gap-4">
              <h3 className="font-dm-sans text-[13px] font-bold uppercase tracking-[1px] text-[#9a7838]">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Gender</label>
                  <select className={fieldCls} value={form.gender} onChange={event => set('gender', event.target.value)}>
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Preferred language</label>
                  <select className={fieldCls} value={form.language} onChange={event => set('language', event.target.value)}>
                    <option value="en">English</option>
                    <option value="km">ខ្មែរ (Khmer)</option>
                    <option value="zh">中文 (Chinese)</option>
                  </select>
                </div>
              </div>
            </section>

            {error && (
              <p className="font-dm-sans text-[13px] text-[#991b1b] bg-[#fee2e2] rounded-[10px] px-3 py-2">{error}</p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving || saved}
                className="inline-flex items-center justify-center gap-2 h-[48px] px-7 rounded-[12px] bg-[#b89148] hover:bg-[#9a7630] disabled:opacity-70 text-white font-dm-sans font-semibold text-[15px] transition-colors"
              >
                {saving
                  ? <span className="inline-block w-[18px] h-[18px] border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  : saved ? <Check size={18} /> : <Save size={18} />}
                {saved ? 'Saved' : saving ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Appointment history */}
        <section className="mt-6 bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(184,145,72,0.14)]">
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays size={20} className="text-[#b89148]" />
            <h2 className="font-cormorant font-bold text-[26px] text-[#3b2d17] leading-none">Appointment History</h2>
          </div>

          {apptLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-[3px] border-[#b89148] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-[#fbf7ee] flex items-center justify-center">
                <CalendarDays size={26} className="text-[#dcbd72]" />
              </div>
              <p className="font-dm-sans text-[15px] text-[#6b5836]">You have no appointments yet.</p>
              <Link
                href="/appointments"
                className="mt-1 inline-flex items-center justify-center h-[42px] px-6 rounded-[12px] bg-[#b89148] hover:bg-[#9a7630] text-white font-dm-sans text-[14px] font-medium transition-colors"
              >
                Book an appointment
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {appointments.map((a) => (
                <div key={a.id} onClick={() => setSelectedAppt(a)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSelectedAppt(a) }} className="border border-[#f0e6cc] rounded-[14px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer hover:border-[#dcbd72] hover:shadow-[0_4px_16px_rgba(184,145,72,0.10)] transition-all">
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5 font-dm-sans text-[14px] font-medium text-[#3b2d17]">
                        <CalendarDays size={15} className="text-[#b89148] shrink-0" />{formatApptDate(a.preferred_date)}
                      </span>
                      {a.preferred_time && (
                        <span className="flex items-center gap-1.5 font-dm-sans text-[14px] text-[#3b2d17]">
                          <Clock size={15} className="text-[#b89148] shrink-0" />{a.preferred_time}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {a.doctor_name && (
                        <span className="flex items-center gap-1.5 font-dm-sans text-[13px] text-[#6b5836]">
                          <Stethoscope size={14} className="text-[#b89148] shrink-0" />{a.doctor_name}
                        </span>
                      )}
                      {a.department_name && <span className="font-dm-sans text-[13px] text-[#6b5836]">{a.department_name}</span>}
                      {a.branch_name && (
                        <span className="flex items-center gap-1.5 font-dm-sans text-[13px] text-[#6b5836]">
                          <MapPin size={14} className="text-[#b89148] shrink-0" />{a.branch_name}
                        </span>
                      )}
                    </div>
                    {a.message && <p className="font-dm-sans text-[13px] text-[#9a8a6a] italic truncate">&ldquo;{a.message}&rdquo;</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <span className={`px-3 py-1 rounded-full font-dm-sans text-[12px] font-medium capitalize ${STATUS_STYLES[a.status] || 'bg-[#fbf7ee] text-[#6b5836] border border-[#f0e6cc]'}`}>
                      {a.status || 'pending'}
                    </span>
                    <ChevronRight size={18} className="text-[#b89148]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Appointment detail modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4" onClick={() => setSelectedAppt(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-[#fbf7ee] rounded-[22px] shadow-[0_8px_40px_rgba(89,69,34,0.25)] p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAppt(null)}
              className="absolute top-5 right-5 text-[#b89148] hover:text-[#3b2d17] transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col gap-1 mb-4">
              <p className="font-dm-sans text-[12px] tracking-[2px] uppercase text-[#b89148]">Appointment</p>
              <h3 className="font-cormorant font-bold text-[28px] text-[#3b2d17] leading-none">Details</h3>
            </div>

            <span className={`inline-block px-3 py-1 rounded-full font-dm-sans text-[12px] font-medium capitalize mb-4 ${STATUS_STYLES[selectedAppt.status] || 'bg-[#fbf7ee] text-[#6b5836] border border-[#f0e6cc]'}`}>
              {selectedAppt.status || 'pending'}
            </span>

            <div className="flex flex-col">
              {[
                { label: 'Date', value: formatApptDate(selectedAppt.preferred_date), icon: <CalendarDays size={16} /> },
                { label: 'Time', value: selectedAppt.preferred_time, icon: <Clock size={16} /> },
                { label: 'Doctor', value: selectedAppt.doctor_name, icon: <Stethoscope size={16} /> },
                { label: 'Department', value: selectedAppt.department_name, icon: <FileText size={16} /> },
                { label: 'Branch', value: selectedAppt.branch_name, icon: <MapPin size={16} /> },
                { label: 'Patient', value: selectedAppt.patient_name, icon: <User size={16} /> },
                { label: 'Phone', value: selectedAppt.patient_phone, icon: <Phone size={16} /> },
                { label: 'Email', value: selectedAppt.patient_email, icon: <Mail size={16} /> },
                { label: 'Note', value: selectedAppt.message, icon: <FileText size={16} /> },
                { label: 'Booked on', value: selectedAppt.created_at ? new Date(selectedAppt.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '', icon: <CalendarDays size={16} /> },
              ].filter((r) => r.value).map((r) => (
                <div key={r.label} className="flex items-start gap-3 py-3 border-b border-[#f0e6cc] last:border-0">
                  <span className="text-[#b89148] mt-0.5 shrink-0">{r.icon}</span>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-dm-sans text-[12px] text-[#9a8a6a]">{r.label}</span>
                    <span className="font-dm-sans text-[14px] text-[#3b2d17] break-words">{r.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
