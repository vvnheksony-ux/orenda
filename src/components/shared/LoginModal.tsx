'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { createClient } from '@/utils/supabase/client'

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
  return message
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
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [noticeMsg, setNoticeMsg] = useState(registered ? 'Account created! Check your email to confirm, then sign in.' : '')
  const [showResend, setShowResend] = useState(false)

  // Lock background scroll while the modal is mounted (it only renders when open).
  useEffect(() => {
    const scrollY = window.scrollY
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth
    const htmlEl = document.documentElement
    const bodyEl = document.body
    const prev = {
      htmlOverflow: htmlEl.style.overflow,
      bodyOverflow: bodyEl.style.overflow,
      bodyPosition: bodyEl.style.position,
      bodyTop: bodyEl.style.top,
      bodyWidth: bodyEl.style.width,
      bodyPaddingRight: bodyEl.style.paddingRight,
    }
    htmlEl.style.overflow = 'hidden'
    bodyEl.style.overflow = 'hidden'
    bodyEl.style.position = 'fixed'
    bodyEl.style.top = `-${scrollY}px`
    bodyEl.style.width = '100%'
    if (scrollbarW > 0) bodyEl.style.paddingRight = `${scrollbarW}px`
    return () => {
      htmlEl.style.overflow = prev.htmlOverflow
      bodyEl.style.overflow = prev.bodyOverflow
      bodyEl.style.position = prev.bodyPosition
      bodyEl.style.top = prev.bodyTop
      bodyEl.style.width = prev.bodyWidth
      bodyEl.style.paddingRight = prev.bodyPaddingRight
      window.scrollTo(0, scrollY)
    }
  }, [])

  const resetFlow = () => {
    setMode('options')
    setPhoneStep('phone')
    setOtp('')
    setErrorMsg('')
    setShowResend(false)
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
      setNoticeMsg(`Verification code sent to ${normalizedPhone}.`)
    }

    setLoading(false)
  }

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
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

    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: otp.replace(/\D/g, ''),
      type: 'sms',
    })

    if (error) {
      setErrorMsg(friendlyError(error.message))
      setLoading(false)
      return
    }

    if (data.user) {
      await syncProfile(data.user.id, { email: data.user.email, phone: normalizedPhone })
      onSuccess?.()
      onClose()
    }

    setLoading(false)
  }

  const handleResend = async () => {
    setLoading(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) setErrorMsg(friendlyError(error.message))
    else setNoticeMsg(`Confirmation email sent to ${email}.`)
    setLoading(false)
  }

  const handleGoogle = async () => {
    setErrorMsg('')
    const callbackUrl = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) setErrorMsg(friendlyError(error.message))
  }

  const title = view === 'login' ? 'Sign In' : 'Create Account'
  const subtitle = view === 'login' ? 'Access your Orienda account with email, Google, or phone.' : 'Create your Orienda account with email, Google, or phone.'

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
                <button onClick={() => setMode('email')} type="button" className={optionBtnCls}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  {view === 'login' ? 'Continue with Email' : 'Sign up with Email'}
                </button>

                <button onClick={() => setMode('phone')} type="button" className={optionBtnCls}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  {view === 'login' ? 'Continue with Phone' : 'Sign up with Phone'}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gold-200" />
                  <span className="text-[11px] font-dm-sans font-bold text-gold-400 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-gold-200" />
                </div>

                <button onClick={handleGoogle} type="button" className="w-full py-3 px-4 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] font-medium text-gold-900 flex items-center justify-center gap-3 hover:bg-white transition-colors bg-white">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  {view === 'login' ? 'Continue with Google' : 'Sign up with Google'}
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
                  <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required className={inputCls} />
                </div>
                <Link href="/forgot-password" className="text-right font-dm-sans text-[12px] text-gold-600 hover:text-gold-800 transition-colors">
                  Forgot password?
                </Link>
                <button disabled={loading} type="submit" className={primaryBtnCls} style={{ background: '#b89148' }}>
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
                  <input type="password" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} required className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">Confirm Password</label>
                  <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">Phone Number <span className="font-normal text-gold-500">(optional)</span></label>
                  <input type="tel" placeholder="+855 12 345 678" value={phoneSignup} onChange={e => setPhoneSignup(e.target.value)} className={inputCls} />
                </div>
                <button disabled={loading} type="submit" className={primaryBtnCls} style={{ background: '#b89148' }}>
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
              <form onSubmit={handleVerifyPhoneOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">6-Digit Code</label>
                  <input type="text" placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)} required className={`${inputCls} text-center tracking-[0.5em] text-lg font-bold`} />
                </div>
                <button disabled={loading} type="submit" className={primaryBtnCls} style={{ background: '#b89148' }}>
                  {loading ? 'Verifying...' : view === 'login' ? 'Verify & Sign In' : 'Verify & Create Account'}
                </button>
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
