import { AdminTablePage } from '@/components/admin/AdminManagementPage'
import config from '@payload-config'
import { getPayload } from 'payload'

function mapAuditAction(action: string): string {
  const map: Record<string, string> = {
    created: 'Created',
    updated: 'Updated',
    deleted: 'Deleted',
    published: 'Published',
    archived: 'Archived',
  }
  return map[action] ?? action
}

function formatTimestampParts(ts: string | null | undefined): { date: string; time: string } {
  if (!ts) return { date: '-', time: '-' }
  try {
    const d = new Date(ts)
    if (isNaN(d.getTime())) return { date: String(ts), time: '-' }
    const dateStr = d.toISOString().slice(0, 10)
    const timeStr = d.toISOString().slice(11, 16)
    return { date: dateStr, time: timeStr }
  } catch {
    return { date: String(ts), time: '-' }
  }
}

export default async function AuditLogPage() {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'auditLogs', limit: 50, sort: '-timestamp', depth: 0 })

  const rows = (result.docs ?? []).map((log) => {
    const { date, time } = formatTimestampParts(log.timestamp)
    const actionLabel = log.documentTitle
      ? `${mapAuditAction(log.action)} ${log.collectionSlug}: ${log.documentTitle}`
      : `${mapAuditAction(log.action)} ${log.collectionSlug}`
    return {
      action: actionLabel,
      user: log.userName ?? log.userId ?? '-',
      date,
      time,
      status: log.action,
    }
  })

  return (
    <AdminTablePage
      title="Audit Logs"
      breadcrumb="Operations & Sales > Audit Logs"
      searchPlaceholder="Search audit logs..."
      primaryActionLabel="New Audit Log"
      table={{
        rows,
        rowKey: (_, index) => `audit-log-${index}`,
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
