'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const supabase = createClient()

interface Props {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  redirectTo?: string
  message?: string
}

export default function LoginModal({ open, onClose, onSuccess, redirectTo = '/', message }: Props) {
  const t = useTranslations('LoginModal')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showResend, setShowResend] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  function friendlyError(msg: string) {
    if (msg.includes('Invalid login') || msg.includes('invalid credentials'))
      return 'Incorrect email or password.'
    if (msg.includes('Email not confirmed'))
      return 'Please confirm your email before signing in.'
    if (msg.includes('rate limit') || msg.includes('too many'))
      return 'Too many attempts. Please wait a few minutes.'
    return msg
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setErrorMsg(''); setShowResend(false)

    try {
      const { error, data } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 15000)),
      ])

      if (error) {
        setErrorMsg(friendlyError(error.message))
        if (error.message.includes('Email not confirmed')) setShowResend(true)
      } else if (data?.user) {
        try {
          await supabase.from('profiles').upsert(
            { id: data.user.id, email_user: data.user.email },
            { onConflict: 'id', ignoreDuplicates: true }
          )
        } catch {}
        onSuccess?.()
        onClose()
      }
    } catch (err: any) {
      setErrorMsg(err?.message === 'timeout'
        ? 'Connection timed out. Please try again.'
        : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (!error) { setResendSent(true); setErrorMsg('') }
    setLoading(false)
  }

  const handleGoogle = async () => {
    const callbackUrl = `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
    if (error) setErrorMsg(friendlyError(error.message))
  }

  const inputCls = 'w-full px-4 py-3 rounded-[12px] border border-gold-200 outline-none focus:border-[#b89148] font-dm-sans text-[15px] bg-white transition-colors'

  return (
    <AnimatePresence>
      {open && (
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
            className="relative bg-[#fbf7ee] rounded-[24px] shadow-[0px_8px_40px_rgba(89,69,34,0.2)] p-8 w-full max-w-md flex flex-col gap-5"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button onClick={onClose} className="absolute top-5 right-5 text-gold-500 hover:text-gold-900 transition-colors">
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-[56px] h-[56px]">
                <Image src="/images/logo-emblem.png" alt="Orienda" fill className="object-cover rounded-full" sizes="56px" />
              </div>
              <h2 className="font-cormorant font-bold text-[32px] text-gold-900 leading-none">{t('title')}</h2>
              {message && (
                <p className="font-dm-sans text-[14px] text-gold-700 text-center leading-[1.5]">{message}</p>
              )}
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-[10px] text-red-600 text-[13px] font-dm-sans flex flex-col gap-1">
                <span>⚠️ {errorMsg}</span>
                {showResend && !resendSent && (
                  <button onClick={handleResend} disabled={loading} className="text-[#b89148] font-medium hover:underline text-left disabled:opacity-50 text-[12px]">
                    {t('resendEmail')}
                  </button>
                )}
              </div>
            )}
            {resendSent && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-[10px] text-blue-700 text-[13px] font-dm-sans">
                📧 {t('confirmationSent', { email })}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">{t('emailLabel')}</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gold-900 font-dm-sans">{t('passwordLabel')}</label>
                <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required className={inputCls} />
              </div>
              <button disabled={loading} type="submit" className="w-full py-3 rounded-[12px] font-dm-sans font-bold text-[16px] text-white hover:opacity-90 disabled:opacity-50 transition-opacity" style={{ background: '#b89148' }}>
                {loading ? t('signingIn') : t('signIn')}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gold-200" />
              <span className="text-[11px] font-dm-sans font-bold text-gold-400 uppercase tracking-widest">{t('or')}</span>
              <div className="flex-1 h-px bg-gold-200" />
            </div>

            <button onClick={handleGoogle} type="button" className="w-full py-3 px-4 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] font-medium text-gold-900 flex items-center justify-center gap-3 hover:bg-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t('continueGoogle')}
            </button>

            <p className="text-center font-dm-sans text-[13px] text-gold-700">
              {t('noAccount')}{' '}
              <a href={`/register?redirect=${encodeURIComponent(redirectTo)}`} className="font-medium text-[#b89148] hover:underline">{t('createOne')}</a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
