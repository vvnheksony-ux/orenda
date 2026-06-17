import { AdminCardPage } from '@/components/admin/AdminManagementPage'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function HealthPage() {
  let tips: any[] = []
  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'health-tips',
      overrideAccess: true,
      depth: 0,
      sort: '-updatedAt',
      limit: 100,
    } as any)
    tips = data.docs.map((doc: any) => ({
      title: doc.title ?? '',
      description: doc.excerpt ?? '',
      author: doc.author ?? '',
      updated: doc.updatedAt ?? '',
      status: doc._status ?? 'draft',
    }))
  } catch {}

  return (
    <AdminCardPage
      title="Health Tips"
      breadcrumb="Content > Health Tips"
      searchPlaceholder="Search health tips..."
      primaryActionLabel="Add Health Tip"
      cards={{
        items: tips,
        rowKey: (_item: any, index: number) => `tip-${index}`,
        actions: [
          { label: 'Preview health tip', icon: 'view', tone: 'muted' },
          { label: 'Edit health tip', icon: 'edit', tone: 'blue' },
          { label: 'Delete health tip', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
