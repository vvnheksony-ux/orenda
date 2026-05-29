import type { Metadata } from 'next'
import { cormorantGaramond, dmSans, inter, greatVibes, khmerSerif, khmerSans, chineseSerif, chineseSans } from '@/lib/fonts'
import { AuthProvider } from '@/lib/auth-context'
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import CookieConsent from '@/components/shared/CookieConsent'
import { AnalyticsTracker } from '@/components/shared/AnalyticsTracker'

export const metadata: Metadata = {
  title: 'Orienda International Hospital',
  description: 'Premier healthcare in Cambodia — ISO-certified, 24/7 comprehensive medical services.',
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
      className={`${cormorantGaramond.variable} ${dmSans.variable} ${inter.variable} ${greatVibes.variable} ${khmerSerif.variable} ${khmerSans.variable} ${chineseSerif.variable} ${chineseSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <AnalyticsTracker />
            {children}
            <CookieConsent />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
