'use client'

import { useEffect } from 'react'
import { usePathname } from '@/i18n/routing'

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return null
}
