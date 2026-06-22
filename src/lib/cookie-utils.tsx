'use client'

import { ReactNode, useSyncExternalStore } from 'react'

export type CookieConsentState = 'accepted' | 'declined' | null

function readCookieConsent(): CookieConsentState {
  if (typeof window === 'undefined') return null
  const value = localStorage.getItem('cookie-consent')
  return value === 'accepted' || value === 'declined' ? value : null
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}

  window.addEventListener('cookie-consent-updated', onStoreChange)
  window.addEventListener('storage', onStoreChange)

  return () => {
    window.removeEventListener('cookie-consent-updated', onStoreChange)
    window.removeEventListener('storage', onStoreChange)
  }
}

/**
 * Returns true if the user has explicitly accepted cookies.
 * Non-reactive, use for logic inside functions.
 */
export function hasCookieConsent(): boolean {
  return readCookieConsent() === 'accepted'
}

export function useCookieConsent() {
  return useSyncExternalStore(subscribe, readCookieConsent, () => null)
}

/**
 * A reactive wrapper component that only renders its children if cookie consent is given.
 * It will instantly show children when the user clicks "Accept" in the modal.
 */
export function ConsentWrapper({ children }: { children: ReactNode }) {
  const consent = useCookieConsent()
  if (consent !== 'accepted') return null
  return <>{children}</>
}
