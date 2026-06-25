'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import { Link } from '@/i18n/routing'
import SiteLayout from '@/components/layout/SiteLayout'
import { ArrowUp } from 'lucide-react'
import { DatePicker, CustomSelect } from '@/components/shared/FormControls'

export default function InquiryPage() {
  const t = useTranslations('Inquiry')
  const INQUIRY_TYPES = t.raw('inquiryTypes') as string[]
  const GENDERS = t.raw('genders') as string[]
  const NATIONALITIES = t.raw('nationalities') as string[]
  const COUNTRIES = t.raw('countries') as string[]
  const [hospitalNames, setHospitalNames] = useState<string[]>([])
  const [form, setForm] = useState({
    condition: '', inquiryType: '', hospitalName: '', question: '',
    firstName: '', lastName: '', email: '', phone: '',
    dob: '', gender: '', nationality: '', country: '',
  })
  const [consents, setConsents] = useState([false, false, false])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    fetch('/api/branches')
      .then(r => r.json())
      .then(d => { if (d.docs?.length) setHospitalNames(d.docs.map((b: { name: string }) => b.name)) })
      .catch(() => {})
  }, [])

  // Show the scroll-to-top button once the user scrolls down.
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // After a successful submit, scroll up so the confirmation is in view.
  useEffect(() => {
    if (status === 'success') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [status])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const toggleConsent = (i: number) => setConsents(c => c.map((v, idx) => idx === i ? !v : v))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName) { setError(t('errFirstName')); return }
    if (!form.email && !form.phone) { setError(t('errContact')); return }
    if (!consents[0]) { setError(t('errConsent')); return }
    const message = [
      form.condition   && `Condition/Treatment: ${form.condition}`,
      form.hospitalName && `Hospital: ${form.hospitalName}`,
      form.question    && `Question: ${form.question}`,
      form.dob         && `Date of Birth: ${form.dob}`,
      form.gender      && `Gender: ${form.gender}`,
      form.nationality && `Nationality: ${form.nationality}`,
      form.country     && `Country: ${form.country}`,
    ].filter(Boolean).join('\n')
    if (!message) { setError(t('errDetails')); return }
    setStatus('loading'); setError('')

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email || null,
          phone: form.phone || null,
          subject: form.inquiryType || 'General Inquiry',
          message,
          language: 'en',
        }),
      })

      clearTimeout(timeout)

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || `Server error (${res.status})`)
      }

      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      if (err.name === 'AbortError') {
        setError(t('errTimeout'))
      } else {
        setError(t('errGeneric'))
      }
    }
  }

  if (status === 'success') return (
    <SiteLayout>
      <div className="min-h-screen flex items-center justify-center pt-[160px] pb-20" style={{ background: 'var(--background)' }}>
        <div className="text-center flex flex-col items-center gap-6 px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#b89148' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none">{t('successTitle')}</h1>
          <p className="font-dm-sans text-[18px] text-gold-800 max-w-md">{t('successMessage')}</p>
          <Link href="/" className="mt-4 inline-flex items-center justify-center px-10 py-4 rounded-full font-dm-sans text-[16px] text-white" style={{ background: '#b89148' }}>
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </SiteLayout>
  )

  return (
    <SiteLayout>
      {showTop && (
        <button
          onClick={scrollToTop}
          aria-label={t('scrollToTop')}
          className="fixed bottom-6 left-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full bg-[#b89148] text-white shadow-[0_8px_24px_rgba(122,95,44,0.3)] transition-all hover:bg-[#a3803d]"
        >
          <ArrowUp size={22} />
        </button>
      )}
      <div className="min-h-screen pt-[90px] lg:pt-[150px] pb-[120px]" style={{ background: 'var(--background)' }}>
        <div className="content-shell flex flex-col gap-20">

          {/* ── Hero banner ── */}
          <PromotionStyleHero
            imageSrc="/images/inquiry-hero.jpg"
            imageAlt={t('heroTitle')}
            title={t('heroTitle')}
            lines={[
              t('heroLine1'),
              t('heroLine2'),
            ]}
          />

          {/* ── Inquiry Form ── */}
          <div
            className="rounded-[16px] p-5 sm:p-8 xl:p-10 shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)]"
            style={{ background: 'var(--background)' }}
          >
            <form onSubmit={submit} className="flex flex-col gap-16">

              {/* Header */}
              <div className="text-center flex flex-col gap-2">
                <h2 className="font-cormorant font-bold text-[28px] text-gold-900 leading-none">{t('formHeading')}</h2>
                <p className="font-dm-sans text-[16px] text-gold-800">{t('formSubtitle')}</p>
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-6">
                <Field label={t('conditionLabel')} value={form.condition} onChange={v => set('condition', v)} placeholder={t('conditionPlaceholder')} />
                <CustomSelect label={t('inquiryTypeLabel')} value={form.inquiryType} onChange={v => set('inquiryType', v)} options={INQUIRY_TYPES} placeholder={t('inquiryTypePlaceholder')} labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />
                <CustomSelect label={t('hospitalNameLabel')} value={form.hospitalName} onChange={v => set('hospitalName', v)} options={hospitalNames} placeholder={t('hospitalNamePlaceholder')} labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />

                {/* Your Question */}
                <div className="flex flex-col gap-2">
                  <label className="font-dm-sans font-medium text-[16px] text-gold-900">{t('questionLabel')}</label>
                  <textarea
                    value={form.question}
                    onChange={e => set('question', e.target.value)}
                    placeholder={t('questionPlaceholder')}
                    rows={6}
                    className="w-full px-4 py-3 rounded-[12px] border border-[#dcbd72] font-dm-sans text-[16px] text-gold-900 outline-none resize-none focus:border-gold-500 transition-colors bg-white"
                  />
                </div>

                {/* First + Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label={t('firstNameLabel')} value={form.firstName} onChange={v => set('firstName', v)} placeholder={t('firstNamePlaceholder')} />
                  <Field label={t('lastNameLabel')} value={form.lastName} onChange={v => set('lastName', v)} placeholder={t('lastNamePlaceholder')} />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label={t('emailLabel')} type="email" value={form.email} onChange={v => set('email', v)} placeholder={t('emailPlaceholder')} />
                  <Field label={t('phoneLabel')} type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder={t('phonePlaceholder')} />
                </div>

                {/* DOB + Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DatePicker label={t('dobLabel')} value={form.dob} onChange={v => set('dob', v)} placeholder={t('dobPlaceholder')} labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />
                  <CustomSelect label={t('genderLabel')} value={form.gender} onChange={v => set('gender', v)} options={GENDERS} placeholder={t('genderPlaceholder')} labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />
                </div>

                {/* Nationality + Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomSelect label={t('nationalityLabel')} value={form.nationality} onChange={v => set('nationality', v)} options={NATIONALITIES} placeholder={t('nationalityPlaceholder')} labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />
                  <CustomSelect label={t('countryLabel')} value={form.country} onChange={v => set('country', v)} options={COUNTRIES} placeholder={t('countryPlaceholder')} labelCls="font-dm-sans font-medium text-[16px] text-gold-900" />
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex flex-col gap-4">
                {[
                  t('consent1'),
                  t('consent2'),
                  t('consent3'),
                ].map((text, i) => (
                  <label key={i} className="flex gap-4 items-start cursor-pointer">
                    <button
                      type="button"
                      onClick={() => toggleConsent(i)}
                      className="shrink-0 size-6 rounded-[12px] border-[1.5px] flex items-center justify-center transition-colors mt-0.5"
                      style={{
                        borderColor: '#b89148',
                        background: consents[i] ? '#b89148' : 'transparent',
                      }}
                    >
                      {consents[i] && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span className="font-dm-sans text-[16px] text-gold-900 leading-normal">{text}</span>
                  </label>
                ))}
              </div>

              {error && <p className="font-dm-sans text-[14px] text-red-600 text-center">{error}</p>}

              {/* Submit */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-4 rounded-[12px] font-dm-sans font-semibold text-[20px] text-gold-50 hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ background: '#b89148', minWidth: '232px' }}
                >
                  {status === 'loading' ? t('submitting') : t('submit')}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-dm-sans font-medium text-[16px] text-gold-900">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-[12px] border border-[#dcbd72] font-dm-sans text-[16px] text-gold-900 outline-none focus:border-gold-500 transition-colors bg-white"
      />
    </div>
  )
}
