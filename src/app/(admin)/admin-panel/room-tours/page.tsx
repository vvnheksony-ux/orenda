import { AdminCardPage } from '@/components/admin/AdminManagementPage'

const roomTours = [
  { title: 'Room Tour title', description: 'This is room tour short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'Room Tour title', description: 'This is room tour short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'Room Tour title', description: 'This is room tour short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'Room Tour title', description: 'This is room tour short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'Room Tour title', description: 'This is room tour short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
]

export default function RoomToursPage() {
  return (
    <AdminCardPage
      title="Room Tours"
      breadcrumb="Content > Room Tours"
      searchPlaceholder="Search room tours..."
      primaryActionLabel="Add Room Tour"
      cards={{
        items: roomTours,
        rowKey: (_item, index) => `roomTour-${index}`,
        actions: [
          { label: 'Preview room tour', icon: 'view', tone: 'muted' },
          { label: 'Edit room tour', icon: 'edit', tone: 'blue' },
          { label: 'Delete room tour', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
