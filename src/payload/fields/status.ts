import type { Field } from 'payload'
import { CONTENT_STATUS, CONTENT_STATUS_OPTIONS } from '../constants'

export function statusField(): Field {
  return {
    name: 'status',
    type: 'select',
    defaultValue: CONTENT_STATUS.DRAFT,
    options: CONTENT_STATUS_OPTIONS.map(({ label, value }) => ({ label, value })),
    admin: {
      position: 'sidebar',
    },
  }
}

export function publishedAtField(): Field {
  return {
    name: 'publishedAt',
    type: 'date',
    admin: {
      position: 'sidebar',
    },
  }
}

export function statusFields(): Field[] {
  return [statusField(), publishedAtField()]
}
