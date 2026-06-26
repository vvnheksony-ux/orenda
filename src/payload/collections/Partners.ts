import type { CollectionConfig } from 'payload'
import { statusFields } from '../fields/status'
import { publishedOnlyFor, createRBACAccess } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { createAuditHooks } from '../hooks/auditTrail'
const webhookHooks = createWebhookHooks('partners')
const auditHooks = createAuditHooks('partners')

export const Partners: CollectionConfig = {
  slug: 'partners',
  admin: {
    group: 'Website Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'order', 'status'],
  },
  versions: {
    maxPerDoc: 20,
    drafts: true,
  },
  access: {
    read: publishedOnlyFor('partners'),
    create: createRBACAccess('partners', 'create'),
    update: createRBACAccess('partners', 'update'),
    delete: createRBACAccess('partners', 'delete'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Optional link to the partner website.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first.',
      },
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange, auditHooks.onChange],
    afterDelete: [webhookHooks.onDelete, auditHooks.onDelete],
  },
}
