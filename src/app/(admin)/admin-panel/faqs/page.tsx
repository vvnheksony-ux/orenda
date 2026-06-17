import { AdminTablePage } from '@/components/admin/AdminManagementPage'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function FAQsPage() {
  let faqs: any[] = []
  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'faqs',
      overrideAccess: true,
      depth: 0,
      sort: 'order',
      limit: 200,
    } as any)
    faqs = data.docs.map((doc: any) => ({
      question: doc.question ?? '',
      category: doc.category ?? '',
      status: doc._status ?? 'published',
    }))
  } catch {}

  return (
    <AdminTablePage
      title="FAQs"
      breadcrumb="Operations & Sales > FAQs"
      searchPlaceholder="Search FAQs..."
      primaryActionLabel="New FAQ"
      table={{
        rows: faqs,
        rowKey: (_row: any, index: number) => `faq-${index}`,
        columns: [
          { key: 'question', label: 'Question' },
          { key: 'category', label: 'Category' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'actions', label: 'Actions', kind: 'actions' },
        ],
        actions: [
          { label: 'Edit FAQ', icon: 'edit', tone: 'muted' },
          { label: 'Delete FAQ', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
