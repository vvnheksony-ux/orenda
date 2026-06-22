'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export default function ForgotPasswordPage() {
  const locale = useLocale()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setErrorMsg('')

    // Keep the reset link in the user's language (next-intl always prefixes the locale).
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 pt-[100px] lg:pt-[212px] pb-20" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <Link href="/"><div className="relative w-[80px] h-[80px] mb-4"><Image src="/images/logo-emblem.png" alt="Orienda" fill className="object-cover rounded-full" sizes="80px" /></div></Link>
          <h1 className="font-cormorant font-bold text-[40px] text-gold-900 leading-none">Reset Password</h1>
          <p className="font-dm-sans text-[16px] text-gold-800 mt-2">We&apos;ll send you a reset link</p>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0px_4px_32px_rgba(122,95,44,0.10)] p-8 flex flex-col gap-5">

          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="text-[48px]">📧</div>
              <h2 className="font-cormorant font-bold text-[24px] text-gold-900">Check your email</h2>
              <p className="font-dm-sans text-[15px] text-gold-800 leading-[1.6]">
                We sent a reset link to <strong>{email}</strong>.<br />
                Click it to set a new password.
              </p>
              <Link href="/login" className="w-full py-3 bg-[#b89148] hover:bg-[#a07d3a] transition-colors text-white rounded-[12px] font-bold font-dm-sans text-center mt-2">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errorMsg && <div className="p-3 bg-red-50 border border-red-100 rounded-[8px] text-red-600 text-[13px] font-dm-sans">⚠️ {errorMsg}</div>}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gold-900 font-dm-sans uppercase tracking-wide">Email Address</label>
                <input
                  type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-[12px] border border-gold-200 outline-none focus:border-[#b89148] font-dm-sans text-[15px] bg-gold-50/30"
                />
              </div>
              <button disabled={loading} type="submit" className="w-full py-3 bg-[#b89148] hover:bg-[#a07d3a] transition-colors text-white rounded-[12px] font-bold font-dm-sans disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center font-dm-sans text-[14px] text-gold-800 mt-6">
          Remember it?{' '}<Link href="/login" className="text-gold-700 font-medium hover:text-gold-900">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
