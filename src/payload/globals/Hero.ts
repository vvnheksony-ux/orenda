import type { GlobalConfig } from 'payload'
import { createRBACAccess } from '../access'

export const Hero: GlobalConfig = {
  slug: 'hero',
  admin: {
    group: 'Website Content',
  },
  access: {
    read: () => true,
    update: createRBACAccess('hero', 'update'),
  },
  fields: [
    {
      name: 'backgroundType',
      type: 'select',
      defaultValue: 'video',
      options: [
        { label: 'Video', value: 'video' },
        { label: 'Image', value: 'image' },
      ],
      admin: {
        description: 'Choose whether the homepage hero shows a background video or a still image.',
      },
    },
    {
      name: 'backgroundVideo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Background video (used when type is Video). Leave empty to keep the default.',
        condition: (data) => data?.backgroundType !== 'image',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Background image (used when type is Image, or as the video poster).',
      },
    },
    {
      name: 'testimonialName',
      type: 'text',
      localized: true,
    },
    {
      name: 'testimonialRole',
      type: 'text',
      localized: true,
    },
    {
      name: 'testimonialQuote',
      type: 'text',
      localized: true,
    },
  ],
}
