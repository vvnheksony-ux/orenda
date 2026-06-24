import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { quillRichTextAdmin } from '../fields/quillRichText'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { createNotificationHook } from '../hooks/notifyOnPublish'

const webhookHooks = createWebhookHooks('news')
const notifyHook = createNotificationHook('news', {
  category: 'news',
  titlePrefix: '📰 ',
  buildPath: (doc) => (doc.slug ? `/news/${doc.slug}` : '/news'),
})

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    group: 'Website Content',
    useAsTitle: 'title',
  },
  versions: {
    maxPerDoc: 20,
    drafts: true,
  },
  access: {
    read: publishedOnly,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    ...slugField(),
    {
      name: 'body',
      type: 'richText',
      admin: quillRichTextAdmin,
      localized: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Additional images shown in the article gallery. Drag to reorder.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'author',
      type: 'text',
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange, notifyHook],
    afterDelete: [webhookHooks.onDelete],
  },
}
