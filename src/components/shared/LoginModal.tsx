'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, X } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { createClient } from '@/utils/supabase/client'
import { useScrollLock } from '@/lib/useScrollLock'

const supabase = createClient()

type View = 'login' | 'register'
type Mode = 'options' | 'email' | 'phone'
type PhoneStep = 'phone' | 'otp'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  redirectTo?: string
  message?: string
  initialView?: View
  registered?: boolean
}

const inputCls = 'w-full px-4 py-3 rounded-[12px] border border-gold-200 outline-none focus:border-[#b89148] font-dm-sans text-[15px] bg-white transition-colors'
const primaryBtnCls = 'w-full py-3 rounded-[12px] font-dm-sans font-bold text-[16px] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
const optionBtnCls = 'w-full py-3 px-4 rounded-[12px] bg-gold-50 border border-gold-100 font-dm-sans text-[15px] font-bold text-gold-900 flex items-center justify-center gap-3 hover:bg-gold-100 transition-colors shadow-sm'

function friendlyError(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login') || normalized.includes('invalid credentials')) return 'Incorrect email or password.'
  if (normalized.includes('email not confirmed')) return 'Please confirm your email before signing in.'
  if (normalized.includes('rate limit') || normalized.includes('too many')) return 'Too many attempts. Please wait a few minutes.'
  if (normalized.includes('user already registered')) return 'This account already exists. Please sign in instead.'
  if (normalized.includes('password should be at least')) return 'Password must be at least 6 characters.'
  if (normalized.includes('token has expired') || normalized.includes('expired') || normalized.includes('invalid otp') || (normalized.includes('token') && normalized.includes('invalid'))) return 'That code is invalid or has expired. Please request a new one.'
  if (normalized.includes('failed to fetch') || normalized.includes('network')) return 'Network error. Please check your connection and try again.'
  return message
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function normalizeCambodiaPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  const normalized = (() => {
    if (digits.startsWith('00855')) return `+${digits.slice(2)}`
    if (digits.startsWith('855')) return `+${digits}`
    if (digits.startsWith('0')) return `+855${digits.slice(1)}`
    if (digits.length >= 8 && digits.length <= 9) return `+855${digits}`
    return ''
  })()

  return /^\+855\d{8,9}$/.test(normalized) ? normalized : null
}

