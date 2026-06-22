import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired and return the user
  const { data: { user } } = await supabase.auth.getUser()

  // Define routes that require authentication
  const protectedRoutes = ['/profile', '/dashboard']

  const path = request.nextUrl.pathname
  // Preserve the active locale on redirects — next-intl always prefixes paths,
  // so a bare '/login' or '/' would bounce the user to the default language.
  const seg = path.split('/')[1]
  const locale = ['en', 'km', 'zh'].includes(seg) ? seg : 'en'
  const isProtectedRoute = protectedRoutes.some((route) => path.includes(route))

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = `/${locale}/login`
    redirectUrl.searchParams.set('next', path) // return here after signing in
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is already logged in, they shouldn't be able to see the login or register pages
  const isAuthRoute = path.includes('/login') || path.includes('/register')
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = `/${locale}`
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
