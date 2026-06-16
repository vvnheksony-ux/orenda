'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import LoginModal from '@/components/shared/LoginModal'

function LoginRouteModal() {
  const params = useSearchParams()
  const nextUrl = params.get('next') || params.get('redirect') || '/'
  const registered = params.get('registered') === '1'

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
        initialView="login"
        registered={registered}
      />
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginRouteModal />
    </Suspense>
  )
}
