import { AdminCardPage } from '@/components/admin/AdminManagementPage'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function CareerPage() {
  let careers: any[] = []
  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'careers',
      overrideAccess: true,
      depth: 1,
      sort: '-applicationDeadline',
      limit: 100,
    } as any)
    careers = data.docs.map((doc: any) => {
      const dept = typeof doc.careerDepartment === 'object' ? doc.careerDepartment : null
      return {
        title: doc.position ?? '',
        description: dept?.name ?? doc.careerEmploymentType ?? '',
        author: doc.applicationDeadline ?? '',
        updated: doc.updatedAt ?? '',
        status: doc._status ?? 'draft',
      }
    })
  } catch {}

  return (
    <AdminCardPage
      title="Career"
      breadcrumb="Content > Career"
      searchPlaceholder="Search career..."
      primaryActionLabel="Add Career"
      cards={{
        items: careers,
        rowKey: (_item: any, index: number) => `career-${index}`,
        actions: [
          { label: 'Preview career', icon: 'view', tone: 'muted' },
          { label: 'Edit career', icon: 'edit', tone: 'blue' },
          { label: 'Delete career', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
