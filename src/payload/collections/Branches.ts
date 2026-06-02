import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'

const webhookHooks = createWebhookHooks('branches')

export const Branches: CollectionConfig = {
  slug: 'branches',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
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
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    ...slugField('branches'),
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'address',
      type: 'text',
      localized: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'mapUrl',
      type: 'text',
      label: 'Google Maps URL',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'hours',
      type: 'text',
      localized: true,
      admin: {
        description: 'e.g. "Open 24 hours" or "8:00 AM - 5:00 PM"',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange],
    afterDelete: [webhookHooks.onDelete],
  },
}
