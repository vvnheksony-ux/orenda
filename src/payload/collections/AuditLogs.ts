import type { CollectionConfig } from 'payload'
import { createRBACAccess } from '../access'

export const AuditLogs: CollectionConfig = {
  slug: 'auditLogs',
  admin: {
    group: 'Systems',
    defaultColumns: ['action', 'collectionSlug', 'documentTitle', 'userName', 'timestamp'],
  },
  access: {
    read: createRBACAccess('auditLogs', 'read'),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Created', value: 'created' },
        { label: 'Updated', value: 'updated' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
        { label: 'Deleted', value: 'deleted' },
      ],
    },
    {
      name: 'collectionSlug',
      type: 'text',
      required: true,
    },
    {
      name: 'documentId',
      type: 'text',
      required: true,
    },
    {
      name: 'documentTitle',
      type: 'text',
    },
    {
      name: 'userId',
      type: 'text',
    },
    {
      name: 'userName',
      type: 'text',
    },
    {
      name: 'userRole',
      type: 'text',
    },
    {
      name: 'changedFields',
      type: 'json',
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
