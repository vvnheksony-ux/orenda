import type { CollectionConfig } from 'payload'
import { statusFields } from '../fields/status'
import { quillRichTextAdmin } from '../fields/quillRichText'
import { publishedOnlyFor, createRBACAccess } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { createAuditHooks } from '../hooks/auditTrail'
const webhookHooks = createWebhookHooks('faqs')
const auditHooks = createAuditHooks('faqs')

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    group: 'Website Content',
    useAsTitle: 'question',
  },
  versions: {
    maxPerDoc: 20,
    drafts: true,
  },
  access: {
    read: publishedOnlyFor('faqs'),
    create: createRBACAccess('faqs', 'create'),
    update: createRBACAccess('faqs', 'update'),
    delete: createRBACAccess('faqs', 'delete'),
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'answer',
      type: 'richText',
      admin: quillRichTextAdmin,
      required: true,
      localized: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Appointments', value: 'appointments' },
        { label: 'Services', value: 'services' },
        { label: 'Insurance', value: 'insurance' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange, auditHooks.onChange],
    afterDelete: [webhookHooks.onDelete, auditHooks.onDelete],
  },
}
