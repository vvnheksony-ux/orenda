import { AdminTablePage } from '@/components/admin/AdminManagementPage'
import { getPayloadClient } from '@/lib/payload'

export default async function DoctorsPage() {
  let doctors: any[] = []
  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'doctors',
      overrideAccess: true,
      depth: 1,
      sort: 'order',
      limit: 200,
    } as any)
    doctors = data.docs.map((doc: any) => ({
      name: doc.name ?? '',
      specialty: doc.specialty ?? '',
      clinic: typeof doc.department === 'object' ? (doc.department?.name ?? '') : '',
      email: doc.email ?? '-',
      phone: doc.phone ?? '-',
      status: doc._status ?? 'published',
    }))
  } catch {}

  return (
    <AdminTablePage
      title="Doctors"
      breadcrumb="Hospital > Doctors"
      searchPlaceholder="Search doctors..."
      primaryActionLabel="Add Doctor"
      table={{
        rows: doctors,
        rowKey: (_row: any, index: number) => `doctor-${index}`,
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'specialty', label: 'Specialty' },
          { key: 'clinic', label: 'Clinic' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'actions', label: 'Actions', kind: 'actions' },
        ],
        actions: [
          { label: 'Edit doctor', icon: 'edit', tone: 'muted' },
          { label: 'Delete doctor', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
