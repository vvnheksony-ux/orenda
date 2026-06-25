import type { AnalyticsEventValue, ContentStatus, LocaleCode } from './constants'

export interface PayloadUser {
  id: string
  email: string
  name?: string
  isSuperAdmin?: boolean
  roles?: Array<{ id: string; code?: string; name?: string }> | string[]
  /** @deprecated Legacy role field — use isSuperAdmin + roles relationship */
  role?: string
}

export interface InquiryFormBody {
  name: string
  phone?: string
  email: string
  message: string
}

export interface AnalyticsEventBody {
  event: AnalyticsEventValue
  slug?: string
  locale: LocaleCode
  scene?: number
  sessionId?: string
  ipHash?: string
  referrer?: string
  userAgent?: string
}

export interface WebhookTarget {
  url: string
}

export interface WebhookDocument {
  id: string | number
  status?: ContentStatus
  publishedAt?: string
  slug?: string
  locale?: string
  [key: string]: unknown
}
