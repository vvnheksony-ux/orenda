'use client'

import NavigationBar from '@/components/admin/NavigationBar'

export default function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen lg:flex">
      <NavigationBar />
      <main className="min-w-0 flex-1 lg:pl-[280px]">{children}</main>
    </div>
  )
}
