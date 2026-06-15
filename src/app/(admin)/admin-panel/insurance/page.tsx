import { AdminCardPage } from '@/components/admin/AdminManagementPage'

const insuranceItems = [
  { title: 'Insurance title', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'Insurance title', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'Insurance title', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'Insurance title', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'Insurance title', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
]

export default function InsurancePage() {
  return (
    <AdminCardPage
      title="Insurance"
      breadcrumb="Content > Insurance"
      searchPlaceholder="Search insurance..."
      primaryActionLabel="Add Insurance"
      cards={{
        items: insuranceItems,
        rowKey: (_item, index) => `insurance-${index}`,
        actions: [
          { label: 'Preview insurance', icon: 'view', tone: 'muted' },
          { label: 'Edit insurance', icon: 'edit', tone: 'blue' },
          { label: 'Delete insurance', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
