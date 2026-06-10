'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const supabase = createClient()

type Mode = 'options' | 'email' | 'phone'

export default function RegisterPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const reset = () => { setMode('options'); setStep('phone'); setErrorMsg('') }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return }
    setLoading(true); setErrorMsg('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setErrorMsg(error.message)
    } else {
      router.push('/login?registered=1')
    }
    setLoading(false)
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setErrorMsg('')
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) { setErrorMsg(error.message) } else { setStep('otp') }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setErrorMsg('')
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    if (error) { setErrorMsg(error.message) } else { window.location.href = '/' }
    setLoading(false)
  }

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: { prompt: 'select_account' },
        }
      })
      if (error) alert(`Login failed: ${error.message}`)
    } catch (err: unknown) {
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Check console'}`)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-[12px] border border-gold-200 outline-none focus:border-gold-500 font-dm-sans bg-gold-50/30'
  const btnPrimary = 'w-full py-3 bg-[#6b5a45] hover:bg-[#5a4b39] transition-colors text-white rounded-[12px] font-bold font-dm-sans shadow-md mt-2 disabled:opacity-50'

  return (
    <div className="min-h-screen flex items-center justify-center px-5 pt-[100px] lg:pt-[212px] pb-20" style={{ background: '#fbf7ee' }}>
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <div className="relative w-[80px] h-[80px] mb-4">
              <Image src="/images/logo-emblem.png" alt="Orienda" fill className="object-cover rounded-full" sizes="80px" />
            </div>
          </Link>
          <h1 className="font-cormorant font-bold text-[40px] text-gold-900 leading-none">Create Account</h1>
          <p className="font-dm-sans text-[16px] text-gold-800 mt-2">Join Orienda International Hospital</p>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0px_4px_32px_rgba(122,95,44,0.10)] p-8 flex flex-col gap-5">

          {mode !== 'options' && (
            <button type="button" onClick={reset} className="self-start text-sm text-gold-600 font-medium hover:text-gold-800 transition-colors">
              ← Back to Options
            </button>
          )}

          {errorMsg && <div className="p-3 bg-red-50 border border-red-100 rounded-[8px] text-red-600 text-[13px] font-dm-sans">{errorMsg}</div>}

          {mode === 'options' && (
            <div className="flex flex-col gap-3">
              <button onClick={() => setMode('email')} type="button" className="w-full py-3 px-4 rounded-[12px] bg-gold-50 border border-gold-100 font-dm-sans text-[15px] font-bold text-gold-900 flex items-center justify-center gap-3 hover:bg-gold-100 transition-colors shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Sign up with Email
              </button>

              <button onClick={() => setMode('phone')} type="button" className="w-full py-3 px-4 rounded-[12px] bg-gold-50 border border-gold-100 font-dm-sans text-[15px] font-bold text-gold-900 flex items-center justify-center gap-3 hover:bg-gold-100 transition-colors shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Sign up with Phone
              </button>

              <div className="flex items-center gap-4 py-1 opacity-60">
                <div className="flex-1 h-px bg-gold-200"></div>
                <span className="text-[11px] text-gold-500 font-dm-sans font-bold uppercase tracking-widest">Or</span>
                <div className="flex-1 h-px bg-gold-200"></div>
              </div>

              <button onClick={handleGoogle} type="button" className="w-full py-3 px-4 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] font-medium text-gold-900 flex items-center justify-center gap-3 hover:bg-gold-50/50 transition-colors shadow-sm bg-white">
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign up with Google
              </button>
            </div>
          )}

          {mode === 'email' && (
            <form onSubmit={handleEmailRegister} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gold-900 font-dm-sans uppercase tracking-wide">Email</label>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gold-900 font-dm-sans uppercase tracking-wide">Password</label>
                <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gold-900 font-dm-sans uppercase tracking-wide">Confirm Password</label>
                <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputCls} />
              </div>
              <button disabled={loading} type="submit" className={btnPrimary}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {mode === 'phone' && (
            step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gold-900 font-dm-sans uppercase tracking-wide">Phone Number</label>
                  <input type="tel" placeholder="+855 12 345 678" value={phone} onChange={e => setPhone(e.target.value)} required className={inputCls} />
                </div>
                <button disabled={loading} type="submit" className={btnPrimary}>
                  {loading ? 'Sending...' : 'Send OTP Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gold-900 font-dm-sans uppercase tracking-wide">6-Digit OTP Code</label>
                  <input type="text" placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)} required className={`${inputCls} text-center tracking-[0.5em] text-lg font-bold`} />
                </div>
                <button disabled={loading} type="submit" className={btnPrimary}>
                  {loading ? 'Verifying...' : 'Verify & Register'}
                </button>
              </form>
            )
          )}
        </div>

        <p className="text-center font-dm-sans text-[14px] text-gold-800 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-gold-700 font-medium hover:text-gold-900">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
