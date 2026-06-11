import type { CollectionConfig } from 'payload'
import { statusFields } from '../fields/status'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { createAuditHooks } from '../hooks/auditTrail'
const webhookHooks = createWebhookHooks('tourScenes')
const auditHooks = createAuditHooks('tourScenes')

export const TourScenes: CollectionConfig = {
  slug: 'tourScenes',
  admin: {
    group: 'Website Content',
    useAsTitle: 'title',
  },
  access: {
    read: publishedOnly,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'sceneNumber',
      type: 'number',
      required: true,
      min: 1,
      max: 15,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'branch',
      type: 'relationship',
      relationTo: 'branches',
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'thumbnailImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'hotspots',
      type: 'array',
      fields: [
        {
          name: 'pitch',
          type: 'number',
          required: true,
        },
        {
          name: 'yaw',
          type: 'number',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange, auditHooks.onChange],
    afterDelete: [webhookHooks.onDelete, auditHooks.onDelete],
  },
}
