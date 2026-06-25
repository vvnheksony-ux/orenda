import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { publishedOnlyFor, createRBACAccess } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { baseContentFields, createSearchIndexHooks } from '../content/searchIndex'

const webhookHooks = createWebhookHooks('doctor-talks')
const indexHooks = createSearchIndexHooks({
  collectionSlug: 'doctor-talks',
  contentType: 'doctor-talk',
  canonicalBasePath: '/doctor-talks',
  getMetadata: (doc) => ({
    featuredDoctor: doc.featuredDoctor,
    eventDate: doc.eventDate,
    isVirtual: doc.isVirtual,
  }),
})

export const DoctorTalks: CollectionConfig = {
  slug: 'doctor-talks',
  admin: {
    group: 'Website Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'featuredDoctor', 'eventDate', 'status'],
  },
  versions: {
    maxPerDoc: 20,
    drafts: true,
  },
  access: {
    read: publishedOnlyFor('doctor-talks'),
    create: createRBACAccess('doctor-talks', 'create'),
    update: createRBACAccess('doctor-talks', 'update'),
    delete: createRBACAccess('doctor-talks', 'delete'),
  },
  fields: [
    ...baseContentFields(),
    ...slugField(),
    {
      name: 'featuredDoctor',
      type: 'relationship',
      relationTo: 'doctors',
      required: true,
    },
    {
      name: 'talkTopic',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'eventDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'eventTime',
      type: 'text',
      admin: {
        description: 'Time of the talk (e.g. 14:00 - 16:00)',
      },
    },
    {
      name: 'duration',
      type: 'number',
      min: 15,
      max: 480,
      admin: {
        description: 'Duration in minutes',
      },
    },
    {
      name: 'isVirtual',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'meetingLink',
      type: 'text',
    },
    {
      name: 'maxAttendees',
      type: 'number',
      min: 1,
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange, indexHooks.onChange],
    afterDelete: [webhookHooks.onDelete, indexHooks.onDelete],
  },
}
