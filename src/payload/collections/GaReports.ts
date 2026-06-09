import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'

export const GaReports: CollectionConfig = {
  slug: 'gaReports',
  admin: {
    group: 'Analytics',
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
        { label: 'Page Views', value: 'page_views' },
        { label: 'Traffic Sources', value: 'traffic_sources' },
        { label: 'User Demographics', value: 'user_demographics' },
        { label: 'Device Breakdown', value: 'device_breakdown' },
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
