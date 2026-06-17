import { AdminCardPage } from '@/components/admin/AdminManagementPage'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function InsurancePage() {
  let items: any[] = []
  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'insurance-updates',
      overrideAccess: true,
      depth: 0,
      sort: '-updatedAt',
      limit: 100,
    } as any)
    items = data.docs.map((doc: any) => ({
      title: doc.title ?? doc.insuranceProvider ?? '',
      description: doc.insuranceProvider ?? '',
      author: doc.author ?? '',
      updated: doc.updatedAt ?? '',
      status: doc._status ?? 'draft',
    }))
  } catch {}

  return (
    <AdminCardPage
      title="Insurance"
      breadcrumb="Content > Insurance"
      searchPlaceholder="Search insurance..."
      primaryActionLabel="Add Insurance"
      cards={{
        items,
        rowKey: (_item: any, index: number) => `insurance-${index}`,
        actions: [
          { label: 'Preview insurance', icon: 'view', tone: 'muted' },
          { label: 'Edit insurance', icon: 'edit', tone: 'blue' },
          { label: 'Delete insurance', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
