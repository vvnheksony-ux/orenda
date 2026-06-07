import { AdminCardPage } from '@/components/admin/AdminManagementPage'

const news = [
  { title: 'Career title', description: 'This is career short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'Career title', description: 'This is career short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'Career title', description: 'This is career short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'Career title', description: 'This is career short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'Career title', description: 'This is career short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
]

export default function CareerPage() {
  return (
    <AdminCardPage
      title="Career"
      breadcrumb="Content > Career"
      searchPlaceholder="Search career..."
      primaryActionLabel="Add Career"
      cards={{
        items: news,
        rowKey: (_item, index) => `news-${index}`,
        actions: [
          { label: 'Preview career', icon: 'view', tone: 'muted' },
          { label: 'Edit career', icon: 'edit', tone: 'blue' },
          { label: 'Delete career', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
