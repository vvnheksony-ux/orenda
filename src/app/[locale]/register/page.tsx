'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export default function RegisterPage() {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email')
  const [otpSent, setOtpSent] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', phone: '', otp: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` }
    })
  }

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password) { setError('All fields required.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setStatus('loading'); setError('')
    const { error: err } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name } },
    })
    if (err) { setStatus('error'); setError(err.message); return }
    router.push('/login?registered=1')
  }

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.phone) { setError('Full name and phone number required.'); return }
    setStatus('loading'); setError('')
    const { error: err } = await supabase.auth.signInWithOtp({ 
      phone: form.phone,
      options: { data: { full_name: form.full_name } }
    })
    if (err) { setStatus('error'); setError(err.message); return }
    setStatus('idle'); setOtpSent(true); setError('')
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.otp) { setError('OTP code required.'); return }
    setStatus('loading'); setError('')
    const { error: err } = await supabase.auth.verifyOtp({ phone: form.phone, token: form.otp, type: 'sms' })
    if (err) { setStatus('error'); setError(err.message); return }
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 pt-[100px] pb-20" style={{ background: '#fbf7ee' }}>
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
          
          {authMode === 'email' && (
            <form onSubmit={submitEmail} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans text-[14px] font-medium text-gold-900">Full Name</label>
                <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors" style={{ background: '#fdfaf5' }} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans text-[14px] font-medium text-gold-900">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors" style={{ background: '#fdfaf5' }} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans text-[14px] font-medium text-gold-900">Password</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors" style={{ background: '#fdfaf5' }} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans text-[14px] font-medium text-gold-900">Confirm Password</label>
                <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors" style={{ background: '#fdfaf5' }} />
              </div>
              {error && <p className="font-dm-sans text-[13px] text-red-600">{error}</p>}
              <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-full font-dm-sans text-[17px] text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-1" style={{ background: '#b89148' }}>
                {status === 'loading' ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {authMode === 'phone' && !otpSent && (
            <form onSubmit={sendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans text-[14px] font-medium text-gold-900">Full Name</label>
                <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors" style={{ background: '#fdfaf5' }} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans text-[14px] font-medium text-gold-900">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+855 ..."
                  className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors" style={{ background: '#fdfaf5' }} />
              </div>
              {error && <p className="font-dm-sans text-[13px] text-red-600">{error}</p>}
              <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-full font-dm-sans text-[17px] text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-1" style={{ background: '#b89148' }}>
                {status === 'loading' ? 'Sending Code...' : 'Send Signup Code'}
              </button>
            </form>
          )}

          {authMode === 'phone' && otpSent && (
            <form onSubmit={verifyOtp} className="flex flex-col gap-4">
              <p className="font-dm-sans text-[14px] text-gold-800 text-center">We sent a 6-digit code to {form.phone}</p>
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans text-[14px] font-medium text-gold-900">Confirmation Code</label>
                <input type="text" value={form.otp} onChange={e => set('otp', e.target.value)} placeholder="000000"
                  className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors text-center tracking-[0.5em]" style={{ background: '#fdfaf5' }} />
              </div>
              {error && <p className="font-dm-sans text-[13px] text-red-600">{error}</p>}
              <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-full font-dm-sans text-[17px] text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-1" style={{ background: '#b89148' }}>
                {status === 'loading' ? 'Verifying...' : 'Verify Code & Create Account'}
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-gold-100"></div>
            <span className="font-dm-sans text-[12px] text-gold-400 uppercase tracking-wider">OR</span>
            <div className="flex-1 h-px bg-gold-100"></div>
          </div>

          {/* Social Auth Buttons */}
          <div className="flex flex-col gap-3">
            <button onClick={handleGoogle} type="button" className="w-full py-3 px-4 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] font-medium text-gold-900 flex items-center justify-center gap-3 hover:bg-gold-50/50 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign up with Google
            </button>
            <button onClick={() => { setAuthMode('phone'); setOtpSent(false); setError('') }} type="button" className="w-full py-3 px-4 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] font-medium text-gold-900 flex items-center justify-center gap-3 hover:bg-gold-50/50 transition-colors" style={{ display: authMode === 'phone' ? 'none' : 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Sign up with Phone
            </button>
            <button onClick={() => { setAuthMode('email'); setError('') }} type="button" className="w-full py-3 px-4 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] font-medium text-gold-900 flex items-center justify-center gap-3 hover:bg-gold-50/50 transition-colors" style={{ display: authMode === 'email' ? 'none' : 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Sign up with Email
            </button>
          </div>

        </div>

        <p className="text-center font-dm-sans text-[14px] text-gold-800 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-gold-700 font-medium hover:text-gold-900">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
