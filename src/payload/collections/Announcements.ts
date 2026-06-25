import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { publishedOnlyFor, createRBACAccess } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { createNotificationHook } from '../hooks/notifyOnPublish'
import { baseContentFields, createSearchIndexHooks } from '../content/searchIndex'

const webhookHooks = createWebhookHooks('announcements')
const notifyHook = createNotificationHook('announcements', { category: 'announcement', titlePrefix: '📢 ' })
const indexHooks = createSearchIndexHooks({
  collectionSlug: 'announcements',
  contentType: 'announcement',
  canonicalBasePath: '/announcements',
  getMetadata: (doc) => ({
    priority: doc.priority,
    isBanner: doc.isBanner,
  }),
})

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  admin: {
    group: 'Website Content',
    useAsTitle: 'title',
    hidden: true,
    defaultColumns: ['title', 'priority', 'status', 'publishedAt'],
  },
  versions: {
    maxPerDoc: 20,
    drafts: true,
  },
  access: {
    read: publishedOnlyFor('announcements'),
    create: createRBACAccess('announcements', 'create'),
    update: createRBACAccess('announcements', 'update'),
    delete: createRBACAccess('announcements', 'delete'),
  },
  fields: [
    ...baseContentFields(),
    ...slugField(),
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      admin: {
        width: '50%',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'isBanner',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'bannerBackgroundColor',
      type: 'text',
      admin: {
        description: 'Hex color code (e.g. #FF5733)',
      },
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange, indexHooks.onChange, notifyHook],
    afterDelete: [webhookHooks.onDelete, indexHooks.onDelete],
  },
}
