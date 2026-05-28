import createIntlMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {updateSession} from './utils/supabase/middleware';
import { NextRequest } from 'next/server';

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);
  return await updateSession(request, response);
}

export const config = {
  matcher: [
    '/',
    '/(en|km|zh)/:path*',
    '/((?!api|_next|_vercel|admin|payload-api|.*\\..*).*)'
  ]
};
