'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import SiteLayout from '@/components/layout/SiteLayout'
import { ChevronLeft } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useAuth } from '@/lib/auth-context'
import LoginModal from '@/components/shared/LoginModal'
import { useBranch } from '@/lib/branch-context'

interface Promo {
  id: string
  title: string
  slug: string
  image: string | null
  validFrom: string | null
  validTo: string | null
}

export default function PurchasePage({ params }: { params: Promise<{ promoId: string }> }) {
  const { promoId } = use(params)
  const locale = useLocale()

  const { user, loading: authLoading } = useAuth()
  const { selectedBranch } = useBranch()
  const [promo, setPromo]   = useState<Promo | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm]     = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError]   = useState('')

  // Pre-fill form from user profile
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        email: user.email || '',
        name:  user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone     || '',
      }))
    }
  }, [user])

  // Fetch promotion from Payload by slug or id
  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const isNumeric = /^\d+$/.test(promoId)
        const param = isNumeric ? `id=${promoId}` : `slug=${promoId}`
        const res = await fetch(`/api/promotions?locale=${locale}&${param}`)
        if (res.ok) {
          const data = await res.json()
          if (data) setPromo(data)
        }
      } catch {}
      setLoading(false)
    }
    fetchPromo()
  }, [promoId, locale])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) { setError('Patient name is required.'); return }
    if (!form.phone && !form.email) { setError('Please provide a phone or email.'); return }
    setStatus('loading'); setError('')

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          patient_name:         form.name,
          patient_phone:        form.phone || null,
          patient_email:        form.email || null,
          // promotion_id is UUID for mobile app — leave null on web
          // promotion_payload_id is the Payload integer ID for web
          promotion_payload_id: promo?.id ? parseInt(promo.id) : null,
          promotion_title:      promo?.title || promoId,
          branch_payload_id:    selectedBranch?.id ? parseInt(selectedBranch.id) : null,
          message:              form.message || null,
          language:             locale,
        }),
      })

      clearTimeout(timeout)

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || `Error ${res.status}`)
      }

      setStatus('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setStatus('error')
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    }
  }

  const title = promo?.title || promoId

  // Login modal — not a redirect
  if (!authLoading && !user) return (
    <SiteLayout>
      <div className="min-h-screen" style={{ background: '#fbf7ee' }} />
      <LoginModal
        open={true}
        onClose={() => window.history.back()}
        onSuccess={() => { /* user state updates via AuthProvider — page re-renders */ }}
        redirectTo={`/promotions/${promoId}/purchase`}
        message="Sign in to purchase this promotion at Orienda International Hospital."
      />
    </SiteLayout>
  )

  if (status === 'success') return (
    <SiteLayout>
      <div className="min-h-screen flex items-center justify-center pt-[160px] pb-20" style={{ background: '#fbf7ee' }}>
        <div className="text-center flex flex-col items-center gap-6 px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#b89148' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-cormorant font-bold text-[48px] text-gold-900 leading-none">Purchase Submitted</h1>
          <p className="font-dm-sans text-[18px] text-gold-800 max-w-md">
            Thank you! We&apos;ve received your request for <strong>{title}</strong>. Our team will contact you shortly.
          </p>
          <Link href="/promotions" className="mt-4 inline-flex items-center justify-center px-10 py-4 rounded-full font-dm-sans text-[16px] text-white" style={{ background: '#b89148' }}>
            Back to Promotions
          </Link>
        </div>
      </div>
    </SiteLayout>
  )

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: '#fbf7ee' }}>
        <div className="max-w-[1352px] mx-auto px-5 xl:px-0 flex flex-col gap-10">

          {/* Back */}
          <Link href={`/promotions/${promoId}` as any} className="inline-flex items-center gap-1 font-dm-sans text-[14px] text-gold-700 hover:text-gold-900 transition-colors">
            <ChevronLeft size={16} /> Back to {title}
          </Link>

          {/* Hero image */}
          <div className="relative w-full h-[240px] md:h-[380px] xl:h-[500px] rounded-[16px] overflow-hidden bg-white/80">
            <Image
              src={promo?.image ?? '/images/purchase-hero.jpg'}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1400px) 100vw, 1352px"
              priority
              unoptimized={!!promo?.image?.startsWith('/payload')}
            />
          </div>

          {/* Promo title */}
          {!loading && promo && (
            <div className="flex flex-col gap-2">
              <h1 className="font-cormorant font-bold text-[40px] text-gold-900 leading-none">{promo.title}</h1>
              {(promo.validFrom || promo.validTo) && (
                <p className="font-dm-sans text-[14px] text-gold-700">
                  Valid: {promo.validFrom ? new Date(promo.validFrom).toLocaleDateString() : ''}
                  {promo.validTo ? ` – ${new Date(promo.validTo).toLocaleDateString()}` : ''}
                </p>
              )}
            </div>
          )}

          {/* Purchase form */}
          <form onSubmit={submit} className="flex flex-col gap-6 pb-10">
            <div className="flex flex-col gap-2">
              <label className="font-dm-sans font-medium text-[16px]" style={{ color: '#7a5f2c' }}>Patient&apos;s Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Travis Scott" className="w-full px-3 py-3 rounded-[12px] font-dm-sans text-[16px] text-gold-900 outline-none bg-white" style={{ border: '1px solid #7a5f2c' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans font-medium text-[16px]" style={{ color: '#7a5f2c' }}>Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="098 000 999" className="w-full px-3 py-3 rounded-[12px] font-dm-sans text-[16px] text-gold-900 outline-none bg-white" style={{ border: '1px solid #7a5f2c' }} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans font-medium text-[16px]" style={{ color: '#7a5f2c' }}>Email <span className="text-[#9a7838] font-normal">(Optional)</span></label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className="w-full px-3 py-3 rounded-[12px] font-dm-sans text-[16px] text-gold-900 outline-none bg-white" style={{ border: '1px solid #7a5f2c' }} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-dm-sans font-medium text-[16px]" style={{ color: '#7a5f2c' }}>Personal Request</label>
              <textarea value={form.message} onChange={e => set('message', e.target.value)} placeholder="Enter your message here" rows={6} className="w-full px-3 py-3 rounded-[12px] font-dm-sans text-[16px] text-gold-900 outline-none resize-none bg-white" style={{ border: '1px solid #7a5f2c' }} />
            </div>

            {error && <p className="font-dm-sans text-[14px] text-red-600">⚠️ {error}</p>}

            <div className="flex justify-center mt-4">
              <button type="submit" disabled={status === 'loading'} className="flex items-center justify-center h-[64px] px-10 rounded-[12px] font-dm-sans text-[20px] text-[#f9f9f9] hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: '#b89148', boxShadow: '0px 0px 12px 4px rgba(184,145,72,0.15)' }}>
                {status === 'loading' ? 'Submitting...' : 'Make Purchase'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SiteLayout>
  )
}
