import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { baseContentFields, createSearchIndexHooks } from '../content/searchIndex'

const webhookHooks = createWebhookHooks('health-tips')
const indexHooks = createSearchIndexHooks({
  collectionSlug: 'health-tips',
  contentType: 'health-tip',
  canonicalBasePath: '/health-tips',
  getMetadata: (doc) => ({
    healthTipCategory: doc.healthTipCategory,
    readingTime: doc.readingTime,
  }),
})

export const HealthTips: CollectionConfig = {
  slug: 'health-tips',
  admin: {
    group: 'Legacy',
    useAsTitle: 'title',
    defaultColumns: ['title', 'healthTipCategory', 'status', 'publishedAt'],
  },
  versions: {
    maxPerDoc: 20,
    drafts: true,
  },
  access: {
    read: publishedOnly,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    ...baseContentFields(),
    ...slugField('health-tips'),
    {
      name: 'healthTipCategory',
      type: 'select',
      options: [
        { label: 'Nutrition', value: 'nutrition' },
        { label: 'Exercise', value: 'exercise' },
        { label: 'Mental Health', value: 'mentalHealth' },
        { label: 'Preventive Care', value: 'preventiveCare' },
        { label: 'Chronic Disease', value: 'chronicDisease' },
      ],
    },
    {
      name: 'readingTime',
      type: 'number',
      min: 1,
      admin: {
        description: 'Estimated reading time in minutes',
      },
    },
    {
      name: 'healthTipTags',
      type: 'array',
      maxRows: 5,
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange, indexHooks.onChange],
    afterDelete: [webhookHooks.onDelete, indexHooks.onDelete],
  },
}
