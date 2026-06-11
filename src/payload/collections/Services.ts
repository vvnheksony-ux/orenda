import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { quillRichTextAdmin } from '../fields/quillRichText'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
const webhookHooks = createWebhookHooks('services')

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    group: 'Hospital',
    useAsTitle: 'title',
    hidden: true,
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
    ...slugField('services'),
    {
      name: 'description',
      type: 'richText',
      admin: quillRichTextAdmin,
      localized: true,
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange],
    afterDelete: [webhookHooks.onDelete],
  },
}
