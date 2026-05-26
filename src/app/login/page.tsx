'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const registered = params.get('registered') === '1'
  const [form, setForm] = useState({ email: '', password: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Email and password required.'); return }
    setStatus('loading'); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (err) { setStatus('error'); setError(err.message); return }
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#fbf7ee' }}>
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-10">
          <Link href="/">
            <div className="relative w-[80px] h-[80px] mb-4">
              <Image src="/images/logo-emblem.png" alt="Orienda" fill className="object-cover rounded-full" sizes="80px" />
            </div>
          </Link>
          <h1 className="font-cormorant font-bold text-[40px] text-gold-900 leading-none">Welcome Back</h1>
          <p className="font-dm-sans text-[16px] text-gold-800 mt-2">Sign in to your account</p>
        </div>

        {registered && (
          <div className="mb-4 px-4 py-3 rounded-[12px] bg-green-50 border border-green-200 font-dm-sans text-[14px] text-green-700 text-center">
            Account created! Sign in below.
          </div>
        )}
        <form onSubmit={submit} className="bg-white rounded-[24px] shadow-[0px_4px_32px_rgba(122,95,44,0.10)] p-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-dm-sans text-[14px] font-medium text-gold-900">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="your@email.com" autoComplete="email"
              className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors"
              style={{ background: '#fdfaf5' }} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-dm-sans text-[14px] font-medium text-gold-900">Password</label>
              <Link href="/forgot-password" className="font-dm-sans text-[13px] text-gold-600 hover:text-gold-900">Forgot password?</Link>
            </div>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••" autoComplete="current-password"
              className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors"
              style={{ background: '#fdfaf5' }} />
          </div>
          {error && <p className="font-dm-sans text-[13px] text-red-600">{error}</p>}
          <button type="submit" disabled={status === 'loading'}
            className="w-full py-4 rounded-full font-dm-sans text-[17px] text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-1"
            style={{ background: '#b89148' }}>
            {status === 'loading' ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center font-dm-sans text-[14px] text-gold-800 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-gold-700 font-medium hover:text-gold-900">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
