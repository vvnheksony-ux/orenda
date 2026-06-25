import type { GlobalConfig } from 'payload'
import { createRBACAccess } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  admin: {
    hidden: true,
    group: 'Systems',
  },
  access: {
    read: () => true,
    update: createRBACAccess('siteSettings', 'update'),
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'siteName',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
    },
    {
      name: 'emergencyCTAText',
      type: 'text',
      localized: true,
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'contactPhone',
      type: 'text',
    },
  ],
}
