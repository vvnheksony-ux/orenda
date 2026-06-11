import { AdminTablePage } from '@/components/admin/AdminManagementPage'
import { createServiceClient } from '@/utils/supabase/server'

export default async function AppointmentsPage() {
  let appointments: any[] = []
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    appointments = (data ?? []).map((row: any) => ({
      patient: row.patient_name ?? '',
      phone: row.patient_phone ?? '',
      date: row.preferred_date ?? '',
      time: row.preferred_time ?? '',
      source: row.source ?? '',
      status: row.status ?? 'pending',
    }))
  } catch {}

  return (
    <AdminTablePage
      title="Appointments"
      breadcrumb="Operations & Sales > Appointments"
      searchPlaceholder="Search appointments..."
      primaryActionLabel="New Appointment"
      table={{
        rows: appointments,
        rowKey: (_row: any, index: number) => `appointment-${index}`,
        columns: [
          { key: 'patient', label: 'Patient' },
          { key: 'phone', label: 'Phone' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'source', label: 'Source' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'actions', label: 'Actions', kind: 'actions' },
        ],
        actions: [{ label: 'View Details', tone: 'gold' }],
      }}
    />
  )
}
