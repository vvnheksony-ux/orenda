import { AdminTablePage } from '@/components/admin/AdminManagementPage'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function AnnouncementsPage() {
  let announcements: any[] = []
  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'announcements',
      overrideAccess: true,
      depth: 0,
      sort: '-startDate',
      limit: 100,
    } as any)
    announcements = data.docs.map((doc: any) => ({
      title: doc.title ?? '',
      priority: doc.priority ?? 'normal',
      startDate: doc.startDate ? doc.startDate.slice(0, 10) : '',
      endDate: doc.endDate ? doc.endDate.slice(0, 10) : '',
      banner: doc.isBanner ? 'Yes' : 'No',
      status: doc._status ?? 'draft',
    }))
  } catch {}

  return (
    <AdminTablePage
      title="Announcements"
      breadcrumb="Content > Announcements"
      searchPlaceholder="Search announcements..."
      primaryActionLabel="Add Announcement"
      table={{
        rows: announcements,
        rowKey: (_row: any, index: number) => `ann-${index}`,
        columns: [
          { key: 'title', label: 'Title' },
          { key: 'priority', label: 'Priority' },
          { key: 'startDate', label: 'Start Date' },
          { key: 'endDate', label: 'End Date' },
          { key: 'banner', label: 'Banner' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'actions', label: 'Actions', kind: 'actions' },
        ],
        actions: [
          { label: 'Edit announcement', icon: 'edit', tone: 'muted' },
          { label: 'Delete announcement', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
