import { AdminTablePage } from '@/components/admin/AdminManagementPage'

const users = [
  { name: 'Admin User', email: 'admin@orienda.com', role: 'admin', lastLogin: '2 hours ago', status: 'active' },
  { name: 'Dr. Pheakdey Lim', email: 'p.lim@orienda.com', role: 'contributor', lastLogin: '1 day ago', status: 'active' },
  { name: 'Editor User', email: 'editor@orienda.com', role: 'editor', lastLogin: '5 hours ago', status: 'active' },
  { name: 'Reception Staff', email: 'reception@orienda.com', role: 'contributor', lastLogin: '30 min ago', status: 'active' },
  { name: 'Dr. Chanthou Kim', email: 'c.kim@orienda.com', role: 'admin', lastLogin: '3 days ago', status: 'inactive' },
]

export default function UsersPage() {
  return (
    <AdminTablePage
      title="Users"
      breadcrumb="Identity > Users"
      searchPlaceholder="Search users..."
      primaryActionLabel="Add User"
      table={{
        rows: users,
        rowKey: 'email',
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', kind: 'status' },
          { key: 'lastLogin', label: 'Last Login' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'actions', label: 'Actions', kind: 'actions' },
        ],
        actions: [
          { label: 'Edit user', icon: 'edit', tone: 'muted' },
          { label: 'Delete user', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
