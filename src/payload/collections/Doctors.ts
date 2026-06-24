import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { statusFields } from '../fields/status'
import { quillRichTextAdmin } from '../fields/quillRichText'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { createAuditHooks } from '../hooks/auditTrail'
const webhookHooks = createWebhookHooks('doctors')
const auditHooks = createAuditHooks('doctors')

export const Doctors: CollectionConfig = {
  slug: 'doctors',
  admin: {
    group: 'Hospital',
    useAsTitle: 'name',
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
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    ...slugField(),
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'richText',
      admin: quillRichTextAdmin,
      localized: true,
    },
    {
      name: 'specialty',
      type: 'text',
      localized: true,
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      admin: {
        description: 'DEPRECATED: Use doctor-schedules to assign doctors to departments with recurring weekly shifts.',
        position: 'sidebar',
      },
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'doctorNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: '6–8 digit doctor number (e.g. 00123456).',
      },
      validate: (val: string | null | undefined) => {
        if (typeof val !== 'string' || !/^\d{6,8}$/.test(val)) {
          return 'Doctor number must be 6–8 digits.'
        }
        return true
      },
    },
    {
      name: 'sex',
      type: 'select',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
        { label: 'Prefer not to say', value: 'prefer_not_to_say' },
      ],
    },
    {
      name: 'nationality',
      type: 'text',
    },
    {
      name: 'positionTitle',
      type: 'text',
    },
    {
      name: 'employmentStartDate',
      type: 'date',
    },
    {
      name: 'employmentType',
      type: 'select',
      options: [
        { label: 'Full-time', value: 'full_time' },
        { label: 'Part-time', value: 'part_time' },
        { label: 'Visiting', value: 'visiting' },
        { label: 'Contract', value: 'contract' },
      ],
    },
    {
      name: 'totalClinicalExperienceYears',
      type: 'number',
      min: 0,
    },
    {
      name: 'specialistExperienceYears',
      type: 'number',
      min: 0,
    },
    {
      name: 'languages',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'education',
      type: 'array',
      fields: [
        {
          name: 'description',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      // Doctor availability, shown right on the doctor edit page. This is a
      // virtual join into the doctor-schedules collection (no DB column / no
      // migration) — adding a shift here pre-fills this doctor automatically.
      name: 'availability',
      type: 'join',
      collection: 'doctor-schedules',
      on: 'doctor',
      admin: {
        defaultColumns: ['dayOfWeek', 'startTime', 'endTime', 'department', 'active'],
        description:
          'Weekly availability shifts for this doctor (day, start/end time, department, room). Add or edit shifts here — these power appointment booking.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange, auditHooks.onChange],
    afterDelete: [webhookHooks.onDelete, auditHooks.onDelete],
  },
}
