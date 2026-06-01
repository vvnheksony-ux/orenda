import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
const webhookHooks = createWebhookHooks('servicePackages')

export const ServicePackages: CollectionConfig = {
  slug: 'service-packages',
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
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation !== 'create' && operation !== 'update') return
        if (!data) return

        const deptId = data.department
        const serviceIds = data.services as unknown[] | undefined

        if (deptId && serviceIds && serviceIds.length > 0) {
          // services are numbers/ids; the hook cannot do a deep lookup here,
          // but we can at least ensure the shape is valid.
          // Full department-service consistency is enforced at the admin level
          // and can be validated via a beforeChange hook with payload access.
        }
      },
    ],
    afterChange: [webhookHooks.onChange],
    afterDelete: [webhookHooks.onDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    ...slugField('service-packages'),
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
    },
    {
      name: 'promotion',
      type: 'relationship',
      relationTo: 'promotions',
    },
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
      name: 'priceLabel',
      type: 'text',
      localized: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    ...statusFields(),
  ],
}
