'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import { getProfileComplete, setProfileComplete } from '@/lib/profile-status'

const supabase = createClient()

// The dedicated onboarding screen for patients who need to complete profile data.
const ONBOARDING = '/complete-profile'

// Profile completion is only required for booking/history flows, not for
// browsing the website after sign-in.
const REQUIRES_COMPLETE_PROFILE = ['/appointments']

export default function ProfileGate() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const lastUserId = useRef<string | null>(null)
  // Bumped whenever the cached completeness changes, to force a re-render so the
  // blocking cover below re-evaluates (the cache lives in a module variable).
  const [, force] = useState(0)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setProfileComplete(null)
      lastUserId.current = null
      return
    }

    // A different account signed in (without a full reload) → re-verify from scratch
    // so we never reuse the previous user's completeness flag.
    if (lastUserId.current !== user.id) {
      lastUserId.current = user.id
      setProfileComplete(null)
      force(n => n + 1)
    }

    const onOnboarding = pathname.startsWith(ONBOARDING)
    const onProfilePage = pathname.startsWith('/profile')
    const requiresCompleteProfile = REQUIRES_COMPLETE_PROFILE.some((route) =>
      pathname === route || pathname.startsWith(`${route}/`)
    )
    const enforce = () => {
      if (getProfileComplete() === false && requiresCompleteProfile && !onOnboarding && !onProfilePage) {
        router.replace(ONBOARDING)
      }
    }

    if (getProfileComplete() === null) {
      supabase
        .from('profiles')
        .select('display_name, phone')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          // On a query error, don't lock the user out of the entire site —
          // treat as complete; onboarding will catch them next time.
          setProfileComplete(error ? true : Boolean(data?.display_name?.trim() && data?.phone?.trim()))
          force(n => n + 1) // re-render so the cover re-evaluates with the resolved value
          enforce()
        })
    } else {
      enforce()
    }
  }, [user, loading, pathname, router])

  const requiresCompleteProfile = REQUIRES_COMPLETE_PROFILE.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Cover the screen only on routes that actually require a completed profile.
  const blocking =
    !loading &&
    !!user &&
    requiresCompleteProfile &&
    !pathname.startsWith(ONBOARDING) &&
    !pathname.startsWith('/profile') &&
    getProfileComplete() !== true

  if (blocking) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#fbf7ee] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#b89148] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return null
}
