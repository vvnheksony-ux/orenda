'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import SiteLayout from '@/components/layout/SiteLayout'
import Reveal from '@/components/shared/Reveal'
import { fetchJsonRetry } from '@/lib/fetch-retry'

export default function EmergencyPage() {
  const [form, setForm] = useState({ contact_info: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')

  useEffect(() => {
    fetchJsonRetry<any>('/api/branches')
      .then(d => { if (d.docs?.[0]?.phone) setEmergencyPhone(d.docs[0].phone) })
      .catch(() => {})
  }, [])

  const t = useTranslations('Emergency')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contact_info || !form.message) { setError(t('errorRequired')); return }
    setStatus('loading'); setError('')
    try {
      const res = await fetch('/api/emergency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setStatus('error'); setError(d.error || t('errorGeneric')); return
      }
      setStatus('success')
    } catch {
      setStatus('error'); setError(t('errorNetwork'))
    }
  }

  if (status === 'success') return (
    <SiteLayout>
      <div className="min-h-screen flex items-center justify-center pt-[90px] lg:pt-[150px]" style={{ background: 'var(--background)' }}>
        <div className="text-center flex flex-col items-center gap-6 px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-600">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none">{t('alertSent')}</h1>
          <p className="font-dm-sans text-[18px] text-gold-800 max-w-md">{t('alertSentDesc')}{emergencyPhone ? <>{t('alertSentCall', { phone: emergencyPhone })}</> : t('alertSentWait')}</p>
          <Link href="/" className="mt-4 inline-flex items-center justify-center px-10 py-4 rounded-full font-dm-sans text-[16px] text-white" style={{ background: '#b89148' }}>{t('backToHome')}</Link>
        </div>
      </div>
    </SiteLayout>
  )

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[90px] lg:pt-[150px] pb-20 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-[80px]" style={{ background: 'var(--background)' }}>
        <div className="max-w-xl mx-auto">

          {/* Emergency banner */}
          <div className="bg-red-600 rounded-[16px] p-6 mb-10 text-center">
            <p className="font-dm-sans text-white text-[14px] mb-1">{t('callImmediately')}</p>
            {emergencyPhone ? (
              <a href={`tel:${emergencyPhone.replace(/\s/g, '')}`} className="font-cormorant font-bold text-[32px] text-white">
                {emergencyPhone}
              </a>
            ) : (
              <div className="mx-auto h-[34px] w-[180px] rounded-[12px] bg-white/30 animate-pulse" aria-hidden="true" />
            )}
          </div>

          <Reveal className="text-center mb-10">
            <h1 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none mb-3">{t('heading')}</h1>
            <p className="font-dm-sans text-[16px] text-gold-800">{t('subtitle')}</p>
          </Reveal>

          <form onSubmit={submit} className="bg-white rounded-[24px] shadow-[0px_4px_32px_rgba(122,95,44,0.10)] p-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-dm-sans text-[14px] font-medium text-gold-900">{t('contactInfo')}</label>
              <input type="text" value={form.contact_info} onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))}
                placeholder={t('contactInfoPlaceholder')}
                className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-red-500 transition-colors"
                style={{ background: '#fdfaf5' }} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-dm-sans text-[14px] font-medium text-gold-900">{t('description')}</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder={t('descriptionPlaceholder')} rows={5}
                className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none resize-none focus:border-red-500 transition-colors"
                style={{ background: '#fdfaf5' }} />
            </div>
            {error && <p className="font-dm-sans text-[14px] text-red-600">{error}</p>}
            <button type="submit" disabled={status === 'loading'}
              className="w-full py-4 rounded-full font-dm-sans text-[18px] text-white bg-red-600 hover:opacity-90 transition-opacity disabled:opacity-60">
              {status === 'loading' ? t('sending') : t('sendAlert')}
            </button>
          </form>
        </div>
      </div>
    </SiteLayout>
  )
}
