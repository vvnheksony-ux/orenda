import { AdminCardPage } from '@/components/admin/AdminManagementPage'
import { getPayloadClient } from '@/lib/payload'

export default async function NewsPage() {
  let news: any[] = []
  try {
    const payload = await getPayloadClient()
    const data = await payload.find({
      collection: 'news',
      overrideAccess: true,
      depth: 0,
      sort: '-publishedAt',
      limit: 100,
    } as any)
    news = data.docs.map((doc: any) => ({
      title: doc.title ?? '',
      description: doc.excerpt ?? '',
      author: doc.author ?? '',
      updated: doc.publishedAt ?? doc.updatedAt ?? '',
      status: doc._status ?? 'draft',
    }))
  } catch {}

  return (
    <AdminCardPage
      title="News"
      breadcrumb="Content > News"
      searchPlaceholder="Search news..."
      primaryActionLabel="Add News"
      cards={{
        items: news,
        rowKey: (_item: any, index: number) => `news-${index}`,
        actions: [
          { label: 'Preview news', icon: 'view', tone: 'muted' },
          { label: 'Edit news', icon: 'edit', tone: 'blue' },
          { label: 'Delete news', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
