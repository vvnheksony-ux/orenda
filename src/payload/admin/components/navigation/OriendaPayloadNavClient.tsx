'use client'

import { getTranslation } from '@payloadcms/translations'
import { Hamburger, Link, useConfig, useNav, useTranslation } from '@payloadcms/ui'
import type { NavGroupType } from '@payloadcms/ui/shared'
import { EntityType } from '@payloadcms/ui/shared'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { formatAdminURL } from 'payload/shared'
import { useState } from 'react'
import { LogOut } from 'lucide-react' 

type NavPreferences = {
  groups?: Record<string, { open?: boolean }>
}

type OriendaPayloadNavClientProps = {
  groups: NavGroupType[]
  navPreferences: NavPreferences | null
  user?: { email?: unknown; name?: unknown } | null
}

const baseClass = 'nav'
const navLinkClass =
  'flex min-h-10 items-center rounded-xl px-3.5 py-3 text-md text-[#c2b49d] no-underline transition-colors hover:bg-white/[0.08] hover:text-white'
const activeNavLinkClass = `${navLinkClass} bg-[#f7f0e4] font-bold text-black hover:bg-[#f7f0e4] hover:text-[#7d612d]`

function getUserInitial(name: string, email: string) {
  return (name || email || 'A').trim().charAt(0).toUpperCase()
}

export default function OriendaPayloadNavClient({
  groups,
  navPreferences,
  user,
}: OriendaPayloadNavClientProps) {
  const pathname = usePathname()
  const { config } = useConfig()
  const { i18n } = useTranslation()
  const { hydrated, navOpen, navRef, setNavOpen, shouldAnimate } = useNav()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map(({ label }) => [label, navPreferences?.groups?.[label]?.open ?? true]))
  )

  const adminRoute = config.routes.admin
  const logoutHref = formatAdminURL({ adminRoute, path: config.admin.routes.logout })
  const name = typeof user?.name === 'string' ? user.name : 'Admin Username'
  const email = typeof user?.email === 'string' ? user.email : 'admin'
  const navClassName = [
    baseClass,
    'border-r border-[#d3c2a6]/25 bg-[#3b2a14] text-[#c7b79a]',
    navOpen && `${baseClass}--nav-open`,
    shouldAnimate && `${baseClass}--nav-animate`,
    hydrated && `${baseClass}--nav-hydrated`,
  ]
    .filter(Boolean)
    .join(' ')

  const dashboardHref = formatAdminURL({ adminRoute, path: '/' })
  const dashboardActive = pathname === dashboardHref || pathname === `${dashboardHref}/`
  const toggleGroup = (label: string) => {
    setOpenGroups((current) => ({ ...current, [label]: !current[label] }))
  }

  return (
    <aside className={navClassName} inert={!navOpen ? true : undefined}>
      <div className={`${baseClass}__scroll flex h-screen flex-col overflow-hidden`} ref={navRef}>
        <div className="flex min-h-[106px] flex-col items-center gap-1.5 bg-[#5a431f] text-center">
          <Image
            className="h-auto max-h-[90px] w-auto object-contain"
            src="/logo.png"
            width={300}
            height={104}
            alt="Orienda Logo"
            priority
          />
          <p className="m-0 text-md font-medium text-[#d4c5ad] mb-4.5">Orienda Staff Portal</p>
        </div>

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-5">
          <Link
            className={dashboardActive ? activeNavLinkClass : navLinkClass}
            href={dashboardHref}
            prefetch={false}
          >
            Dashboard
          </Link>

          {groups.map(({ entities, label }) => {
            const isOpen = openGroups[label] ?? true

            return (
              <div className="block" key={label}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 bg-transparent border-none pt-2 text-left text-xs font-bold uppercase tracking-wide text-[#87765c] transition-colors hover:text-[#d4c5ad]"
                  onClick={() => toggleGroup(label)}
                  aria-expanded={isOpen}
                >
                  <span className={`text-xs leading-none transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                    <ChevronRight />
                  </span>
                  <span>{label}</span>
                </button>

                {isOpen ? (
                  <div className="flex flex-col pt-1">
                    {entities.map(({ label: entityLabel, slug, type }) => {
                      const href = formatAdminURL({
                        adminRoute,
                        path: type === EntityType.collection ? `/collections/${slug}` : `/globals/${slug}`,
                      })
                      const isActive = pathname.startsWith(href) && ['/', undefined].includes(pathname[href.length])

                      return (
                        <Link
                          className={isActive ? activeNavLinkClass : navLinkClass}
                          href={href}
                          id={type === EntityType.collection ? `nav-${slug}` : `nav-global-${slug}`}
                          key={`${type}-${slug}`}
                          prefetch={false}
                        >
                          {getTranslation(entityLabel, i18n)}
                        </Link>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>

        <footer className="grid min-h-[100px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-[#d3c2a6]/35 px-[1.125rem] py-4">
          <div className="flex size-11 items-center justify-center rounded-full bg-[#c39a43] text-base font-bold text-white">
            {getUserInitial(name, email)}
          </div>
          <div className="flex min-w-0 flex-col">
            <strong className="truncate text-lg font-bold text-white">{name}</strong>
            <span className="truncate text-sm text-[#aa9a80]">{email}</span>
          </div>
          <Link
            aria-label="Log out"
            className="rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#d4c5ad] no-underline transition-colors hover:text-white"
            href={logoutHref}
            prefetch={false}
            title="Log out"
          >
            <LogOut />
          </Link>
        </footer>

        <div className={`${baseClass}__header`}>
          <div className={`${baseClass}__header-content`}>
            <button
              className={`${baseClass}__mobile-close`}
              onClick={() => setNavOpen(false)}
              tabIndex={!navOpen ? -1 : undefined}
              type="button"
            >
              <Hamburger isActive />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
