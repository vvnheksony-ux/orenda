import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'
import { KPI_METRIC_OPTIONS } from '../constants'

export const KpiSnapshots: CollectionConfig = {
  slug: 'kpiSnapshots',
  admin: {
    group: 'Systems',
    hidden: true,
    defaultColumns: ['date', 'metric', 'value', 'locale', 'granularity'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'metric',
      type: 'select',
      required: true,
      options: [...KPI_METRIC_OPTIONS],
    },
    {
      name: 'value',
      type: 'number',
      required: true,
    },
    {
      name: 'locale',
      type: 'text',
    },
    {
      name: 'granularity',
      type: 'select',
      required: true,
      options: [
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
      ],
    },
    {
      name: 'breakdown',
      type: 'json',
    },
  ],
}
