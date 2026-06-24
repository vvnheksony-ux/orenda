'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { friendlyError } from '@/lib/auth-errors'

const supabase = createClient()

function ResetForm() {
  const params = useSearchParams()
  const [password, setPassword]     = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading]       = useState(false)
  const [errorMsg, setErrorMsg]     = useState('')
  const [done, setDone]             = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)

  useEffect(() => {
    // Supabase puts the tokens in the URL hash — the client SDK picks them up automatically
    // If there's an error param in the URL, the link is invalid/expired
    const error = params.get('error')
    const errorDesc = params.get('error_description')
    if (error) {
      setInvalidLink(true)
      setErrorMsg(errorDesc || 'This reset link is invalid or has expired.')
    }
  }, [params])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPass) { setErrorMsg('Passwords do not match'); return }
    if (password.length < 8) { setErrorMsg('Password must be at least 8 characters'); return }

    setLoading(true); setErrorMsg('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setErrorMsg(friendlyError(error.message))
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  const inputCls = 'w-full px-4 py-3 rounded-[12px] border border-gold-200 outline-none focus:border-[#b89148] font-dm-sans text-[15px] bg-gold-50/30'
  const labelCls = 'text-[13px] font-bold text-gold-900 font-dm-sans uppercase tracking-wide'

  return (
    <div className="min-h-screen flex items-center justify-center px-5 pt-[90px] lg:pt-[150px] pb-20" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <Link href="/"><div className="relative w-[80px] h-[80px] mb-4"><Image src="/images/logo-emblem.png" alt="Orienda" fill className="object-cover rounded-full" sizes="80px" /></div></Link>
          <h1 className="font-cormorant font-bold text-[40px] text-gold-900 leading-none">New Password</h1>
          <p className="font-dm-sans text-[16px] text-gold-800 mt-2">Choose a strong password</p>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0px_4px_32px_rgba(122,95,44,0.10)] p-8 flex flex-col gap-5">

          {done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="text-[48px]">✅</div>
              <h2 className="font-cormorant font-bold text-[24px] text-gold-900">Password updated!</h2>
              <p className="font-dm-sans text-[15px] text-gold-800">You can now sign in with your new password.</p>
              <Link href="/login" className="w-full py-3 bg-[#b89148] hover:bg-[#a07d3a] transition-colors text-white rounded-[12px] font-bold font-dm-sans text-center mt-2">
                Sign In
              </Link>
            </div>
          ) : invalidLink ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="text-[48px]">⚠️</div>
              <p className="font-dm-sans text-[15px] text-red-600">{errorMsg}</p>
              <Link href="/forgot-password" className="w-full py-3 bg-[#b89148] hover:bg-[#a07d3a] transition-colors text-white rounded-[12px] font-bold font-dm-sans text-center">
                Request New Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              {errorMsg && <div className="p-3 bg-red-50 border border-red-100 rounded-[8px] text-red-600 text-[13px] font-dm-sans">⚠️ {errorMsg}</div>}
              <div className="flex flex-col gap-1">
                <label className={labelCls}>New Password</label>
                <input type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Confirm Password</label>
                <input type="password" placeholder="Repeat password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required className={inputCls} />
                {confirmPass && password !== confirmPass && <p className="text-red-500 text-[12px] font-dm-sans">Passwords don&apos;t match</p>}
              </div>
              <button disabled={loading || (!!confirmPass && password !== confirmPass)} type="submit" className="w-full py-3 bg-[#b89148] hover:bg-[#a07d3a] text-white rounded-[12px] font-bold font-dm-sans disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>
}
