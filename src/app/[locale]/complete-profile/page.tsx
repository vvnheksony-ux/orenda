'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { UserRound, Check } from 'lucide-react'
import LoginModal from '@/components/shared/LoginModal'
import { CustomSelect } from '@/components/shared/FormControls'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import { setProfileComplete } from '@/lib/profile-status'

const supabase = createClient()

type ProfileForm = {
  display_name: string
  phone: string
  date_of_birth: string
  gender: string
  language: string
}

const EMPTY: ProfileForm = { display_name: '', phone: '', date_of_birth: '', gender: '', language: 'en' }

// Matches the site's form fields + CustomSelect (border #dcbd72, white bg).
const fieldCls = 'w-full border border-[#dcbd72] rounded-[12px] px-4 py-3 font-dm-sans text-[15px] text-[#3b2d17] bg-white outline-none focus:border-[#b89148] transition-colors'
const labelCls = 'font-dm-sans text-[13px] font-medium text-[#6b5836]'

// Language is stored as a code (en/km/zh) but shown as a label in the dropdown.
const LANG_LABELS: Record<string, string> = { en: 'English', km: 'ខ្មែរ (Khmer)', zh: '中文 (Chinese)' }
const LANG_CODE: Record<string, string> = { English: 'en', 'ខ្មែរ (Khmer)': 'km', '中文 (Chinese)': 'zh' }

// Standalone full-screen shell — NO site nav/footer, so onboarding is a
// separate gate the user must finish before reaching the website.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#fbf7ee] to-[#f3ead6] flex flex-col items-center justify-center px-4 py-[48px]">
      {children}
    </div>
  )
}

export default function CompleteProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<ProfileForm>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading || !user) return
    let cancelled = false
    supabase
      .from('profiles')
      .select('display_name, phone, date_of_birth, gender, language')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (cancelled) return
        const editMode = new URLSearchParams(window.location.search).get('edit') === '1'
        const isComplete = Boolean(data?.display_name?.trim() && data?.phone?.trim())
        if (isComplete && !editMode) {
          setProfileComplete(true)
          router.replace('/')
          return
        }
        if (data) {
          setForm({
            display_name: data.display_name ?? '',
            phone: data.phone ?? '',
            date_of_birth: data.date_of_birth ?? '',
            gender: data.gender ?? '',
            language: data.language ?? 'en',
          })
        }
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [user, authLoading, router])

  const set = (k: keyof ProfileForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const name = form.display_name.trim()
    const phone = form.phone.trim()
    if (!name) { setError('Please enter your full name.'); return }
    if (!phone) { setError('Please enter your phone number.'); return }
    if (phone.replace(/\D/g, '').length < 6) { setError('Please enter a valid phone number.'); return }

    setSaving(true)
    setError('')
    const { error: saveError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          display_name: name,
          phone,
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
    setTimeout(() => router.push('/'), 900)
  }

  // Not signed in → must authenticate first (onboarding only applies to users).
  if (!authLoading && !user) {
    return (
      <Shell>
        <LoginModal
          open={true}
          onClose={() => router.push('/login')}
          onSuccess={() => window.location.reload()}
          redirectTo="/complete-profile"
          initialView="login"
          message="Sign in to continue."
        />
      </Shell>
    )
  }

  if (authLoading || loading) {
    return (
      <Shell>
        <div className="w-10 h-10 border-4 border-[#b89148] border-t-transparent rounded-full animate-spin" />
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="w-full max-w-[460px]">
        {/* Brand + heading */}
        <div className="flex flex-col items-center gap-[14px] mb-[26px] text-center">
          <div className="w-16 h-16 rounded-full bg-[#b89148] flex items-center justify-center shadow-[0_6px_20px_rgba(184,145,72,0.35)]">
            <UserRound size={30} className="text-white" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <p className="font-dm-sans text-[12px] tracking-[2px] uppercase text-[#b89148]">Orienda International Hospital</p>
            <h1 className="font-cormorant font-bold text-[34px] text-[#3b2d17] leading-none">Complete your profile</h1>
            <p className="font-dm-sans text-[14px] text-[#6b5836]">Just a few details to finish setting up your account.</p>
          </div>
        </div>

        {/* Form card */}
        <form onSubmit={handleSave} className="bg-white rounded-[18px] p-[28px] sm:p-[32px] flex flex-col gap-[18px]" style={{ boxShadow: '0px 10px 40px rgba(184,145,72,0.16)' }}>
          <div className="flex flex-col gap-[7px]">
            <label className={labelCls}>Full name <span className="text-[#b89148]">*</span></label>
            <input className={fieldCls} value={form.display_name} onChange={e => set('display_name', e.target.value)} placeholder="Your full name" required />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className={labelCls}>Phone <span className="text-[#b89148]">*</span></label>
            <input className={fieldCls} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="e.g. 012 345 678" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[7px]">
              <label className={labelCls}>Date of birth</label>
              <input className={fieldCls} type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </div>
            <CustomSelect
              label="Gender"
              labelCls={labelCls}
              value={form.gender}
              onChange={v => set('gender', v)}
              options={['Male', 'Female', 'Other']}
              placeholder="Prefer not to say"
            />
          </div>

          <CustomSelect
            label="Preferred language"
            labelCls={labelCls}
            value={LANG_LABELS[form.language] ?? 'English'}
            onChange={v => set('language', LANG_CODE[v] ?? 'en')}
            options={['English', 'ខ្មែរ (Khmer)', '中文 (Chinese)']}
          />

          {error && (
            <p className="font-dm-sans text-[13px] text-[#991b1b] bg-[#fee2e2] rounded-[10px] px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving || saved}
            className="mt-[4px] w-full py-3.5 rounded-[12px] bg-[#b89148] hover:bg-[#9a7630] disabled:opacity-60 transition-colors text-white font-dm-sans font-bold text-[16px] flex items-center justify-center gap-2"
          >
            {saved ? (<><Check size={18} /> Saved</>) : saving ? 'Saving…' : 'Save & continue'}
          </button>

          <p className="font-dm-sans text-[12px] text-[#9a8a6a] text-center">
            <span className="text-[#b89148]">*</span> Required to book appointments.
          </p>
        </form>
      </div>
    </Shell>
  )
}
