import { AdminCardPage } from '@/components/admin/AdminManagementPage'

const news = [
  { title: 'News title', description: 'This is news short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'News title', description: 'This is news short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'News title', description: 'This is news short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'News title', description: 'This is news short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'News title', description: 'This is news short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
]

export default function NewsPage() {
  return (
    <AdminCardPage
      title="News"
      breadcrumb="Content > News"
      searchPlaceholder="Search news..."
      primaryActionLabel="Add News"
      cards={{
        items: news,
        rowKey: (_item, index) => `news-${index}`,
        actions: [
          { label: 'Preview news', icon: 'view', tone: 'muted' },
          { label: 'Edit news', icon: 'edit', tone: 'blue' },
          { label: 'Delete news', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
