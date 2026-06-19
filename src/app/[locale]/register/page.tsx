'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import LoginModal from '@/components/shared/LoginModal'

function RegisterRouteModal() {
  const params = useSearchParams()
  // New sign-ups land on the onboarding screen to complete their profile.
  const rawNext = params.get('next') || params.get('redirect') || '/complete-profile'
  // Only allow same-origin relative paths to prevent open redirects (e.g. //evil.com).
  const nextUrl = rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('/\\') ? rawNext : '/complete-profile'

  const leaveRoute = () => {
    if (window.history.length > 1) window.history.back()
    else window.location.href = nextUrl
  }

  return (
    <>
      <div className="min-h-screen bg-[#fbf7ee]" />
      <LoginModal
        open={true}
        onClose={leaveRoute}
        onSuccess={() => { window.location.href = nextUrl }}
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
