'use client'

import { Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import LoginModal from '@/components/shared/LoginModal'

function LoginRouteModal() {
  const params = useSearchParams()
  const locale = useLocale()
  const rawNext = params.get('next') || params.get('redirect') || '/'
  // Keep the post-login destination in the active locale (next-intl always
  // prefixes paths), so users aren't bounced to the default-language page.
  const firstSeg = rawNext.split('/')[1]
  const nextUrl = ['en', 'km', 'zh'].includes(firstSeg)
    ? rawNext
    : `/${locale}${rawNext === '/' ? '' : rawNext}`
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
      <div className="min-h-screen bg-[var(--background)]" />
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
