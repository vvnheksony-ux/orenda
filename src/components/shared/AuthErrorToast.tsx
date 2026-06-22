'use client'

import { useEffect, useState } from 'react'
import LoginModal from '@/components/shared/LoginModal'

function friendlyAuthError(code: string, desc: string) {
  const c = (code || '').toLowerCase()
  const d = (desc || '').toLowerCase()
  if (c.includes('flow_state') || c.includes('already_used')) return 'That sign-in link was already used or has expired. Please sign in again.'
  if (c.includes('access_denied')) return 'Sign-in was cancelled.'
  if (c.includes('bad_oauth_state') || c.includes('otp_expired') || c.includes('expired') || d.includes('expired')) return 'Your sign-in session expired. Please sign in again.'
  return desc || 'Sign-in could not be completed. Please try again.'
}

// When a Supabase auth error lands on a page via the URL (query or hash) — e.g. an
// expired/cancelled OAuth attempt — reopen the login modal on the current page with
// the reason shown, then clean the error out of the URL so it doesn't persist.
export default function AuthErrorToast() {
  const [error, setError] = useState<string | null>(null)
  const [redirectTo, setRedirectTo] = useState('/')

  useEffect(() => {
    const url = new URL(window.location.href)
    // These pages render their own auth UI (a modal or an invalid-link screen)
    // and read the error themselves — don't stack a second modal on top.
    if (/\/(reset-password|login|register)(\/|$)/.test(url.pathname)) return
    const params = url.searchParams
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''))
    const err = params.get('error') || hash.get('error')
    if (!err) return

    const code = params.get('error_code') || hash.get('error_code') || err
    const desc = params.get('error_description') || hash.get('error_description') || ''
    setError(friendlyAuthError(code, desc))
    setRedirectTo(url.pathname)

    ;['error', 'error_code', 'error_description'].forEach((k) => params.delete(k))
    url.hash = ''
    window.history.replaceState({}, '', url.pathname + (params.toString() ? `?${params.toString()}` : ''))
  }, [])

  if (!error) return null

  return (
    <LoginModal
      open
      initialView="login"
      initialError={error}
      redirectTo={redirectTo}
      onClose={() => setError(null)}
      onSuccess={() => setError(null)}
    />
  )
}
