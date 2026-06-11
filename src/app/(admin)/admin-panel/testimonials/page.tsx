import { AdminTablePage } from '@/components/admin/AdminManagementPage'

const appointments = [
  { patient: 'Sok Dara', doctor: 'Dr. Pheakdey Lim', department: 'Cardiology', date: '2025-06-12', time: '09:00', type: 'Consultation', status: 'pending' },
  { patient: 'Maria Santos', doctor: 'Dr. Chanthou Kim', department: 'Pediatrics', date: '2025-06-12', time: '10:30', type: 'Check-up', status: 'confirmed' },
  { patient: 'Wei Zhang', doctor: 'Dr. Sophea Nak', department: 'Orthopedics', date: '2025-06-13', time: '14:00', type: 'Follow-up', status: 'pending' },
  { patient: 'Pisach Hor', doctor: 'Dr. Pheakdey Lim', department: 'Cardiology', date: '2025-06-13', time: '15:30', type: 'Consultation', status: 'confirmed' },
  { patient: 'Sreyleap Mao', doctor: 'Dr. Borei Chan', department: 'Dermatology', date: '2025-06-14', time: '08:00', type: 'Follow-up', status: 'confirmed' },
  { patient: 'Dara Keo', doctor: 'Dr. Chanthou Kim', department: 'Pediatrics', date: '2025-06-11', time: '11:00', type: 'Vaccination', status: 'confirmed' },
]

export default function TestimonialsPage() {
  return (
    <AdminTablePage
      title="Testimonials"
      breadcrumb="Operations & Sales > Testimonials"
      searchPlaceholder="Search testimonials..."
      primaryActionLabel="New Testimonial"
      table={{
        rows: appointments,
        rowKey: (_row, index) => `appointment-${index}`,
        columns: [
          { key: 'patient', label: 'Patient' },
          { key: 'doctor', label: 'Doctor' },
          { key: 'department', label: 'Department' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'type', label: 'Type' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'actions', label: 'Actions', kind: 'actions' },
        ],
        actions: [{ label: 'View Details', tone: 'gold' }],
      }}
    />
  )
}
