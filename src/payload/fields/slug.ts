import type { Field, TextField } from 'payload'

export const slugField = (): Field[] => [
  {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
    },
    hooks: {
      beforeValidate: [
        ({ data, value }) => {
          if (value) return value
          const title =
            data?.title || data?.name || data?.question || ''
          return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim() || undefined
        },
      ],
    },
  } as TextField,
]
