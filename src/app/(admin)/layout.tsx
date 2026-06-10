'use client'

import { cormorantGaramond, dmSans, inter, greatVibes, khmerSerif, khmerSans, chineseSerif } from '@/lib/fonts'
import NavigationBar from '@/components/admin/NavigationBar'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import '../globals.css'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin-panel/login'

  useEffect(() => {
    if (pathname === '/admin-panel') {
      router.replace('/admin-panel/login')
    }
  }, [pathname, router])

  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${dmSans.variable} ${inter.variable} ${greatVibes.variable} ${khmerSerif.variable} ${khmerSans.variable} ${chineseSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f8f7f5] font-dm-sans text-[#2d2b28]">
        {!isLoginPage ? (
          <div className="min-h-screen lg:flex">
            <NavigationBar />
            <main className="min-w-0 flex-1 lg:pl-[280px]">{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  )
}
