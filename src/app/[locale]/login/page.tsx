'use client'

import { Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import LoginModal from '@/components/shared/LoginModal'

function LoginRouteModal() {
  const params = useSearchParams()
  const nextUrl = params.get('next') || params.get('redirect') || '/'
  const registered = params.get('registered') === '1'

  // On success we navigate to nextUrl; guard leaveRoute so the modal's onClose
  // doesn't history.back() and override that redirect.
  const succeeded = useRef(false)

  const leaveRoute = () => {
    if (succeeded.current) return
    if (window.history.length > 1) window.history.back()
    else window.location.href = nextUrl
  }

  return (
    <>
      <div className="min-h-screen bg-[#fbf7ee]" />
      <LoginModal
        open={true}
        onClose={leaveRoute}
        onSuccess={() => { succeeded.current = true; window.location.href = nextUrl }}
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
