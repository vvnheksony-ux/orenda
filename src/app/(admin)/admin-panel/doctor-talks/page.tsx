import { AdminCardPage } from '@/components/admin/AdminManagementPage'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function DoctorTalksPage() {
  let doctorTalks: any[] = []
  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'doctor-talks',
      overrideAccess: true,
      depth: 1,
      sort: '-eventDate',
      limit: 100,
    } as any)
    doctorTalks = data.docs.map((doc: any) => {
      const doctor = typeof doc.featuredDoctor === 'object' ? doc.featuredDoctor : null
      return {
        title: doc.talkTopic ?? '',
        author: doctor?.name ?? '',
        updated: doc.eventDate ?? doc.updatedAt ?? '',
        status: doc._status ?? 'draft',
      }
    })
  } catch {}

  return (
    <AdminCardPage
      title="Doctor Talks"
      breadcrumb="Content > Doctor Talks"
      searchPlaceholder="Search doctor talks..."
      primaryActionLabel="Add Doctor Talk"
      cards={{
        items: doctorTalks,
        rowKey: (_item: any, index: number) => `doctorTalk-${index}`,
        actions: [
          { label: 'Preview doctor talk', icon: 'view', tone: 'muted' },
          { label: 'Edit doctor talk', icon: 'edit', tone: 'blue' },
          { label: 'Delete doctor talk', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
