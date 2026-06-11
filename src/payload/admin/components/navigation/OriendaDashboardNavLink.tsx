'use client'

import { LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function OriendaDashboardNavLink() {
  const pathname = usePathname()
  const isActive = pathname === '/admin' || pathname === '/admin/'

  return (
    <Link className={isActive ? 'orienda-dashboard-nav-link is-active' : 'orienda-dashboard-nav-link'} href="/admin">
      <span>Dashboard</span>
    </Link>
  )
}

export default OriendaDashboardNavLink
