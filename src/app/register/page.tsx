'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-16" style={{ background: '#fbf7ee' }}>
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-10">
          <Link href="/">
            <div className="relative w-[80px] h-[80px] mb-4">
              <Image src="/images/logo-emblem.png" alt="Orienda" fill className="object-cover rounded-full" sizes="80px" />
            </div>
          </Link>
          <h1 className="font-cormorant font-bold text-[40px] text-gold-900 leading-none">Create Account</h1>
          <p className="font-dm-sans text-[16px] text-gold-800 mt-2">Join Orienda International Hospital</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-[24px] shadow-[0px_4px_32px_rgba(122,95,44,0.10)] p-8 flex flex-col gap-5">
          {[
            { key: 'full_name', label: 'Full Name', placeholder: 'Your full name', type: 'text' },
            { key: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email' },
            { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
            { key: 'confirm', label: 'Confirm Password', placeholder: '••••••••', type: 'password' },
          ].map(f => (
            <div key={f.key} className="flex flex-col gap-2">
              <label className="font-dm-sans text-[14px] font-medium text-gold-900">{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-[12px] border border-gold-200 font-dm-sans text-[15px] text-gold-900 outline-none focus:border-gold-500 transition-colors"
                style={{ background: '#fdfaf5' }} />
            </div>
          ))}
          {error && <p className="font-dm-sans text-[13px] text-red-600">{error}</p>}
          <button type="submit" disabled={status === 'loading'}
            className="w-full py-4 rounded-full font-dm-sans text-[17px] text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-1"
            style={{ background: '#b89148' }}>
            {status === 'loading' ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center font-dm-sans text-[14px] text-gold-800 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-gold-700 font-medium hover:text-gold-900">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
