import { AdminTablePage } from '@/components/admin/AdminManagementPage'

const doctors = [
  { name: 'Dr. Pheakdey Lim', specialty: 'Cardiology', clinic: 'Cardiology', email: 'p.lim@orienda.com', phone: '+855 12 345 678', status: 'active' },
  { name: 'Dr. Chanthou Kim', specialty: 'Pediatrics', clinic: 'Pediatrics', email: 'c.kim@orienda.com', phone: '+855 12 345 679', status: 'active' },
  { name: 'Dr. Sophea Nak', specialty: 'Orthopedics', clinic: 'Orthopedics', email: 's.nak@orienda.com', phone: '+855 12 345 680', status: 'active' },
  { name: 'Dr. Borei Chan', specialty: 'Dermatology', clinic: 'Dermatology', email: 'b.chan@orienda.com', phone: '+855 12 345 681', status: 'active' },
  { name: 'Dr. Sreymao Pich', specialty: 'Neurology', clinic: 'Neurology', email: 's.pich@orienda.com', phone: '+855 12 345 682', status: 'inactive' },
]

export default function DoctorsPage() {
  return (
    <AdminTablePage
      title="Doctors"
      breadcrumb="Hospital > Doctors"
      searchPlaceholder="Search doctors..."
      primaryActionLabel="Add Doctor"
      table={{
        rows: doctors,
        rowKey: 'email',
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'specialty', label: 'Specialty' },
          { key: 'clinic', label: 'Clinic' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'actions', label: 'Actions', kind: 'actions' },
        ],
        actions: [
          { label: 'Edit doctor', icon: 'edit', tone: 'muted' },
          { label: 'Delete doctor', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
