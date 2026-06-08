import { AdminTablePage } from '@/components/admin/AdminManagementPage'

const auditLogs = [
  { action: 'Created appointment', user: 'Sok Dara', date: '2025-06-12', time: '09:00', status: 'success' },
  { action: 'Updated appointment', user: 'Maria Santos', date: '2025-06-12', time: '10:30', status: 'success' },
  { action: 'Deleted appointment', user: 'Wei Zhang', date: '2025-06-13', time: '14:00', status: 'failed' },
  { action: 'Created appointment', user: 'Pisach Hor', date: '2025-06-13', time: '15:30', status: 'success' },
  { action: 'Updated appointment', user: 'Sreyleap Mao', date: '2025-06-14', time: '08:00', status: 'success' },
  { action: 'Deleted appointment', user: 'Dara Keo', date: '2025-06-11', time: '11:00', status: 'failed' },
]

export default function AuditLogPage() {
  return (
    <AdminTablePage
      title="Audit Logs"
      breadcrumb="Operations & Sales > Audit Logs"
      searchPlaceholder="Search audit logs..."
      primaryActionLabel="New Audit Log"
      table={{
        rows: auditLogs,
        rowKey: (_row, index) => `audit-log-${index}`,
        columns: [
          { key: 'action', label: 'Action' },
          { key: 'user', label: 'User' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'actions', label: 'Actions', kind: 'actions' },
        ],
        actions: [{ label: 'View Details', tone: 'gold' }],
      }}
    />
  )
}
