import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Recover the locale from `next` so every redirect below stays in the user's
  // language (next-intl always prefixes paths with the locale).
  const seg = next.split('/')[1]
  const locale = ['en', 'km', 'zh'].includes(seg) ? seg : 'en'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Route new users (no name/phone yet) to onboarding, but only when no
      // explicit destination was requested — don't hijack a purchase/booking flow.
      try {
        const userId = data?.user?.id
        const noDestination = next === '/' || next === '' || next === `/${locale}`
        if (userId && noDestination) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, phone')
            .eq('id', userId)
            .single()
          const complete = Boolean(profile?.display_name?.trim() && profile?.phone?.trim())
          if (!complete) return NextResponse.redirect(`${origin}/${locale}/complete-profile`)
        }
      } catch {}
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/${locale}?error=auth-callback-failed`)
}
