'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useCookieConsent } from '@/lib/cookie-utils'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function GoogleAnalyticsLoader() {
  const consent = useCookieConsent()

  if (!GA_ID || consent !== 'accepted') return null

  return <GoogleAnalytics gaId={GA_ID} />
}
