import { AdminCardPage } from '@/components/admin/AdminManagementPage'

const news = [
  { title: 'Health Tip title', description: 'This is health tip short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'Health Tip title', description: 'This is health tip short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'Health Tip title', description: 'This is health tip short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'Health Tip title', description: 'This is health tip short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'Health Tip title', description: 'This is health tip short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
]

export default function HealthPage() {
  return (
    <AdminCardPage
      title="Health Tips"
      breadcrumb="Content > Health Tips"
      searchPlaceholder="Search health tips..."
      primaryActionLabel="Add Health Tip"
      cards={{
        items: news,
        rowKey: (_item, index) => `news-${index}`,
        actions: [
          { label: 'Preview health tip', icon: 'view', tone: 'muted' },
          { label: 'Edit health tip', icon: 'edit', tone: 'blue' },
          { label: 'Delete health tip', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
