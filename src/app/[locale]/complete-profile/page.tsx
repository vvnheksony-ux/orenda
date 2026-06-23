'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from '@/i18n/routing'
import { Check } from 'lucide-react'
import LoginModal from '@/components/shared/LoginModal'
import { CustomSelect } from '@/components/shared/FormControls'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import { useTranslations } from 'next-intl'
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
const fieldCls = 'w-full rounded-[12px] border border-[#e7d6a8] bg-white px-4 py-3 font-dm-sans text-[15px] text-[#3b2d17] outline-none transition-all focus:border-[#b89148] focus:ring-4 focus:ring-[#b89148]/10'
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
  const t = useTranslations('CompleteProfile')
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
      }, () => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user, authLoading, router])

  const set = (k: keyof ProfileForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const name = form.display_name.trim()
    const phone = form.phone.trim()
    if (!name) { setError(t('errorName')); return }
    if (!phone) { setError(t('errorPhone')); return }
    if (phone.replace(/\D/g, '').length < 6) { setError(t('errorPhoneValid')); return }

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
      setError(saveError.message || t('errorSave'))
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
            message={t('signInToContinue')}
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
    <div className="min-h-screen w-full flex bg-[var(--background)]">

      {/* Welcome / brand panel */}
      <aside
        className="hidden md:flex md:w-[40%] relative flex-col justify-between px-12 py-14 text-white overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #cba85a 0%, #b89148 45%, #876327 100%)' }}
      >
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-28 -left-16 w-80 h-80 rounded-full bg-white/[0.06]" />

        <div className="relative flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full bg-white/95 overflow-hidden shrink-0">
            <Image src="/images/logo-emblem.png" alt="Orienda" fill sizes="48px" className="object-contain p-1.5" />
          </div>
          <span className="font-cormorant font-bold text-[22px] leading-none">{t('orienda')}</span>
        </div>

        <div className="relative flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <h2 className="font-cormorant font-bold text-[40px] leading-[1.05] max-w-[420px]">{t('welcomeTitle')}</h2>
            <p className="font-dm-sans text-[15px] text-white/85 leading-relaxed max-w-[380px]">
              {t('welcomeDesc')}
            </p>
          </div>
          <ul className="flex flex-col gap-4">
            {[t('benefit1'), t('benefit2'), t('benefit3')].map(item => (
              <li key={item} className="flex items-center gap-3 font-dm-sans text-[15px] text-white/95">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0"><Check size={14} /></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-dm-sans text-[12px] text-white/70">{t('privacy')}</p>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[460px]">
          <div className="flex flex-col gap-2 mb-7">
            <p className="font-dm-sans text-[12px] tracking-[2px] uppercase text-[#b89148]">{t('almostThere')}</p>
            <h1 className="font-cormorant font-bold text-[34px] sm:text-[40px] text-[#3b2d17] leading-none">{t('heading')}</h1>
            <p className="font-dm-sans text-[14px] text-[#6b5836]">{t('subtitle')}</p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-[7px]">
              <label className={labelCls}>{t('fullName')} <span className="text-[#b89148]">*</span></label>
              <input className={fieldCls} value={form.display_name} onChange={e => set('display_name', e.target.value)} placeholder={t('fullNamePlaceholder')} required />
            </div>

            <div className="flex flex-col gap-[7px]">
              <label className={labelCls}>{t('phone')} <span className="text-[#b89148]">*</span></label>
              <input className={fieldCls} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder={t('phonePlaceholder')} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div className="flex flex-col gap-[7px]">
                <label className={labelCls}>{t('dateOfBirth')}</label>
                <input className={fieldCls} type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
              </div>
              <CustomSelect
                label={t('gender')}
                labelCls={labelCls}
                value={form.gender}
                onChange={v => set('gender', v)}
                options={[t('male'), t('female'), t('other')]}
                placeholder={t('preferNotToSay')}
              />
            </div>

            <CustomSelect
              label={t('preferredLanguage')}
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
              className="mt-[4px] w-full py-3.5 rounded-[12px] bg-[#b89148] hover:bg-[#9a7630] disabled:opacity-60 transition-colors text-white font-dm-sans font-bold text-[16px] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(184,145,72,0.3)]"
            >
              {saved ? (<><Check size={18} /> {t('saved')}</>) : saving ? t('saving') : t('saveAndContinue')}
            </button>

            <p className="font-dm-sans text-[12px] text-[#9a8a6a] text-center">
              <span className="text-[#b89148]">*</span> {t('required')}
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
