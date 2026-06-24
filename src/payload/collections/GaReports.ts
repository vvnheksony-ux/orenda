import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'

export const GaReports: CollectionConfig = {
  slug: 'gaReports',
  admin: {
    group: 'Systems',
    hidden: true,
    defaultColumns: ['reportType', 'dateRange', 'fetchedAt'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'reportType',
      type: 'select',
      required: true,
      options: [
        { label: 'Overview', value: 'overview' },
        { label: 'Top Pages', value: 'top_pages' },
        { label: 'Devices', value: 'devices' },
        { label: 'Geography', value: 'geo' },
      ],
    },
    {
      name: 'dateRange',
      type: 'group',
      fields: [
        {
          name: 'start',
          type: 'date',
          required: true,
        },
        {
          name: 'end',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'data',
      type: 'json',
      required: true,
    },
    {
      name: 'fetchedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
