import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { baseContentFields, createSearchIndexHooks } from '../content/searchIndex'

const webhookHooks = createWebhookHooks('insurance-updates')
const indexHooks = createSearchIndexHooks({
  collectionSlug: 'insurance-updates',
  contentType: 'insurance-update',
  canonicalBasePath: '/insurance-updates',
  getMetadata: (doc) => ({
    effectiveDate: doc.effectiveDate,
    expirationDate: doc.expirationDate,
  }),
})

export const InsuranceUpdates: CollectionConfig = {
  slug: 'insurance-updates',
  admin: {
    group: 'Legacy',
    useAsTitle: 'title',
    defaultColumns: ['title', 'effectiveDate', 'expirationDate', 'status'],
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
    ...baseContentFields(),
    ...slugField('insurance-updates'),
    {
      name: 'insurancePlanTypes',
      type: 'array',
      fields: [
        {
          name: 'planType',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'coverageDetails',
      type: 'richText',
      localized: true,
    },
    {
      name: 'insuranceContactPerson',
      type: 'text',
    },
    {
      name: 'insuranceContactPhone',
      type: 'text',
    },
    {
      name: 'insuranceContactEmail',
      type: 'email',
    },
    {
      name: 'effectiveDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'expirationDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'requiredDocuments',
      type: 'array',
      fields: [
        {
          name: 'document',
          type: 'text',
          required: true,
        },
      ],
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange, indexHooks.onChange],
    afterDelete: [webhookHooks.onDelete, indexHooks.onDelete],
  },
}
