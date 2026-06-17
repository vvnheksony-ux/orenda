'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'
import { getProfileComplete, setProfileComplete } from '@/lib/profile-status'

const supabase = createClient()

// The only page a logged-in, not-yet-onboarded user may see.
const ONBOARDING = '/complete-profile'

// Hard gate: a logged-in user with an incomplete profile (missing name/phone)
// cannot access ANY page until they finish onboarding. Every route bounces
// them to /complete-profile, and a full-screen cover prevents content flashing.
export default function ProfileGate() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) {
      setProfileComplete(null)
      return
    }

    const onOnboarding = pathname.startsWith(ONBOARDING)
    const enforce = () => {
      if (getProfileComplete() === false && !onOnboarding) router.replace(ONBOARDING)
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
          enforce()
        })
    } else {
      enforce()
    }
  }, [user, loading, pathname, router])

  // While a logged-in user is incomplete and not on the onboarding page,
  // cover the screen so no site content is reachable during the redirect.
  const blocking =
    !loading &&
    !!user &&
    getProfileComplete() === false &&
    !pathname.startsWith(ONBOARDING)

  if (blocking) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#fbf7ee] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#b89148] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return null
}
