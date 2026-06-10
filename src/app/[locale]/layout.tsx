import type { Metadata } from 'next'
import { cormorantGaramond, dmSans, inter, greatVibes, khmerSerif, khmerSans, chineseSerif } from '@/lib/fonts'
import { AuthProvider } from '@/lib/auth-context'
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import CookieConsent from '@/components/shared/CookieConsent'
import { AnalyticsTracker } from '@/components/shared/AnalyticsTracker'
import { BranchProvider } from '@/lib/branch-context'

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
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <BranchProvider locale={locale}>
              <AnalyticsTracker />
              {children}
              <CookieConsent />
            </BranchProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
