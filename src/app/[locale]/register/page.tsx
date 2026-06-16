'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import LoginModal from '@/components/shared/LoginModal'

function RegisterRouteModal() {
  const params = useSearchParams()
  const nextUrl = params.get('next') || params.get('redirect') || '/'

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
