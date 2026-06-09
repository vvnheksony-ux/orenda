import type { CollectionConfig } from 'payload'
import { publishedOnly, isAdminOrEditor } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { statusFields } from '../fields/status'

const webhookHooks = createWebhookHooks('doctorSchedules')

export const DoctorSchedules: CollectionConfig = {
  slug: 'doctor-schedules',
  admin: {
    group: 'Hospital',
    useAsTitle: 'label',
    defaultColumns: ['doctor', 'department', 'dayOfWeek', 'startTime', 'endTime', 'active'],
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
      name: 'label',
      type: 'text',
      admin: {
        description: 'Auto-generated label for easy identification in admin panel.',
        readOnly: true,
      },
    },
    {
      name: 'doctor',
      type: 'relationship',
      relationTo: 'doctors',
      required: true,
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
    },
    {
      name: 'dayOfWeek',
      type: 'select',
      required: true,
      options: [
        { label: 'Monday', value: 'monday' },
        { label: 'Tuesday', value: 'tuesday' },
        { label: 'Wednesday', value: 'wednesday' },
        { label: 'Thursday', value: 'thursday' },
        { label: 'Friday', value: 'friday' },
        { label: 'Saturday', value: 'saturday' },
        { label: 'Sunday', value: 'sunday' },
      ],
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Format: HH:mm (24-hour). Example: 08:00',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Format: HH:mm (24-hour). Example: 12:00',
      },
    },
    {
      name: 'appointmentDurationMinutes',
      type: 'number',
      defaultValue: 30,
      min: 5,
      max: 480,
      admin: {
        description: 'Slot duration in minutes for appointment booking.',
      },
    },
    {
      name: 'room',
      type: 'text',
      localized: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    ...statusFields(),
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.doctor && data?.dayOfWeek && data?.startTime && data?.endTime) {
          const doctor = typeof data.doctor === 'object' ? data.doctor : null
          const doctorName = doctor?.name || String(data.doctor)
          data.label = `${doctorName} · ${data.dayOfWeek} ${data.startTime}–${data.endTime}`
        }
        return data
      },
    ],
    afterChange: [webhookHooks.onChange],
    afterDelete: [webhookHooks.onDelete],
  },
}
