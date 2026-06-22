import type { Metadata } from 'next'
import { cormorantGaramond, dmSans, inter, greatVibes, khmerSerif, khmerSans, chineseSerif } from '@/lib/fonts'
import { AuthProvider } from '@/lib/auth-context'
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import CookieConsent from '@/components/shared/CookieConsent'
import { AnalyticsTracker } from '@/components/shared/AnalyticsTracker'
import OneSignalInit from '@/components/shared/OneSignalInit'
import ProfileGate from '@/components/shared/ProfileGate'
import AuthErrorToast from '@/components/shared/AuthErrorToast'
import { BranchProvider } from '@/lib/branch-context'
import FloatingChat from '@/components/chat/FloatingChat'

export const metadata: Metadata = {
  title: {
    default: 'Orienda International Hospital',
    template: '%s | Orienda International Hospital',
  },
  description: 'Premier healthcare in Cambodia — ISO-certified, 24/7 comprehensive medical services including emergency care, fertility, maternity, and specialist consultations.',
  keywords: ['hospital cambodia', 'phnom penh hospital', 'orienda hospital', 'healthcare cambodia', 'doctor cambodia', 'medical center phnom penh'],
  authors: [{ name: 'Orienda International Hospital' }],
  metadataBase: new URL('https://orienda.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Orienda International Hospital',
    title: 'Orienda International Hospital',
    description: 'Premier healthcare in Cambodia — ISO-certified, 24/7 comprehensive medical services.',
    images: [{ url: '/images/og-cover.jpg', width: 1200, height: 630, alt: 'Orienda International Hospital' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orienda International Hospital',
    description: 'Premier healthcare in Cambodia — ISO-certified, 24/7 comprehensive medical services.',
    images: ['/images/og-cover.jpg'],
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${cormorantGaramond.variable} ${dmSans.variable} ${inter.variable} ${greatVibes.variable} ${khmerSerif.variable} ${khmerSans.variable} ${chineseSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          Suppress OneSignal's harmless background push-registration rejections
          (e.g. "push service not available") before any framework code runs.
          The SDK throws these asynchronously, outside our try/catch, so they
          become unhandled rejections that otherwise trip Next.js's dev error
          overlay. This inline script registers its listener during HTML parse —
          BEFORE Next's overlay handler — so stopImmediatePropagation() keeps the
          overlay handler from ever seeing these expected, unsupported-push cases.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){window.addEventListener('unhandledrejection',function(e){var r=e&&e.reason;var m=(r&&r.message?r.message:(typeof r==='string'?r:'')).toLowerCase();var n=r&&r.name;if(n==='AbortError'||m.indexOf('push service not available')!==-1||m.indexOf('does not support web push')!==-1||m.indexOf('push notifications')!==-1){e.stopImmediatePropagation();e.preventDefault();}},true);})();`,
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <BranchProvider locale={locale}>
              <AnalyticsTracker />
              <OneSignalInit />
              <ProfileGate />
              <AuthErrorToast />
              {children}
              <FloatingChat />
              <CookieConsent />
            </BranchProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
