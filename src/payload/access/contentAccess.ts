import type { Access, AccessArgs, Where } from 'payload'
import { CONTENT_STATUS } from '../constants'

function publishedOnlyWhere(now: string): Where {
  return {
    and: [
      { status: { equals: CONTENT_STATUS.PUBLISHED } },
      {
        or: [
          { publishedAt: { exists: false } },
          { publishedAt: { less_than_equal: now } },
        ],
      },
    ],
  } as Where
}

export const publishedOnly: Access = ({ req }: AccessArgs) => {
  const user = req.user as { role?: string } | null
  if (user?.role === 'admin' || user?.role === 'editor') return true
  return publishedOnlyWhere(new Date().toISOString())
}
