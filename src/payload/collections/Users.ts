import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'contributor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Contributor', value: 'contributor' },
      ],
      access: {
        update: ({ req }) => {
          const user = req.user as Record<string, unknown> | null
          if (!user) return false
          return user.role === 'admin'
        },
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  access: {
    admin: ({ req }) => {
      if (!req.user) return false
      const user = req.user as Record<string, unknown>
      return user.role === 'admin'
    },
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
}
