'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

type AuthCtx = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({ user: null, session: null, loading: true, signOut: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Failsafe: never leave the UI stuck in a loading state if getSession stalls
    // (slow network / dev build over LAN). Treat as logged-out after 2.5s.
    const failsafe = setTimeout(() => setLoading(false), 2500)

    return () => { clearTimeout(failsafe); subscription.unsubscribe() }
  }, [])

  const signOut = async () => {
    // Local scope clears the session in this browser without a server round-trip,
    // so sign-out can't hang on a slow/unreachable auth request. Drop local state
    // immediately too, so the UI reflects sign-out even if the call is slow.
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch {
      /* ignore — local state is cleared below regardless */
    }
    setSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
