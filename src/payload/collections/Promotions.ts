import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
const webhookHooks = createWebhookHooks('promotions')

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
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
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    ...slugField('promotions'),
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'validFrom',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'validTo',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange],
    afterDelete: [webhookHooks.onDelete],
  },
}
