import createIntlMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {updateSession} from './utils/supabase/middleware';
import { NextRequest } from 'next/server';

const handleI18nRouting = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Auth safety net: a Supabase email/OAuth `?code=` that lands on a normal page
  // (instead of /api/auth/callback) is never exchanged for a session, so the user
  // stays signed out. Forward it to the callback, keeping the locale as the
  // post-login destination.
  const authCode = searchParams.get('code');
  if (authCode && !pathname.startsWith('/api/')) {
    const { NextResponse } = await import('next/server');
    const seg = pathname.split('/')[1];
    const locale = ['en', 'km', 'zh'].includes(seg) ? seg : 'en';
    const url = request.nextUrl.clone();
    url.pathname = '/api/auth/callback';
    url.search = '';
    url.searchParams.set('code', authCode);
    url.searchParams.set('next', `/${locale}`);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/api/')) {
    const { NextResponse } = await import('next/server');
    return await updateSession(request, NextResponse.next());
  }
  const response = handleI18nRouting(request);
  return await updateSession(request, response);
}

export const config = {
  matcher: [
    '/',
    '/(en|km|zh)/:path*',
    '/api/appointments',
    '/api/inquiries',
    '/((?!api|_next|_vercel|admin|payload-api|.*\\..*).*)'
  ]
};
