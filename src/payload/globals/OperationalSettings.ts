import type { GlobalConfig } from 'payload'
import { createRBACAccess } from '../access'

export const OperationalSettings: GlobalConfig = {
  slug: 'operationalSettings',
  admin: {
    hidden: true,
    group: 'Systems',
  },
  access: {
    read: createRBACAccess('operationalSettings', 'read'),
    update: createRBACAccess('operationalSettings', 'update'),
  },
  fields: [
    {
      name: 'analyticsReportRecipients',
      type: 'array',
      fields: [
        {
          name: 'email',
          type: 'email',
        },
      ],
    },
    {
      name: 'webhookTargets',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
