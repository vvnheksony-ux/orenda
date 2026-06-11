import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'

export const ContentSearchIndex: CollectionConfig = {
  slug: 'content-search-index',
  admin: {
    group: 'System',
    useAsTitle: 'title',
    hidden: true,
    defaultColumns: ['title', 'contentType', 'locale', 'sourceCollection'],
  },
  access: {
    read: isAdminOrEditor,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'sourceCollection', type: 'text', required: true },
    { name: 'sourceId', type: 'text', required: true },
    { name: 'contentType', type: 'text', required: true },
    { name: 'locale', type: 'text', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'canonicalPath', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'bodyText', type: 'textarea' },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'status', type: 'text' },
    { name: 'publishedAt', type: 'date' },
    { name: 'metadata', type: 'json' },
  ],
}
