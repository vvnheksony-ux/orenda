import { AdminTablePage } from '@/components/admin/AdminManagementPage'

const pages = [
  { title: 'About Orienda', slug: '/about', status: 'published', lastEdited: '2 min ago', author: 'admin@orienda.com' },
  { title: 'Vision & Mission', slug: '/vision-mission', status: 'published', lastEdited: '1 day ago', author: 'editor@orienda.com' },
  { title: 'Promotion & Packages', slug: '/promotions', status: 'published', lastEdited: '3 days ago', author: 'editor@orienda.com' },
  { title: 'News', slug: '/news', status: 'published', lastEdited: '1 week ago', author: 'admin@orienda.com' },
  { title: 'Contact Us', slug: '/contact-us', status: 'published', lastEdited: '1 week ago', author: 'admin@orienda.com' },
  { title: 'Testimonials', slug: '/testimonials', status: 'published', lastEdited: '1 week ago', author: 'admin@orienda.com' },
  { title: 'Career', slug: '/career', status: 'published', lastEdited: '1 week ago', author: 'admin@orienda.com' },
]

export default function PagesPage() {
  return (
    <AdminTablePage
      title="Pages"
      breadcrumb="Content > Pages"
      searchPlaceholder="Search pages..."
      primaryActionLabel="New Page"
      table={{
        rows: pages,
        rowKey: 'slug',
        columns: [
          { key: 'title', label: 'Title' },
          { key: 'slug', label: 'Slug' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'lastEdited', label: 'Last Edited' },
          { key: 'author', label: 'Author' },
          { key: 'actions', label: 'Actions', kind: 'actions' },
        ],
        actions: [
          { label: 'View page', icon: 'publish', tone: 'muted' },
          { label: 'Edit page', icon: 'edit', tone: 'muted' },
          { label: 'Delete page', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
