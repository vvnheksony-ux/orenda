import type { Metadata } from 'next'
import { cormorantGaramond, dmSans, inter, greatVibes } from '@/lib/fonts'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orienda International Hospital',
  description: 'Premier healthcare in Cambodia — ISO-certified, 24/7 comprehensive medical services.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${dmSans.variable} ${inter.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
