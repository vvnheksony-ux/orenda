import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
const webhookHooks = createWebhookHooks('departments')

export const Departments: CollectionConfig = {
  slug: 'departments',
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
    ...slugField(),
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'doctors',
      type: 'relationship',
      relationTo: 'doctors',
      hasMany: true,
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange],
    afterDelete: [webhookHooks.onDelete],
  },
}
