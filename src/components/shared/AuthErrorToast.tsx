'use client'

import { useEffect, useState } from 'react'

function friendlyAuthError(code: string, desc: string) {
  const c = (code || '').toLowerCase()
  if (c.includes('flow_state') || c.includes('already_used')) return 'That sign-in link was already used or has expired. Please sign in again.'
  if (c.includes('access_denied')) return 'Sign-in was cancelled.'
  if (c.includes('otp_expired') || c.includes('expired')) return 'That link has expired. Please request a new one.'
  return desc || 'Sign-in could not be completed. Please try again.'
}

// Surfaces Supabase auth errors that land on a page via the URL (query or hash)
// — e.g. an expired/reused OAuth link — then cleans them out of the URL.
export default function AuthErrorToast() {
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const url = new URL(window.location.href)
    const params = url.searchParams
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''))
    const error = params.get('error') || hash.get('error')
    if (!error) return

    const code = params.get('error_code') || hash.get('error_code') || error
    const desc = params.get('error_description') || hash.get('error_description') || ''
    setMsg(friendlyAuthError(code, desc))

    ;['error', 'error_code', 'error_description'].forEach((k) => params.delete(k))
    url.hash = ''
    window.history.replaceState({}, '', url.pathname + (params.toString() ? `?${params.toString()}` : ''))

    const t = setTimeout(() => setMsg(null), 6000)
    return () => clearTimeout(t)
  }, [])

  if (!msg) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[600] w-[420px] max-w-[90vw] bg-white border border-red-100 rounded-[14px] shadow-[0_8px_30px_rgba(89,69,34,0.18)] px-4 py-3 flex items-start gap-3">
      <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
      <p className="font-dm-sans text-[14px] text-[#3b2d17] flex-1">{msg}</p>
      <button
        onClick={() => setMsg(null)}
        aria-label="Dismiss"
        className="text-[#b89148] hover:text-[#3b2d17] font-dm-sans text-[20px] leading-none shrink-0"
      >
        ×
      </button>
    </div>
  )
}
