'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, CalendarDays, Camera, Check, ChevronRight, Clock, FileText, LogOut, Mail, MapPin, Phone, Save, Sparkles, Stethoscope, User, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth-context'
import { setProfileComplete } from '@/lib/profile-status'
import SignOutModal from '@/components/shared/SignOutModal'
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

const fieldCls = 'w-full rounded-[12px] border border-[#e7d6a8] bg-[#fdfbf6] px-4 py-2.5 font-dm-sans text-[15px] text-[#3b2d17] outline-none transition-all focus:border-[#b89148] focus:bg-white focus:ring-4 focus:ring-[#b89148]/10'
const labelCls = 'font-dm-sans text-[13px] font-medium text-[#6b5836]'

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  km: 'ខ្មែរ (Khmer)',
  zh: '中文 (Chinese)',
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  completed: 'bg-blue-50 text-blue-700 border border-blue-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
}

const formatApptDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Earliest available'

export default function ProfilePage() {
  const t = useTranslations('Profile')
  const { user, loading: authLoading } = useAuth()
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
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  // Picked-but-not-yet-saved image URLs — staged here and only persisted on Save (no auto-save).
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null)
  const [pendingCoverUrl, setPendingCoverUrl] = useState<string | null>(null)
  const [apptPage, setApptPage] = useState(1)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const ITEMS_PER_PAGE = 5
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE)
  const paginatedAppts = appointments.slice((apptPage - 1) * ITEMS_PER_PAGE, apptPage * ITEMS_PER_PAGE)

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
      .then(d => { if (!cancelled) { setAppointments(Array.isArray(d?.docs) ? d.docs : []); setApptPage(1) } })
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

    // Persist any staged profile/cover images first (these were not auto-saved).
    if (pendingPhotoUrl !== null || pendingCoverUrl !== null) {
      const { error: imgError } = await supabase.auth.updateUser({
        data: {
          photo_url: pendingPhotoUrl ?? user.user_metadata?.photo_url ?? null,
          cover_url: pendingCoverUrl ?? user.user_metadata?.cover_url ?? null,
        },
      })
      if (imgError) {
        setSaving(false)
        setError(imgError.message || 'Could not save your photo. Please try again.')
        return
      }
      setPendingPhotoUrl(null)
      setPendingCoverUrl(null)
    }

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
    setRedirecting(true)
    setTimeout(() => router.push('/'), 3000)
  }

  const STORAGE_BUCKET = 'orienda-media'

  const uploadImage = async (file: File, prefix: string): Promise<string | null> => {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${prefix}/${user!.id}_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })
    if (error) { setError(error.message); return null }
    const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    return publicUrl
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    setError('')
    const url = await uploadImage(file, 'profiles/avatars')
    if (url) {
      // Stage the new avatar — it's persisted when the user clicks Save.
      setPendingPhotoUrl(url)
      setSaved(false)
    }
    setUploadingAvatar(false)
    if (avatarInputRef.current) avatarInputRef.current.value = ''
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingCover(true)
    setError('')
    const url = await uploadImage(file, 'profiles/covers')
    if (url) {
      // Stage the new cover — it's persisted when the user clicks Save.
      setPendingCoverUrl(url)
      setSaved(false)
    }
    setUploadingCover(false)
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  const handleSignOut = () => {
    setSignOutOpen(true)
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] pt-[140px] flex items-center justify-center">
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

  // Show the staged image as a preview if one was just picked, otherwise the saved one.
  const avatarSrc = pendingPhotoUrl ?? user?.user_metadata?.photo_url ?? null
  const coverSrc = pendingCoverUrl ?? user?.user_metadata?.cover_url ?? null

  const completionFields = [form.display_name, form.phone, form.email, form.date_of_birth, form.gender]
  const completeness = Math.round(
    (completionFields.filter(value => value && value.trim()).length / completionFields.length) * 100,
  )

  const notAdded = t('detailNotAdded')
  const notSet = t('detailNotSet')
  const quickInfo = [
    { icon: <Phone size={15} />, label: t('detailPhone'), value: form.phone || notAdded },
    { icon: <Mail size={15} />, label: t('detailEmail'), value: form.email || notAdded },
    { icon: <CalendarDays size={15} />, label: t('dateOfBirth'), value: form.date_of_birth || notAdded },
    { icon: <User size={15} />, label: t('gender'), value: form.gender || notSet },
    { icon: <Sparkles size={15} />, label: t('preferredLanguage'), value: LANGUAGE_LABELS[form.language] || form.language },
  ]

  return (
    <main className="min-h-screen bg-[var(--background)] pt-[110px] pb-[80px] px-4">
      {redirecting && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[var(--background)]">
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-[64px] h-[64px] animate-pulse">
              <Image src="/images/logo-emblem.png" alt="Orienda" fill sizes="64px" className="object-contain" priority />
            </div>
            <div className="w-9 h-9 border-[3px] border-[#b89148] border-t-transparent rounded-full animate-spin" />
            <p className="font-dm-sans text-[14px] text-[#6b5836]">Saving your profile…</p>
          </div>
        </div>
      )}
      <SignOutModal open={signOutOpen} onClose={() => setSignOutOpen(false)} />

      <div className="w-full max-w-[960px] mx-auto flex flex-col gap-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex w-fit items-center gap-1.5 font-dm-sans text-[14px] text-[#6b5836] hover:text-[#3b2d17] transition-colors"
        >
          <ArrowLeft size={16} />
          {t('back')}
        </button>

        {/* Cover header */}
        <section className="relative overflow-hidden rounded-[26px] bg-white shadow-[0_10px_40px_rgba(184,145,72,0.14)]">
          <div
            className="relative h-[140px] sm:h-[160px] cursor-pointer group overflow-hidden"
            onClick={() => coverInputRef.current?.click()}
          >
            {coverSrc ? (
              <Image src={coverSrc} alt="Cover" fill className="object-cover" sizes="960px" unoptimized />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-[#b89148] via-[#c8a35c] to-[#8a6a30]" />
                <div className="pointer-events-none absolute -right-6 -top-8 h-[200px] w-[200px] opacity-[0.12]">
                  <Image src="/images/logo-emblem.png" alt="" fill sizes="200px" className="object-contain" />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_55%)]" />
              </>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-white/85 px-3.5 py-1.5 font-dm-sans text-[12px] text-[#3b2d17] shadow opacity-0 transition-opacity group-hover:opacity-100">
              {uploadingCover ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#b89148] border-t-transparent" />
              ) : (
                <Camera size={14} className="mr-1.5 shrink-0" />
              )}
              {uploadingCover ? 'Uploading…' : coverSrc ? 'Change cover' : 'Add cover'}
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>

          <div className="px-6 sm:px-9 pb-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                <div className="relative -mt-16 shrink-0 cursor-pointer group" onClick={() => avatarInputRef.current?.click()}>
                  <div className="relative flex h-[112px] w-[112px] items-center justify-center rounded-full bg-gradient-to-br from-[#d8b765] to-[#b89148] font-cormorant text-[42px] font-bold text-white ring-4 ring-white shadow-[0_8px_24px_rgba(184,145,72,0.3)] overflow-hidden">
                    {avatarSrc ? (
                      <Image src={avatarSrc} alt="Profile" fill className="object-cover" sizes="112px" unoptimized />
                    ) : (
                      initials
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/40 to-transparent pb-1 pt-4 opacity-0 transition-opacity group-hover:opacity-100">
                      {uploadingAvatar ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Camera size={16} className="text-white drop-shadow-sm" />
                      )}
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-dm-sans text-[11px] font-bold text-[#b89148] shadow-[0_2px_8px_rgba(184,145,72,0.25)]">
                    {completeness}%
                  </span>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div className="min-w-0 text-center sm:pb-1 sm:text-left">
                  <h1 className="truncate font-cormorant text-[30px] font-bold leading-tight text-[#3b2d17]">{form.display_name || t('yourName')}</h1>
                  <p className="mt-0.5 truncate font-dm-sans text-[14px] text-[#6b5836]">{form.email || t('noEmail')}</p>
                  <div className="mt-2.5 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {form.phone && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--background)] px-3 py-1 font-dm-sans text-[12px] text-[#6b5836]">
                        <Phone size={13} className="text-[#b89148]" />{form.phone}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--background)] px-3 py-1 font-dm-sans text-[12px] text-[#6b5836]">
                      <Sparkles size={13} className="text-[#b89148]" />{LANGUAGE_LABELS[form.language] || form.language}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[12px] border border-[#dcbd72] px-4 py-2.5 font-dm-sans text-[14px] text-[#6b5836] transition-colors hover:bg-[var(--background)]"
              >
                <LogOut size={16} />
                {t('signOut')}
              </button>
            </div>
          </div>
        </section>

        {/* Body */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">

          {/* Edit form */}
          <form onSubmit={handleSave} className="flex flex-col gap-7 rounded-[22px] bg-white p-6 shadow-[0_10px_40px_rgba(184,145,72,0.14)] sm:p-8">
            <div className="flex flex-col gap-1">
              <p className="font-dm-sans text-[12px] uppercase tracking-[2px] text-[#b89148]">{t('orienda')}</p>
              <h2 className="font-cormorant text-[30px] font-bold leading-none text-[#3b2d17]">{t('heading')}</h2>
              <p className="mt-1 font-dm-sans text-[14px] text-[#6b5836]">{t('subtitle')}</p>
            </div>

            {/* Personal */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#f6edd7] text-[#b89148]"><User size={16} /></span>
                <h3 className="font-dm-sans text-[14px] font-semibold text-[#3b2d17]">{t('personalInfo')}</h3>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>{t('fullName')}</label>
                  <input className={fieldCls} value={form.display_name} onChange={event => set('display_name', event.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>{t('dateOfBirth')}</label>
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
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#f6edd7] text-[#b89148]"><Mail size={16} /></span>
                <h3 className="font-dm-sans text-[14px] font-semibold text-[#3b2d17]">{t('contactDetails')}</h3>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>{t('phone')}</label>
                  <div className="relative">
                    <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b89148]" />
                    <input className={`${fieldCls} pl-11`} type="tel" value={form.phone} onChange={event => set('phone', event.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>{t('email')}</label>
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
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#f6edd7] text-[#b89148]"><Sparkles size={16} /></span>
                <h3 className="font-dm-sans text-[14px] font-semibold text-[#3b2d17]">{t('preferences')}</h3>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>{t('gender')}</label>
                  <select className={fieldCls} value={form.gender} onChange={event => set('gender', event.target.value)}>
                    <option value="">{t('preferNotToSay')}</option>
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>{t('preferredLanguage')}</label>
                  <select className={fieldCls} value={form.language} onChange={event => set('language', event.target.value)}>
                    <option value="en">English</option>
                    <option value="km">ខ្មែរ (Khmer)</option>
                    <option value="zh">中文 (Chinese)</option>
                  </select>
                </div>
              </div>
            </section>

            {error && (
              <p className="rounded-[10px] bg-[#fee2e2] px-3 py-2 font-dm-sans text-[13px] text-[#991b1b]">{error}</p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving || saved}
                className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#b89148] px-7 font-dm-sans text-[15px] font-semibold text-white transition-colors hover:bg-[#9a7630] disabled:opacity-70"
              >
                {saving
                  ? <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                  : saved ? <Check size={18} /> : <Save size={18} />}
                {saved ? t('saved') : saving ? t('saving') : t('saveProfile')}
              </button>
            </div>
          </form>

          {/* Side panel */}
          <aside className="flex flex-col gap-5">
            {/* Completeness */}
            <div className="rounded-[22px] bg-white p-6 shadow-[0_10px_40px_rgba(184,145,72,0.14)]">
              <div className="mb-1.5 flex items-center justify-between font-dm-sans text-[13px] text-[#6b5836]">
                <span className="font-medium">{t('profileCompleteness')}</span>
                <span className="font-semibold text-[#b89148]">{completeness}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0e6cc]">
                <div className="h-full rounded-full bg-[#b89148] transition-all duration-500" style={{ width: `${completeness}%` }} />
              </div>
              <p className="mt-3 font-dm-sans text-[12px] leading-relaxed text-[#9a8a6a]">
                {completeness === 100 ? t('completeMessage') : t('incompleteMessage')}
              </p>
            </div>

            {/* At a glance */}
            <div className="flex flex-1 flex-col rounded-[22px] bg-white p-6 shadow-[0_10px_40px_rgba(184,145,72,0.14)]">
              <h3 className="mb-4 font-dm-sans text-[13px] font-bold uppercase tracking-[1px] text-[#9a7838]">{t('atAGlance')}</h3>
              <div className="flex flex-col gap-3">
                {quickInfo.map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--background)] text-[#b89148]">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="font-dm-sans text-[11px] uppercase tracking-[0.5px] text-[#9a8a6a]">{item.label}</p>
                      <p className="truncate font-dm-sans text-[14px] text-[#3b2d17]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between rounded-[12px] bg-[var(--background)] px-4 py-3">
                <span className="font-dm-sans text-[13px] text-[#6b5836]">{t('appointmentsCount')}</span>
                <span className="font-cormorant text-[22px] font-bold text-[#b89148]">{apptLoading ? '\u2014' : appointments.length}</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Appointment history */}
        <section className="rounded-[22px] bg-white p-6 shadow-[0_10px_40px_rgba(184,145,72,0.14)] sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays size={20} className="text-[#b89148]" />
            <h2 className="font-cormorant text-[26px] font-bold leading-none text-[#3b2d17]">{t('appointmentHistory')}</h2>
          </div>

          {apptLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#b89148] border-t-transparent" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--background)]">
                <CalendarDays size={26} className="text-[#dcbd72]" />
              </div>
              <p className="font-dm-sans text-[15px] text-[#6b5836]">{t('noAppointments')}</p>
              <Link
                href="/appointments"
                className="mt-1 inline-flex h-[42px] items-center justify-center rounded-[12px] bg-[#b89148] px-6 font-dm-sans text-[14px] font-medium text-white transition-colors hover:bg-[#9a7630]"
              >
                {t('bookAppointment')}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {paginatedAppts.map((a) => (
                  <div key={a.id} onClick={() => setSelectedAppt(a)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSelectedAppt(a) }} className="flex cursor-pointer flex-col gap-3 rounded-[14px] border border-[#f0e6cc] p-4 transition-all hover:border-[#dcbd72] hover:shadow-[0_4px_16px_rgba(184,145,72,0.10)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5 font-dm-sans text-[14px] font-medium text-[#3b2d17]">
                          <CalendarDays size={15} className="shrink-0 text-[#b89148]" />{formatApptDate(a.preferred_date)}
                        </span>
                        {a.preferred_time && (
                          <span className="flex items-center gap-1.5 font-dm-sans text-[14px] text-[#3b2d17]">
                            <Clock size={15} className="shrink-0 text-[#b89148]" />{a.preferred_time}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {a.doctor_name && (
                          <span className="flex items-center gap-1.5 font-dm-sans text-[13px] text-[#6b5836]">
                            <Stethoscope size={14} className="shrink-0 text-[#b89148]" />{a.doctor_name}
                          </span>
                        )}
                        {a.department_name && <span className="font-dm-sans text-[13px] text-[#6b5836]">{a.department_name}</span>}
                        {a.branch_name && (
                          <span className="flex items-center gap-1.5 font-dm-sans text-[13px] text-[#6b5836]">
                            <MapPin size={14} className="shrink-0 text-[#b89148]" />{a.branch_name}
                          </span>
                        )}
                      </div>
                      {a.message && <p className="truncate font-dm-sans text-[13px] italic text-[#9a8a6a]">&ldquo;{a.message}&rdquo;</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                      <span className={`rounded-full px-3 py-1 font-dm-sans text-[12px] font-medium capitalize ${STATUS_STYLES[a.status] || 'bg-[var(--background)] text-[#6b5836] border border-[#f0e6cc]'}`}>
                        {a.status || 'pending'}
                      </span>
                      <ChevronRight size={18} className="text-[#b89148]" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setApptPage(p => Math.max(1, p - 1))}
                  disabled={apptPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dcbd72] font-dm-sans text-[13px] text-[#6b5836] transition-colors hover:bg-[#f5ecd4] disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight size={16} className="rotate-180" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setApptPage(p)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full font-dm-sans text-[13px] transition-colors ${p === apptPage ? 'bg-[#b89148] text-white' : 'border border-[#dcbd72] text-[#6b5836] hover:bg-[#f5ecd4]'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setApptPage(p => Math.min(totalPages, p + 1))}
                  disabled={apptPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dcbd72] font-dm-sans text-[13px] text-[#6b5836] transition-colors hover:bg-[#f5ecd4] disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Appointment detail modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4" onClick={() => setSelectedAppt(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-[var(--background)] rounded-[22px] shadow-[0_8px_40px_rgba(89,69,34,0.25)] p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
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
              <p className="font-dm-sans text-[12px] tracking-[2px] uppercase text-[#b89148]">{t('detailAppointment')}</p>
              <h3 className="font-cormorant font-bold text-[28px] text-[#3b2d17] leading-none">{t('detailTitle')}</h3>
            </div>

            <span className={`inline-block px-3 py-1 rounded-full font-dm-sans text-[12px] font-medium capitalize mb-4 ${STATUS_STYLES[selectedAppt.status] || 'bg-[var(--background)] text-[#6b5836] border border-[#f0e6cc]'}`}>
              {selectedAppt.status || 'pending'}
            </span>

            <div className="flex flex-col">
              {[
                { label: t('detailDate'), value: formatApptDate(selectedAppt.preferred_date), icon: <CalendarDays size={16} /> },
                { label: t('detailTime'), value: selectedAppt.preferred_time, icon: <Clock size={16} /> },
                { label: t('detailDoctor'), value: selectedAppt.doctor_name, icon: <Stethoscope size={16} /> },
                { label: t('detailDepartment'), value: selectedAppt.department_name, icon: <FileText size={16} /> },
                { label: t('detailBranch'), value: selectedAppt.branch_name, icon: <MapPin size={16} /> },
                { label: t('detailPatient'), value: selectedAppt.patient_name, icon: <User size={16} /> },
                { label: t('detailPhone'), value: selectedAppt.patient_phone, icon: <Phone size={16} /> },
                { label: t('detailEmail'), value: selectedAppt.patient_email, icon: <Mail size={16} /> },
                { label: t('detailNote'), value: selectedAppt.message, icon: <FileText size={16} /> },
                { label: t('detailBookedOn'), value: selectedAppt.created_at ? new Date(selectedAppt.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '', icon: <CalendarDays size={16} /> },
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
