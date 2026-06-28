'use client'

import { getTranslation } from '@payloadcms/translations'
import { Link, useConfig, useNav, usePreferences, useTranslation } from '@payloadcms/ui'
import type { NavGroupType } from '@payloadcms/ui/shared'
import { EntityType } from '@payloadcms/ui/shared'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { formatAdminURL, PREFERENCE_KEYS } from 'payload/shared'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type NavPreferences = {
  groups?: Record<string, { open?: boolean }>
}

type OperationLink = {
  label: string
  path: string
}

type OriendaPayloadNavClientProps = {
  groups: NavGroupType[]
  navPreferences: NavPreferences | null
  user?: { email?: unknown; name?: unknown } | null
  operationLinks?: OperationLink[]
  accessControlLinks?: OperationLink[]
}

const systemLinks = [
  { label: 'Settings', path: '/settings' },
] as const

const aiChatBotLinks = [
  { label: 'Upload File', path: '/ai-chat-bot/upload' },
  { label: 'Price Lists', path: '/ai-chat-bot/price-lists' },
  { label: 'Static Docs', path: '/ai-chat-bot/static-docs' },
] as const

const baseClass = 'nav'
const navLinkClass =
  'flex min-h-10 items-center rounded-xl px-3.5 py-3 text-md text-[#c2b49d] no-underline transition-colors hover:bg-white/[0.08] hover:text-white'
const activeNavLinkClass = `${navLinkClass} bg-[#f7f0e4] font-bold text-black hover:bg-[#f7f0e4] hover:text-[#7d612d]`

const SIDEBAR_SCROLL_KEY = 'orienda-admin-sidebar-scroll'

// Matches /path exactly OR /path/anything — prevents false match on /collections/faq vs /collections/faqs
function isRouteActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}

function getUserInitial(name: string, email: string) {
  return (name || email || 'A').trim().charAt(0).toUpperCase()
}

