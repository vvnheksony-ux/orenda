import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'

const webhookHooks = createWebhookHooks('news')

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    group: 'Legacy',
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
    ...slugField(),
    {
      name: 'body',
      type: 'richText',
      localized: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'author',
      type: 'text',
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange],
    afterDelete: [webhookHooks.onDelete],
  },
}
