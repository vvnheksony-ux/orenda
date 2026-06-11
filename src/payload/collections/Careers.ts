import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { baseContentFields, createSearchIndexHooks } from '../content/searchIndex'

const webhookHooks = createWebhookHooks('careers')
const indexHooks = createSearchIndexHooks({
  collectionSlug: 'careers',
  contentType: 'career',
  canonicalBasePath: '/careers',
  getMetadata: (doc) => ({
    department: doc.careerDepartment,
    location: doc.careerLocation,
    employmentType: doc.careerEmploymentType,
    experienceLevel: doc.experienceLevel,
  }),
})

export const Careers: CollectionConfig = {
  slug: 'careers',
  admin: {
    group: 'Website Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'position', 'careerEmploymentType', 'status'],
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
    ...baseContentFields(),
    ...slugField('careers'),
    {
      name: 'position',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'careerDepartment',
      type: 'relationship',
      relationTo: 'departments',
    },
    {
      name: 'careerLocation',
      type: 'relationship',
      relationTo: 'branches',
    },
    {
      name: 'careerEmploymentType',
      type: 'select',
      options: [
        { label: 'Full-time', value: 'full_time' },
        { label: 'Part-time', value: 'part_time' },
        { label: 'Contract', value: 'contract' },
        { label: 'Visiting', value: 'visiting' },
      ],
      admin: { width: '50%' },
    },
    {
      name: 'experienceLevel',
      type: 'select',
      options: [
        { label: 'Entry Level', value: 'entry' },
        { label: 'Mid Level', value: 'mid' },
        { label: 'Senior Level', value: 'senior' },
      ],
      admin: { width: '50%' },
    },
    {
      name: 'salaryRange',
      type: 'text',
      localized: true,
    },
    {
      name: 'applicationDeadline',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'careerRequirements',
      type: 'richText',
      localized: true,
    },
    {
      name: 'responsibilities',
      type: 'richText',
      localized: true,
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange, indexHooks.onChange],
    afterDelete: [webhookHooks.onDelete, indexHooks.onDelete],
  },
}
