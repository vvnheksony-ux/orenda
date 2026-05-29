'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAnalytics } from '@/lib/use-analytics'

export function AnalyticsTracker() {
  const pathname = usePathname()
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    // Track page view on route change
    trackPageView(pathname)
  }, [pathname, trackPageView])

  return null
}
