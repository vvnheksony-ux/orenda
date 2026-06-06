'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'

function OriendaAdminHeader() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const title = getTitle(segments)
  const subPage = getSubPage(segments)

  return (
    <header className="orienda-admin-header">
      <div>
        <h1>{title}</h1>
        <nav aria-label="Breadcrumb" className="orienda-admin-header__breadcrumb">
          <span>{title}</span>
          <span aria-hidden>→</span>
          <span>{title}</span>
          {subPage ? (
            <>
              <span aria-hidden>→</span>
              <span>{subPage}</span>
            </>
          ) : null}
        </nav>
      </div>
      <div className="orienda-admin-header__actions">
        <button aria-label="Notifications" type="button">
          <Bell aria-hidden size={18} />
        </button>
        <div aria-label="Current user" className="orienda-admin-header__avatar">A</div>
      </div>
    </header>
  )
}

function getTitle(segments: string[]) {
  const collectionsIndex = segments.indexOf('collections')
  const globalsIndex = segments.indexOf('globals')
  const slug = collectionsIndex >= 0 ? segments[collectionsIndex + 1] : globalsIndex >= 0 ? segments[globalsIndex + 1] : undefined

  if (!slug) return 'Analytics Dashboard'

  return titleCase(slug)
}

function getSubPage(segments: string[]) {
  if (segments.includes('create')) return 'Create New'
  if (segments.includes('trash')) return 'Trash'
  if (segments.includes('versions')) return 'Versions'
  if (segments.includes('globals')) return 'Settings'
  if (segments.includes('collections') && segments.length > segments.indexOf('collections') + 2) return 'Detail'
  return ''
}

function titleCase(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default OriendaAdminHeader
