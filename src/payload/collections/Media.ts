import type { CollectionConfig } from 'payload'
import { publicRead, createRBACAccess } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Website Content',
    hidden: true,
  },
  access: {
    read: publicRead,
    create: createRBACAccess('media', 'create'),
    update: createRBACAccess('media', 'update'),
    delete: createRBACAccess('media', 'delete'),
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
      },
      {
        name: 'card',
        width: 800,
      },
      {
        name: 'hero',
        width: 1600,
      },
      {
        name: 'og',
        width: 1200,
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
  ],
}