function LoginModalContent({
  onClose,
  onSuccess,
  redirectTo = '/',
  message,
  initialView = 'login',
  registered = false,
}: Omit<Props, 'open'>) {
  const [view, setView] = useState<View>(initialView)
  const [mode, setMode] = useState<Mode>('options')
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('phone')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneSignup, setPhoneSignup] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const otp = otpDigits.join('')
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])
  const methodTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [resendIn, setResendIn] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [noticeMsg, setNoticeMsg] = useState(registered ? 'Account created! Check your email to confirm, then sign in.' : '')
  const [showResend, setShowResend] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // Which auth method is being opened, so its button can show a spinner.
  const [pendingMethod, setPendingMethod] = useState<'email' | 'phone' | 'google' | null>(null)

  // Lock background scroll while the modal is mounted (shared, ref-counted).
  useScrollLock(true)

  // Survive a page refresh during phone sign-up: if a code was just sent,
  // restore the OTP entry screen (consumed once so it doesn't linger).
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('pendingPhoneOtp')
      sessionStorage.removeItem('pendingPhoneOtp')
      if (saved) {
        const { phone: p, ts } = JSON.parse(saved)
        if (p && Date.now() - ts < 10 * 60 * 1000) {
          setPhone(p)
          setMode('phone')
          setPhoneStep('otp')
          setResendIn(Math.max(0, 60 - Math.floor((Date.now() - ts) / 1000)))
        }
      }
    } catch {}
  }, [])

  const resetFlow = () => {
    setMode('options')
    setPhoneStep('phone')
    setOtpDigits(['', '', '', '', '', ''])
    setResendIn(0)
    setErrorMsg('')
    setShowResend(false)
    setPendingMethod(null)
    try { sessionStorage.removeItem('pendingPhoneOtp') } catch {}
  }

  const switchView = (nextView: View) => {
    setView(nextView)
    resetFlow()
    if (nextView === 'register') setNoticeMsg('')
  }

  const syncProfile = async (userId: string, values: { email?: string | null; phone?: string | null }) => {
    // Only write fields that actually have a value — never overwrite an existing
    // profile's phone/email with null (that would wipe data set in complete-profile).
    const patch: Record<string, string> & { id: string } = { id: userId }
    if (values.email) patch.email_user = values.email
    if (values.phone) patch.phone = values.phone
    if (Object.keys(patch).length === 1) return // nothing but id → skip (row already exists via trigger)
    const { error } = await supabase.from('profiles').upsert(patch, { onConflict: 'id' })
    if (error) console.error('syncProfile upsert failed:', error.message)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) { setErrorMsg('Please enter a valid email address.'); return }
    if (!password) { setErrorMsg('Please enter your password.'); return }
    setLoading(true)
    setErrorMsg('')
    setShowResend(false)

    const { error, data } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const friendly = friendlyError(error.message)
      setErrorMsg(friendly)
      if (friendly.includes('confirm your email')) setShowResend(true)
    } else if (data.user) {
      await syncProfile(data.user.id, { email: data.user.email, phone: data.user.phone })
      onSuccess?.()
      onClose()
    }

    setLoading(false)
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) { setErrorMsg('Please enter a valid email address.'); return }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setNoticeMsg('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { phone: phoneSignup || undefined },
      },
    })

    if (error) {
      setErrorMsg(friendlyError(error.message))
      // Account exists → send them to the Login tab (email kept) to sign in.
      if (error.message.toLowerCase().includes('already registered')) {
        setPassword('')
        setConfirmPassword('')
        setView('login')
        setMode('email')
      }
    } else if (data.user && (data.user.identities?.length ?? 0) === 0) {
      // Supabase returns a user with NO identities when the email is already
      // registered (it obfuscates to avoid leaking which emails exist).
      setPassword('')
      setConfirmPassword('')
      setView('login')
      setMode('email')
      setErrorMsg('This account already exists. Please sign in instead.')
    } else if (data.session) {
      // Email confirmation is disabled → the user is already signed in. Skip the
      // separate sign-in step and continue straight through onSuccess (onboarding).
      if (data.user) await syncProfile(data.user.id, { email, phone: phoneSignup || null })
      onSuccess?.()
      onClose()
    } else {
      if (data.user) await syncProfile(data.user.id, { email, phone: phoneSignup || null })
      setPassword('')
      setConfirmPassword('')
      setView('login')
      setMode('email')
      setNoticeMsg('Account created! Check your email to confirm, then sign in.')
    }

    setLoading(false)
  }

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedPhone = normalizeCambodiaPhone(phone)
    if (!normalizedPhone) {
      setErrorMsg('Please enter a valid Cambodian phone number.')
      return
    }

    setPhone(normalizedPhone)
    setLoading(true)
    setErrorMsg('')
    setNoticeMsg('')

    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        shouldCreateUser: true,
      },
    })

    if (error) {
      setErrorMsg(friendlyError(error.message))
    } else {
      setPhoneStep('otp')
      setOtpDigits(['', '', '', '', '', ''])
      setResendIn(60)
      setNoticeMsg('')
      try { sessionStorage.setItem('pendingPhoneOtp', JSON.stringify({ phone: normalizedPhone, ts: Date.now() })) } catch {}
    }

    setLoading(false)
  }

  const submitOtp = async (code: string) => {
    const token = code.replace(/\D/g, '')
    if (token.length < 6 || loading) return
    const normalizedPhone = normalizeCambodiaPhone(phone)
    if (!normalizedPhone) {
      setErrorMsg('Please enter a valid Cambodian phone number.')
      return
    }

    setPhone(normalizedPhone)
    setLoading(true)
    setErrorMsg('')
    setNoticeMsg('')

    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token,
      type: 'sms',
    })

    if (error) {
      setErrorMsg(friendlyError(error.message))
      setLoading(false)
      return
    }

    if (data.user) {
      try { sessionStorage.removeItem('pendingPhoneOtp') } catch {}
      await syncProfile(data.user.id, { email: data.user.email, phone: normalizedPhone })
      onSuccess?.()
      onClose()
    }

    setLoading(false)
  }

  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault()
    submitOtp(otp)
  }

  const handleOtpChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) {
      setOtpDigits(prev => { const next = [...prev]; next[index] = ''; return next })
      return
    }
    setOtpDigits(prev => {
      const next = [...prev]
      let i = index
      for (const ch of digits) { if (i > 5) break; next[i] = ch; i++ }
      requestAnimationFrame(() => otpRefs.current[Math.min(i, 5)]?.focus())
      return next
    })
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    e.preventDefault()
    const next = ['', '', '', '', '', '']
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setOtpDigits(next)
    requestAnimationFrame(() => otpRefs.current[Math.min(text.length, 5)]?.focus())
  }

  const handleResendPhone = async () => {
    if (resendIn > 0 || loading) return
    const normalizedPhone = normalizeCambodiaPhone(phone)
    if (!normalizedPhone) return
    setLoading(true)
    setErrorMsg('')
    const { error } = await supabase.auth.signInWithOtp({ phone: normalizedPhone, options: { shouldCreateUser: true } })
    if (error) setErrorMsg(friendlyError(error.message))
    else {
      setNoticeMsg('')
      setResendIn(60)
      setOtpDigits(['', '', '', '', '', ''])
      requestAnimationFrame(() => otpRefs.current[0]?.focus())
    }
    setLoading(false)
  }

  // Resend countdown while on the OTP step.
  useEffect(() => {
    if (mode !== 'phone' || phoneStep !== 'otp' || resendIn <= 0) return
    const t = setTimeout(() => setResendIn(s => Math.max(0, s - 1)), 1000)
    return () => clearTimeout(t)
  }, [mode, phoneStep, resendIn])

  // Auto-detect the SMS code via the WebOTP API where supported (mobile Chrome).
  useEffect(() => {
    if (mode !== 'phone' || phoneStep !== 'otp') return
    if (typeof window === 'undefined' || !('OTPCredential' in window)) return
    const ac = new AbortController()
    navigator.credentials
      // @ts-expect-error - OTP transport is not yet in the TS lib types
      .get({ otp: { transport: ['sms'] }, signal: ac.signal })
      .then((cred: any) => {
        const code = String(cred?.code ?? '').replace(/\D/g, '').slice(0, 6)
        // Auto-fill the boxes from the SMS, but let the user press Verify.
        if (code.length === 6) setOtpDigits(code.split(''))
      })
      .catch(() => {})
    return () => ac.abort()
  }, [mode, phoneStep])

  const handleResend = async () => {
    setLoading(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) setErrorMsg(friendlyError(error.message))
    else setNoticeMsg(`Confirmation email sent to ${email}.`)
    setLoading(false)
  }

  // Show a brief spinner on the chosen method button before revealing its form,
  // so every option gives immediate, professional feedback on click.
  const chooseMethod = (next: 'email' | 'phone') => {
    if (pendingMethod) return
    setErrorMsg('')
    setPendingMethod(next)
    if (methodTimer.current) clearTimeout(methodTimer.current)
    methodTimer.current = setTimeout(() => {
      setMode(next)
      setPendingMethod(null)
    }, 300)
  }

  // Clear the pending-method timer if the modal unmounts mid-transition.
  useEffect(() => () => { if (methodTimer.current) clearTimeout(methodTimer.current) }, [])

  const handleGoogle = async () => {
    if (pendingMethod) return
    setErrorMsg('')
    setPendingMethod('google')
    const callbackUrl = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: { prompt: 'select_account' },
      },
    })
    // On success the browser redirects to Google, so the spinner stays visible.
    if (error) {
      setErrorMsg(friendlyError(error.message))
      setPendingMethod(null)
    }
  }

  const title = view === 'login' ? 'Sign In' : 'Create Account'
  const subtitle = view === 'login' ? 'Access your Orienda account with email, Google, or phone.' : 'Create your Orienda account with email, Google, or phone.'
  const passwordInputCls = `${inputCls} pr-12`

  return (
    <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative bg-[#fbf7ee] rounded-[24px] shadow-[0px_8px_40px_rgba(89,69,34,0.2)] p-8 w-full max-w-md flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-5 right-5 text-gold-500 hover:text-gold-900 transition-colors">
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative w-[56px] h-[56px]">
                <Image src="/images/logo-emblem.png" alt="Orienda" fill className="object-cover rounded-full" sizes="56px" />
              </div>
              <div className="inline-flex bg-white rounded-full p-1 border border-gold-200">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className={`px-4 py-2 rounded-full font-dm-sans text-[13px] transition-colors ${view === 'login' ? 'bg-[#b89148] text-white' : 'text-gold-800 hover:bg-gold-50'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className={`px-4 py-2 rounded-full font-dm-sans text-[13px] transition-colors ${view === 'register' ? 'bg-[#b89148] text-white' : 'text-gold-800 hover:bg-gold-50'}`}
                >
                  Register
                </button>
              </div>
              <h2 className="font-cormorant font-bold text-[32px] text-gold-900 leading-none">{title}</h2>
              <p className="font-dm-sans text-[14px] text-gold-700 leading-[1.5]">{message ?? subtitle}</p>
            </div>

            {(errorMsg || noticeMsg) && (
              <div className={`p-3 rounded-[10px] text-[13px] font-dm-sans flex flex-col gap-1 ${errorMsg ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                <span>{errorMsg ? `Warning: ${errorMsg}` : noticeMsg}</span>
                {showResend && !errorMsg.includes('sent') && (
                  <button onClick={handleResend} disabled={loading} className="text-[#b89148] font-medium hover:underline text-left disabled:opacity-50 text-[12px]">
                    Resend confirmation email
                  </button>
                )}
              </div>
            )}

            {mode !== 'options' && (
              <button type="button" onClick={resetFlow} className="self-start text-sm text-gold-600 font-medium hover:text-gold-800 transition-colors">
                Back to options
              </button>
            )}

            {mode === 'options' && (
              <div className="flex flex-col gap-3">
                <button onClick={() => chooseMethod('email')} disabled={!!pendingMethod} type="button" className={`${optionBtnCls} disabled:opacity-60`}>
                  {pendingMethod === 'email'
                    ? <span className="inline-block w-[18px] h-[18px] border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>}
                  {pendingMethod === 'email' ? 'Loading...' : view === 'login' ? 'Continue with Email' : 'Sign up with Email'}
                </button>

                <button onClick={() => chooseMethod('phone')} disabled={!!pendingMethod} type="button" className={`${optionBtnCls} disabled:opacity-60`}>
                  {pendingMethod === 'phone'
                    ? <span className="inline-block w-[18px] h-[18px] border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>}
                  {pendingMethod === 'phone' ? 'Loading...' : view === 'login' ? 'Continue with Phone' : 'Sign up with Phone'}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gold-200" />
                  <span className="text-[11px] font-dm-sans font-bold text-gold-400 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-gold-200" />
                </div>

                <button onClick={handleGoogle} disabled={!!pendingMethod} type="button" className="w-full py-3 px-4 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] font-medium text-gold-900 flex items-center justify-center gap-3 hover:bg-white transition-colors bg-white disabled:opacity-60">
                  {pendingMethod === 'google'
                    ? <span className="inline-block w-[18px] h-[18px] border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    : <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>}
                  {pendingMethod === 'google' ? 'Connecting...' : view === 'login' ? 'Continue with Google' : 'Sign up with Google'}
                </button>

                {view === 'login' && (
                  <div className="text-center">
                    <Link href="/forgot-password" className="font-dm-sans text-[13px] text-gold-600 hover:text-gold-800 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>
            )}

            {mode === 'email' && view === 'login' && (
              <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">Password</label>
                  <div className="relative">
                    <input type={showLoginPassword ? 'text' : 'password'} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required className={passwordInputCls} />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-500 hover:text-gold-800 transition-colors"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Link href="/forgot-password" className="text-right font-dm-sans text-[12px] text-gold-600 hover:text-gold-800 transition-colors">
                  Forgot password?
                </Link>
                <button disabled={loading} type="submit" className={primaryBtnCls} style={{ background: '#b89148' }}>
                  {loading && <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin mr-2 align-[-2px]" />}
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {mode === 'email' && view === 'register' && (
              <form onSubmit={handleEmailRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">Password</label>
                  <div className="relative">
                    <input type={showRegisterPassword ? 'text' : 'password'} placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} required className={passwordInputCls} />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-500 hover:text-gold-800 transition-colors"
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={passwordInputCls} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-500 hover:text-gold-800 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">Phone Number <span className="font-normal text-gold-500">(optional)</span></label>
                  <input type="tel" placeholder="+855 12 345 678" value={phoneSignup} onChange={e => setPhoneSignup(e.target.value)} className={inputCls} />
                </div>
                <button disabled={loading} type="submit" className={primaryBtnCls} style={{ background: '#b89148' }}>
                  {loading && <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin mr-2 align-[-2px]" />}
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}

            {mode === 'phone' && phoneStep === 'phone' && (
              <form onSubmit={handleSendPhoneOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">Phone Number</label>
                  <input type="tel" placeholder="+855 12 345 678" value={phone} onChange={e => setPhone(e.target.value)} required className={inputCls} />
                </div>
                <button disabled={loading} type="submit" className={primaryBtnCls} style={{ background: '#b89148' }}>
                  {loading ? 'Sending code...' : view === 'login' ? 'Send OTP Code' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {mode === 'phone' && phoneStep === 'otp' && (
              <form onSubmit={handleVerifyPhoneOtp} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1 text-center">
                  <p className="font-dm-sans text-[14px] text-gold-700">Sent to {phone}</p>
                  <p className="font-dm-sans text-[13px] text-emerald-600">Auto-detecting from SMS…</p>
                </div>

                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      inputMode="numeric"
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                      maxLength={1}
                      autoFocus={i === 0}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 sm:w-[52px] sm:h-[60px] rounded-[14px] border-2 border-gold-300 bg-[#f5ecd4]/40 text-center font-dm-sans font-bold text-[24px] text-[#b89148] outline-none focus:border-[#b89148] focus:bg-white transition-colors"
                    />
                  ))}
                </div>

                <button disabled={loading || otp.replace(/\D/g, '').length < 6} type="submit" className={primaryBtnCls} style={{ background: '#b89148' }}>
                  {loading && <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin mr-2 align-[-2px]" />}
                  {loading ? 'Verifying...' : view === 'login' ? 'Verify & Sign In' : 'Verify & Create Account'}
                </button>

                <p className="text-center font-dm-sans text-[13px] text-gold-600">
                  {resendIn > 0 ? (
                    <>Resend code in {Math.floor(resendIn / 60)}:{String(resendIn % 60).padStart(2, '0')}</>
                  ) : (
                    <button type="button" onClick={handleResendPhone} disabled={loading} className="font-medium text-[#b89148] hover:underline disabled:opacity-50">
                      Resend code
                    </button>
                  )}
                </p>
              </form>
            )}

            <p className="text-center font-dm-sans text-[13px] text-gold-700">
              {view === 'login' ? 'No account?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => switchView(view === 'login' ? 'register' : 'login')} className="font-medium text-[#b89148] hover:underline">
                {view === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </motion.div>
    </motion.div>
  )
}

export default function LoginModal({ open, ...props }: Props) {
  return (
    <AnimatePresence>
      {open && <LoginModalContent key={`${props.initialView ?? 'login'}-${props.registered ? 'registered' : 'default'}`} {...props} />}
    </AnimatePresence>
  )
}