export default function OriendaPayloadNavClient({
  groups,
  navPreferences,
  user,
  operationLinks = [],
  accessControlLinks = [],
}: OriendaPayloadNavClientProps) {
  const pathname = usePathname()
  const { config } = useConfig()
  const { i18n } = useTranslation()
  const { hydrated, navOpen, navRef, setNavOpen, shouldAnimate } = useNav()

  const allGroups = [...groups]

  // Only inject Operations group if there are operation links to show
  if (operationLinks.length > 0 && !allGroups.some((group) => group.label === 'Operations')) {
    const hospitalIndex = allGroups.findIndex((g) => g.label === 'Hospital')
    if (hospitalIndex >= 0) {
      allGroups.splice(hospitalIndex + 1, 0, { entities: [], label: 'Operations' })
    } else {
      allGroups.push({ entities: [], label: 'Operations' })
    }
  }

  // Only inject Access Control group if there are access control links to show
  if (accessControlLinks.length > 0 && !allGroups.some((group) => group.label === 'Access Control')) {
    allGroups.push({ entities: [], label: 'Access Control' })
  }

  if (!allGroups.some((group) => group.label === 'AI Chat Bot')) {
    allGroups.push({ entities: [], label: 'AI Chat Bot' })
  }
  // Systems always last
  const systemsIdx = allGroups.findIndex((g) => g.label === 'Systems')
  if (systemsIdx >= 0 && systemsIdx !== allGroups.length - 1) {
    const [systems] = allGroups.splice(systemsIdx, 1)
    allGroups.push(systems)
  }

  const { setPreference } = usePreferences()
  const adminRoute = config.routes.admin

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(allGroups.map(({ label }) => [label, navPreferences?.groups?.[label]?.open ?? true]))
  )
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Ref for the inner <nav> which is the actual scrollable element (overflow-y-auto)
  const innerNavRef = useRef<HTMLElement | null>(null)

  // Auto-expand any group whose collection matches the current route
  useEffect(() => {
    const groupsToOpen: string[] = []
    for (const { entities, label } of allGroups) {
      for (const { slug, type } of entities) {
        const href = formatAdminURL({
          adminRoute,
          path: type === EntityType.collection ? `/collections/${slug}` : `/globals/${slug}`,
        })
        if (isRouteActive(pathname, href)) {
          groupsToOpen.push(label)
          break
        }
      }
    }
    if (groupsToOpen.length > 0) {
      setOpenGroups(current => {
        const next = { ...current }
        let changed = false
        for (const lbl of groupsToOpen) {
          if (!next[lbl]) { next[lbl] = true; changed = true }
        }
        return changed ? next : current
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Save scroll position on every scroll event
  useEffect(() => {
    const el = innerNavRef.current
    if (!el) return
    const save = () => sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop))
    el.addEventListener('scroll', save, { passive: true })
    return () => el.removeEventListener('scroll', save)
  }, [])

  // Restore scroll after route changes — useLayoutEffect runs before paint
  useLayoutEffect(() => {
    const el = innerNavRef.current
    if (!el) return
    const saved = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || 0)
    requestAnimationFrame(() => {
      el.scrollTop = saved
      // If active item is outside viewport, scroll it into view without jumping to center
      const active = el.querySelector('[data-nav-active="true"]') as HTMLElement | null
      if (active) {
        const elRect = el.getBoundingClientRect()
        const activeRect = active.getBoundingClientRect()
        const isAbove = activeRect.top < elRect.top
        const isBelow = activeRect.bottom > elRect.bottom
        if (isAbove || isBelow) {
          active.scrollIntoView({ block: 'nearest', behavior: 'auto' })
        }
      }
    })
  }, [pathname])

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
  const dashboardActive = isRouteActive(pathname, dashboardHref)

  const toggleGroup = (label: string) => {
    setOpenGroups((current) => {
      const next = !current[label]
      setPreference(PREFERENCE_KEYS.NAV, { groups: { [label]: { open: next } } }, true)
      return { ...current, [label]: next }
    })
  }

  function renderLink(href: string, label: string, id: string) {
    const active = isRouteActive(pathname, href)
    return (
      <Link
        className={active ? activeNavLinkClass : navLinkClass}
        href={href}
        id={id}
        key={href}
        prefetch={false}
        data-nav-active={active ? 'true' : undefined}
      >
        {label}
      </Link>
    )
  }

  return (
    <>
    <aside className={navClassName} inert={!navOpen ? true : undefined}>
      <div className={`${baseClass}__scroll flex h-screen flex-col overflow-hidden`} ref={navRef}>
        <div className="flex min-h-[106px] flex-col items-center gap-1.5 bg-[#5a431f] text-center">
          <Image
            className="h-auto w-auto object-contain"
            src="/logo.png"
            width={300}
            height={104}
            alt="Orienda Logo"
            priority
          />
          <p className="-mt-5 text-md font-medium text-[#d4c5ad] mb-4.5">Admin Portal</p>
        </div>

        <nav
          className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-5"
          ref={el => { innerNavRef.current = el }}
        >
          <Link
            className={dashboardActive ? activeNavLinkClass : navLinkClass}
            href={dashboardHref}
            prefetch={false}
            data-nav-active={dashboardActive ? 'true' : undefined}
          >
            Dashboard
          </Link>

          {allGroups.map(({ entities, label }) => {
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
                    {label === 'Operations'
                      ? operationLinks.map((link) => {
                          const href = formatAdminURL({ adminRoute, path: link.path as `/${string}` })
                          return renderLink(href, link.label, `nav-public-${link.path.replace(/\//g, '-')}`)
                        })
                      : null}
                    {label === 'Access Control'
                      ? accessControlLinks.map((link) => {
                          const href = formatAdminURL({ adminRoute, path: link.path as `/${string}` })
                          return renderLink(href, link.label, `nav-access-${link.path.replace(/\//g, '-')}`)
                        })
                      : null}
                    {label === 'AI Chat Bot'
                      ? aiChatBotLinks.map((link) => {
                          const href = formatAdminURL({ adminRoute, path: link.path })
                          return renderLink(href, link.label, `nav-ai-chatbot-${link.path.replace(/\//g, '-')}`)
                        })
                      : null}
                    {label === 'Systems'
                      ? systemLinks.map((link) => {
                          const href = formatAdminURL({ adminRoute, path: link.path })
                          return renderLink(href, link.label, `nav-system-${link.path.replace(/\//g, '-')}`)
                        })
                      : null}
                    {entities.map(({ label: entityLabel, slug, type }) => {
                      const href = formatAdminURL({
                        adminRoute,
                        path: type === EntityType.collection ? `/collections/${slug}` : `/globals/${slug}`,
                      })
                      const active = isRouteActive(pathname, href)
                      return (
                        <Link
                          className={active ? activeNavLinkClass : navLinkClass}
                          href={href}
                          id={type === EntityType.collection ? `nav-${slug}` : `nav-global-${slug}`}
                          key={`${type}-${slug}`}
                          prefetch={false}
                          data-nav-active={active ? 'true' : undefined}
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

      </div>
    </aside>
    {mounted && createPortal(
      <button
        type="button"
        onClick={() => setNavOpen(!navOpen)}
        aria-label={navOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        className="orienda-sidebar-toggle"
        style={{ left: navOpen ? 'calc(275px - 14px)' : '8px' }}
      >
        {navOpen
          ? <ChevronLeft size={14} color="#5a431f" strokeWidth={2.5} />
          : <ChevronRight size={14} color="#5a431f" strokeWidth={2.5} />}
      </button>,
      document.body
    )}
    </>
  )
}
