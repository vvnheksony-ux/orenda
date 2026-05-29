'use client'

import { useState, useEffect, ReactNode } from 'react'

/**
 * Returns true if the user has explicitly accepted cookies.
 * Non-reactive, use for logic inside functions.
 */
export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('cookie-consent') === 'accepted'
}

/**
 * A reactive wrapper component that only renders its children if cookie consent is given.
 * It will instantly show children when the user clicks "Accept" in the modal.
 */
export function ConsentWrapper({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('cookie-consent') === 'accepted'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = () => {
      setConsent(localStorage.getItem('cookie-consent') === 'accepted')
    }

    window.addEventListener('cookie-consent-updated', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('cookie-consent-updated', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  if (!consent) return null
  return children as any
}
