'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Check, LogOut, Mail, Phone, Save, UserRound } from 'lucide-react'
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

  return (
    <main className="min-h-screen bg-[#fbf7ee] pt-[120px] pb-[64px] px-4">
      <div className="w-full max-w-[920px] mx-auto">
        <div className="flex flex-col gap-4 mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex w-fit items-center gap-2 rounded-[12px] border border-[#dcbd72] bg-white/70 px-4 py-2 font-dm-sans text-[14px] text-[#6b5836] hover:bg-white transition-colors"
          >
            <ArrowLeft size={17} />
            Back
          </button>
          <div className="w-14 h-14 rounded-full bg-[#b89148] flex items-center justify-center shadow-[0_8px_24px_rgba(184,145,72,0.24)]">
            <UserRound size={26} className="text-white" />
          </div>
          <div>
            <p className="font-dm-sans text-[12px] tracking-[2px] uppercase text-[#b89148]">Orienda International Hospital</p>
            <h1 className="font-cormorant font-bold text-[42px] leading-none text-[#3b2d17]">Profile</h1>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-[18px] p-6 sm:p-8 flex flex-col gap-6 shadow-[0_10px_40px_rgba(184,145,72,0.14)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Full name <span className="text-[#b89148]">*</span></label>
              <input className={fieldCls} value={form.display_name} onChange={event => set('display_name', event.target.value)} />
            </div>

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

            <div className="flex flex-col gap-2">
              <label className={labelCls}>Date of birth</label>
              <div className="relative">
                <CalendarDays size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b89148]" />
                <input className={`${fieldCls} pl-11`} type="date" value={form.date_of_birth} onChange={event => set('date_of_birth', event.target.value)} />
              </div>
            </div>

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

          {error && (
            <p className="font-dm-sans text-[13px] text-[#991b1b] bg-[#fee2e2] rounded-[10px] px-3 py-2">{error}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 h-[46px] px-5 rounded-[12px] border border-[#dcbd72] text-[#6b5836] font-dm-sans text-[14px] hover:bg-[#fbf7ee] transition-colors"
            >
              <LogOut size={17} />
              Sign out
            </button>
            <button
              type="submit"
              disabled={saving || saved}
              className="inline-flex items-center justify-center gap-2 h-[46px] px-6 rounded-[12px] bg-[#b89148] hover:bg-[#9a7630] disabled:opacity-70 text-white font-dm-sans font-semibold text-[15px] transition-colors"
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? 'Saved' : saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
