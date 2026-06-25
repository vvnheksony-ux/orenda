import type { CollectionConfig } from 'payload'
import { getSuperAdminAccess } from '@zealamic/payload-plugin-rbac'
import { hasAnyMatrixPermission } from '../access/rbacAccess'
import { createAuditHooks } from '../hooks/auditTrail'
const auditHooks = createAuditHooks('users')

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    group: 'Access Control',
    useAsTitle: 'email',
    components: {
      views: {
        list: {
          Component: '@/payload/admin/components/users/UsersListView',
        },
      },
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
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
    admin: async ({ req }) => hasAnyMatrixPermission(req),
    read: getSuperAdminAccess,
    create: getSuperAdminAccess,
    update: getSuperAdminAccess,
    delete: getSuperAdminAccess,
  },
  hooks: {
    afterChange: [auditHooks.onChange],
    afterDelete: [auditHooks.onDelete],
  },
}
