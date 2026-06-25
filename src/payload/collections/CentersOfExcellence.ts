import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { quillRichTextAdmin } from '../fields/quillRichText'
import { publishedOnlyFor, createRBACAccess } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { createAuditHooks } from '../hooks/auditTrail'

const webhookHooks = createWebhookHooks('centers-of-excellence')
const auditHooks = createAuditHooks('centers-of-excellence')

export const CentersOfExcellence: CollectionConfig = {
  slug: 'centers-of-excellence',
  admin: {
    group: 'Hospital',
    useAsTitle: 'title',
  },
  labels: {
    singular: 'Center of Excellence',
    plural: 'Center of Excellence',
  },
  versions: {
    maxPerDoc: 20,
    drafts: true,
  },
  access: {
    read: publishedOnlyFor('centers-of-excellence'),
    create: createRBACAccess('centers-of-excellence', 'create'),
    update: createRBACAccess('centers-of-excellence', 'update'),
    delete: createRBACAccess('centers-of-excellence', 'delete'),
  },
  fields: [
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    ...slugField(),
    {
      name: 'branch',
      type: 'relationship',
      relationTo: 'branches',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      admin: quillRichTextAdmin,
      localized: true,
    },
    {
      name: 'successRate',
      type: 'text',
      admin: { description: 'e.g. "99%"', width: '33%' },
    },
    {
      name: 'surgeries',
      type: 'text',
      admin: { description: 'e.g. "20k"', width: '33%' },
    },
    {
      name: 'satisfactionsRate',
      type: 'text',
      admin: { description: 'e.g. "100%"', width: '33%' },
    },
    {
      name: 'doctors',
      type: 'relationship',
      relationTo: 'doctors',
      hasMany: true,
    },
    {
      // Testimonials live in a Supabase public table (not a Payload collection),
      // so they're referenced by their numeric id.
      name: 'testimonialIds',
      type: 'number',
      hasMany: true,
      label: 'Testimonials (by id)',
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
