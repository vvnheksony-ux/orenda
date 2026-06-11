import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'
import { ANALYTICS_EVENT_OPTIONS } from '../constants'

export const AnalyticsEvents: CollectionConfig = {
  slug: 'analyticsEvents',
  admin: {
    group: 'Systems',
    hidden: true,
    defaultColumns: ['event', 'slug', 'locale', 'timestamp'],
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'event',
      type: 'select',
      required: true,
      options: [...ANALYTICS_EVENT_OPTIONS],
    },
    {
      name: 'slug',
      type: 'text',
    },
    {
      name: 'locale',
      type: 'text',
    },
    {
      name: 'scene',
      type: 'number',
      min: 1,
      max: 15,
    },
    {
      name: 'sessionId',
      type: 'text',
    },
    {
      name: 'ipHash',
      type: 'text',
    },
    {
      name: 'referrer',
      type: 'text',
    },
    {
      name: 'userAgent',
      type: 'textarea',
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
