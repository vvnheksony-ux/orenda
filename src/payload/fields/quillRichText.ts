import type { RichTextField } from 'payload'

export const quillRichTextAdmin: NonNullable<RichTextField['admin']> = {
  components: {
    Field: '@/payload/admin/components/QuillRichTextField',
  },
}
