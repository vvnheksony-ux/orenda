import type { CollectionConfig } from 'payload'
import { createRBACAccess } from '../access'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    group: 'Operations',
    hidden: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'status', 'createdAt'],
  },
  access: {
    read: createRBACAccess('inquiries', 'read'),
    create: () => false,
    update: createRBACAccess('inquiries', 'update'),
    delete: createRBACAccess('inquiries', 'delete'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Resolved', value: 'resolved' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'resolvedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.status === 'resolved',
      },
    },
    {
      name: 'staffNotes',
      type: 'textarea',
    },
  ],
}
