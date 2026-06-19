'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Check, LogOut, Mail, Phone, Save } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
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

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<ProfileForm>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

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
      })

    return () => { cancelled = true }
  }, [authLoading, router, user])

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
      </div>
    </main>
  )
}
