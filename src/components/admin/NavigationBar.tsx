'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  Megaphone,
  MessageSquareText,
  Newspaper,
  Percent,
  Settings,
  Shield,
  ShieldPlus,
  SquareActivity,
  Stethoscope,
  Tickets,
  Users,
  Video,
  Bell,
} from 'lucide-react'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type NavGroup = {
  label?: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    items: [{ label: 'Dashboard', href: '/admin-panel/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operations & Sales',
    items: [
      { label: 'Appointments', href: '/admin-panel/appointments', icon: CalendarDays },
      { label: 'Promotions Purchases', href: '/admin-panel/promotion-purchases', icon: Percent },
      { label: 'Customer Testimonials', href: '/admin-panel/testimonials', icon: MessageSquareText },
    ],
  },
  {
    label: 'Hospital Operation',
    items: [
      { label: 'Branches', href: '/admin-panel/branches', icon: Building2 },
      { label: 'Clinics', href: '/admin-panel/clinics', icon: Home },
      { label: 'Doctors', href: '/admin-panel/doctors', icon: Stethoscope },
      { label: 'Center of Excellence', href: '/admin-panel/centers', icon: ShieldPlus },
    ],
  },
  {
    label: 'Website Content',
    items: [
      { label: 'Pages', href: '/admin-panel/pages', icon: FileText },
      { label: 'Promotions Packages', href: '/admin-panel/promotions', icon: Megaphone },
      { label: 'News', href: '/admin-panel/news', icon: Newspaper },
      { label: 'Announcements', href: '/admin-panel/announcements', icon: Bell },
      { label: 'Health Tips', href: '/admin-panel/health-tips', icon: HeartPulse },
      { label: 'Doctor Talks', href: '/admin-panel/doctor-talks', icon: Video },
      { label: 'Career', href: '/admin-panel/career', icon: BriefcaseBusiness },
      { label: 'FAQs', href: '/admin-panel/faqs', icon: CircleHelp },
      { label: '360° Rooms Tour', href: '/admin-panel/room-tours', icon: SquareActivity },
      { label: 'Insurance', href: '/admin-panel/insurance', icon: Tickets },
    ],
  },
  {
    label: 'Access Control',
    items: [
      { label: 'Users', href: '/admin-panel/users', icon: Users },
      { label: 'Roles', href: '/admin-panel/roles', icon: Shield },
    ],
  },
  {
    label: 'Systems',
    items: [
      { label: 'Audit Logs', href: '/admin-panel/audit-logs', icon: ClipboardList },
      { label: 'AI Chat Bot', href: '/admin-panel/ai-chat-bot', icon: Bot },
      // { label: 'Settings', href: '/admin-panel/settings', icon: Settings },
    ],
  },
]

export default function NavigationBar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.filter((group) => group.label).map((group) => [group.label, true]))
  )

  const toggleGroup = (label: string) => {
    setOpenGroups((current) => ({ ...current, [label]: !current[label] }))
  }

  return (
    <aside className="fixed inset-x-0 top-0 z-40 border-b border-[#d3c2a6]/25 bg-[#3b2a14] text-[#c7b79a] shadow-xl lg:inset-y-0 lg:right-auto lg:w-[280px] lg:border-b-0 lg:border-r">
      <div className="flex h-auto items-center px-5 flex-col p-3">
            <img src="/logo.png" className='h-auto w-auto' alt="Orienda Logo" />
        <p className="ml-auto text-sm font-medium text-[#d4c5ad] sm:ml-0">Orienda Staff Portal</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:h-[calc(100vh-218px)] lg:flex-col lg:gap-3 lg:overflow-y-auto lg:overflow-x-hidden lg:px-3 lg:pb-5">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label ?? 'primary'} className="flex shrink-0 gap-2 lg:block lg:shrink lg:space-y-1">
            {group.label ? (
              <button
                type="button"
                onClick={() => toggleGroup(group.label!)}
                aria-expanded={openGroups[group.label]}
                className="hidden w-full items-center gap-2 px-3 pb-1 pt-2 text-left text-[10px] font-bold uppercase tracking-wide text-[#87765c] transition hover:text-[#d4c5ad] lg:flex"
              >
                <ChevronDown className={`size-3 transition-transform ${openGroups[group.label] ? '' : '-rotate-90'}`} />
                {group.label}
              </button>
            ) : groupIndex > 0 ? null : null}
            {(!group.label || openGroups[group.label]) && group.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition lg:min-w-0 ${
                    isActive
                      ? 'bg-[#f7f0e4] font-semibold text-[#7d612d] shadow-sm'
                      : 'text-[#c2b49d] hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="hidden h-[100px] items-center gap-3 border-t border-[#d3c2a6]/35 px-5 lg:flex">
        <div className="grid size-11 place-items-center rounded-full bg-[#c39a43] text-base font-bold text-white">A</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">Admin Username</p>
          <p className="text-xs text-[#aa9a80]">admin</p>
        </div>
      </div>
    </aside>
  )
}
