'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Phone, MapPin } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import Reveal from '@/components/shared/Reveal'

interface Branch { id: string; name: string; address: string; phone: string; hours: string; image: string | null; mapUrl?: string }

export default function ContactPage() {
  const locale = useLocale()
  const t = useTranslations('Contact')
  const [branches, setBranches] = useState<Branch[]>([])
  const [sel, setSel] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/branches?locale=${locale}`)
      .then(r => r.json())
      .then(d => { if (d?.docs?.length) setBranches(d.docs) })
      .catch(() => {})
  }, [locale])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const branch = branches[sel]

  const mapEmbedUrl = (b?: Branch) => {
    if (!b?.address) return null
    const q = encodeURIComponent(b.address)
    return `https://maps.google.com/maps?q=${q}&output=embed&hl=en`
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) { setError(t('errorName')); return }
    if (!form.phone && !form.email) { setError(t('errorContact')); return }
    setStatus('loading'); setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:      form.name,
          email:     form.email || null,
          phone:     form.phone || null,
          message:   form.message,
          branch_id: branch?.id ?? null,
          locale,
        }),
      })
      if (!res.ok) throw new Error('Server error')
      setStatus('success')
    } catch {
      setStatus('error')
      setError(t('errorGeneric'))
    }
  }

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] min-h-screen">

        {/* ── Hero ── */}
        <div className="relative w-full h-[400px] lg:h-[693px] overflow-hidden">
          <Image
            src="/images/contact-hero.jpg"
            alt="Orienda Hospital"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.15)]" />

          {/* Headline */}
          <div className="absolute bottom-[100px] lg:bottom-auto lg:top-[228px] left-0 px-6 lg:px-[56px] max-w-[900px]">
            <h1 className="font-cormorant font-bold text-[32px] lg:text-[48px] text-[#fbf7ee] leading-[1.15] italic">
              {t('heroLine1')}<br />{t('heroLine2')}
            </h1>
          </div>

          {/* Contact info card — desktop only, shown once branches load */}
          {branches.length > 0 && (
            <div className="hidden md:flex absolute right-[56px] top-[289px] w-[372px] bg-[var(--background)] rounded-[16px] flex-col gap-[16px] justify-end p-[36px]">
              {branches.slice(0, 2).map(b => b.phone ? (
                <div key={b.id}>
                  <p className="font-cormorant font-bold text-[28px] text-[#3b2d17] leading-none mb-2">{b.name}</p>
                  <p className="font-dm-sans text-[16px] text-[#594522]">{b.phone}</p>
                </div>
              ) : null)}
            </div>
          )}
        </div>

        {/* ── Below hero ── */}
        <div className="content-shell flex flex-col items-center gap-[36px] py-[46px]">

          {/* Heading */}
          <Reveal className="text-center flex flex-col gap-[12px]">
            <h2 className="font-cormorant font-bold text-[32px] text-[#3b2d17] leading-none">{t('heading')}</h2>
            <p className="font-dm-sans text-[16px] text-[#594522]">
              {t('subtitle')}
            </p>
          </Reveal>

          {/* Branch switcher */}
          {branches.length >= 2 && (
            <div className="bg-white flex items-center p-[10px] rounded-full shadow-sm">
              {branches.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setSel(i)}
                  className={`px-[25px] py-[10px] rounded-full font-dm-sans font-medium text-[16px] lg:text-[20px] transition-colors ${
                    sel === i ? 'bg-[#b89148] text-white' : 'text-[#bfbfbf]'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}

          {/* Two columns */}
          <div className="flex flex-col md:flex-row gap-[24px] w-full">

            {/* Form */}
            <div className="flex-1 min-w-0">
              {status === 'success' ? (
                <div className="bg-white rounded-[16px] shadow-[0px_4px_8px_rgba(122,95,44,0.12)] p-[40px] flex flex-col items-center gap-6 text-center h-full justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#b89148] flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-cormorant font-bold text-[28px] text-[#3b2d17] leading-none">{t('messageSent')}</h3>
                  <p className="font-dm-sans text-[16px] text-[#594522]">{t('messageSentDesc')}</p>
                  <button
                    onClick={() => { setStatus('idle'); setForm({ name: '', email: '', phone: '', message: '' }) }}
                    className="px-8 py-3 bg-[#b89148] text-white rounded-[12px] font-dm-sans text-[16px] hover:opacity-90 transition-opacity"
                  >
                    {t('sendAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="bg-white rounded-[16px] shadow-[0px_4px_8px_rgba(122,95,44,0.12)] p-[40px] flex flex-col gap-[32px] h-full">
                  <div className="flex flex-col gap-[12px] items-center text-center">
                    <h3 className="font-cormorant font-bold text-[28px] text-[#3b2d17] leading-none">{t('sendMessage')}</h3>
                    <p className="font-dm-sans text-[16px] text-[#594522]">
                      {t('sendMessageSub')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-[24px]">
                    <ContactField label={t('nameLabel')} value={form.name} onChange={v => set('name', v)} placeholder={t('namePlaceholder')} />
                    <ContactField label={t('emailLabel')} type="email" value={form.email} onChange={v => set('email', v)} placeholder={t('emailPlaceholder')} />
                    <ContactField label={t('phoneLabel')} type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder={t('phonePlaceholder')} />
                    <div className="flex flex-col gap-[8px]">
                      <label className="font-dm-sans font-medium text-[16px] text-[#131927]">{t('messageLabel')}</label>
                      <textarea
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                        placeholder={t('messagePlaceholder')}
                        rows={6}
                        className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#dcbd72] font-dm-sans text-[16px] text-[#3b2d17] outline-none resize-none focus:border-[#b89148] transition-colors bg-white placeholder:text-[rgba(59,45,23,0.3)]"
                      />
                    </div>
                  </div>

                  {error && <p className="font-dm-sans text-[14px] text-red-600">{error}</p>}

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="px-[24px] py-[16px] bg-[#b89148] text-[#fbf7ee] rounded-[12px] font-dm-sans font-semibold text-[20px] w-[232px] hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {status === 'loading' ? t('submitting') : t('submit')}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Map & info */}
            <div className="flex flex-col gap-[24px] w-full lg:w-[572px] shrink-0">
              <div className="flex flex-col gap-[20px] py-[32px]">
                <a
                  href={branch?.phone ? `tel:${branch.phone.replace(/\s/g, '')}` : undefined}
                  className="flex items-center gap-[12px] group"
                >
                  <Phone size={24} className="text-[#3b2d17] shrink-0" />
                  <span className="font-dm-sans text-[18px] lg:text-[20px] text-[#3b2d17] group-hover:underline">
                    {branch?.phone}
                  </span>
                </a>
                <div className="flex items-start gap-[12px]">
                  <MapPin size={24} className="text-[#3b2d17] shrink-0 mt-0.5" />
                  <span className="font-dm-sans text-[18px] lg:text-[20px] text-[#2a2620]">
                    {branch?.address}
                  </span>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-[16px] overflow-hidden shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] h-[400px] lg:h-[514px]">
                {mapEmbedUrl(branch) ? (
                  <iframe
                    key={sel}
                    src={mapEmbedUrl(branch)!}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map - ${branch?.name}`}
                  />
                ) : (
                  <div className="size-full bg-[#f5ecd4] flex items-center justify-center">
                    <p className="font-dm-sans text-[16px] text-[#594522]">Map loading…</p>
                  </div>
                )}
              </div>

              {branch?.mapUrl && (
                <a
                  href={branch.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-center px-[32px] py-[12px] bg-[#b89148] text-white font-dm-sans font-medium text-[16px] rounded-[24px] hover:opacity-90 transition-opacity"
                >
                  {t('viewOnGoogleMaps')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}

function ContactField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <label className="font-dm-sans font-medium text-[16px] text-[#131927]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#dcbd72] font-dm-sans text-[16px] text-[#3b2d17] outline-none focus:border-[#b89148] transition-colors bg-white placeholder:text-[rgba(59,45,23,0.3)]"
      />
    </div>
  )
}
