import { cormorantGaramond, dmSans, inter, greatVibes, khmerSerif, khmerSans, chineseSerif } from '@/lib/fonts'
import AdminShell from '@/components/admin/AdminShell'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import '../globals.css'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  const role = user && typeof user === 'object' && 'role' in user ? user.role : null

  if (role !== 'admin') {
    redirect('/admin')
  }


  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${dmSans.variable} ${inter.variable} ${greatVibes.variable} ${khmerSerif.variable} ${khmerSans.variable} ${chineseSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f8f7f5] font-dm-sans text-[#2d2b28]">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  )
}
