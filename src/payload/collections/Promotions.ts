import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { quillRichTextAdmin } from '../fields/quillRichText'
import { publishedOnlyFor, createRBACAccess } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { createAuditHooks } from '../hooks/auditTrail'
const webhookHooks = createWebhookHooks('promotions')
const auditHooks = createAuditHooks('promotions')

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    group: 'Website Content',
    useAsTitle: 'title',
  },
  versions: {
    maxPerDoc: 20,
    drafts: true,
  },
  access: {
    read: publishedOnlyFor('promotions'),
    create: createRBACAccess('promotions', 'create'),
    update: createRBACAccess('promotions', 'update'),
    delete: createRBACAccess('promotions', 'delete'),
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
      name: 'description',
      type: 'richText',
      admin: quillRichTextAdmin,
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'price',
      type: 'text',
      admin: {
        description: 'Current / sale price, e.g. "$25.00" — shown bold in the price pill.',
      },
    },
    {
      name: 'originalPrice',
      type: 'text',
      admin: {
        description: 'Original price, e.g. "$50.00" — shown struck-through next to the price (optional).',
      },
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
    afterChange: [webhookHooks.onChange, auditHooks.onChange],
    afterDelete: [webhookHooks.onDelete, auditHooks.onDelete],
  },
}
