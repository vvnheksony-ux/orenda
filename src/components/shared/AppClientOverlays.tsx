'use client'

import { useEffect, useState } from 'react'
import FloatingChat from '@/components/chat/FloatingChat'
import OneSignalInit from '@/components/shared/OneSignalInit'

export default function AppClientOverlays() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <OneSignalInit />
      <FloatingChat />
    </>
  )
}
