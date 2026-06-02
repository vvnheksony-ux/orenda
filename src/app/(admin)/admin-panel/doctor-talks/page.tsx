import { AdminCardPage } from '@/components/admin/AdminManagementPage'

const doctorTalks = [
  { title: 'Doctor Talk title', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'Doctor Talk title', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'Doctor Talk title', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'Doctor Talk title', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'Doctor Talk title', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
]

export default function DoctorTalksPage() {
  return (
    <AdminCardPage
      title="Doctor Talks"
      breadcrumb="Content > Doctor Talks"
      searchPlaceholder="Search doctor talks..."
      primaryActionLabel="Add Doctor Talk"
      cards={{
        items: doctorTalks,
        rowKey: (_item, index) => `doctorTalk-${index}`,
        actions: [
          { label: 'Preview doctor talk', icon: 'view', tone: 'muted' },
          { label: 'Edit doctor talk', icon: 'edit', tone: 'blue' },
          { label: 'Delete doctor talk', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
