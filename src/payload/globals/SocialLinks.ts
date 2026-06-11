import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access'

export const SocialLinks: GlobalConfig = {
  slug: 'socialLinks',
  admin: {
    hidden: true,
    group: 'Systems',
  },
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'facebook',
      type: 'text',
    },
    {
      name: 'instagram',
      type: 'text',
    },
    {
      name: 'youtube',
      type: 'text',
    },
    {
      name: 'tiktok',
      type: 'text',
    },
  ],
}
