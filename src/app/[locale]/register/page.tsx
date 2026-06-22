'use client'

import { Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import LoginModal from '@/components/shared/LoginModal'

function RegisterRouteModal() {
  const params = useSearchParams()
  const locale = useLocale()
  // New sign-ups land on the onboarding screen to complete their profile.
  const rawNext = params.get('next') || params.get('redirect') || '/complete-profile'
  // Only allow same-origin relative paths to prevent open redirects (e.g. //evil.com).
  const safeNext = rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('/\\') ? rawNext : '/complete-profile'
  // Keep the destination in the active locale (next-intl always prefixes paths).
  const firstSeg = safeNext.split('/')[1]
  const nextUrl = ['en', 'km', 'zh'].includes(firstSeg) ? safeNext : `/${locale}${safeNext === '/' ? '' : safeNext}`

  // Once auth succeeds we navigate to nextUrl; the modal also fires onClose, so
  // guard leaveRoute to avoid history.back() racing/overriding that redirect.
  const succeeded = useRef(false)

  const leaveRoute = () => {
    if (succeeded.current) return
    if (window.history.length > 1) window.history.back()
    else window.location.href = nextUrl
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--background)]" />
      <LoginModal
        open={true}
        onClose={leaveRoute}
        onSuccess={() => { succeeded.current = true; window.location.href = nextUrl }}
        redirectTo={nextUrl}
        initialView="register"
      />
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterRouteModal />
    </Suspense>
  )
}
