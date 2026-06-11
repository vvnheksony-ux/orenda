'use client'

import { useAuth } from '@payloadcms/ui'

function OriendaNavFooter() {
  const { user } = useAuth<Record<string, unknown>>()
  const email = typeof user?.email === 'string' ? user.email : 'admin'
  const name = typeof user?.name === 'string' ? user.name : 'Admin Username'

  return (
    <footer className="orienda-nav-footer">
      <div className="orienda-nav-footer__avatar">A</div>
      <div>
        <strong>{name}</strong>
        <span>{email}</span>
      </div>
    </footer>
  )
}

export default OriendaNavFooter
