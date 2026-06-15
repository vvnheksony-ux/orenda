import Link from 'next/link'
import { CalendarDays, ExternalLink, RefreshCw } from 'lucide-react'
import AdminHeader from './AdminHeader'
import AdminMetricCard, { type AnalyticsRow } from './AdminMetricCard'
import AdminPanel from './AdminPanel'
import AdminDataTable from './AdminDataTable'
import AnalyticsDonutChart from './AnalyticsDonutChart'
import AnalyticsLineChart, { type AnalyticsSeries } from './AnalyticsLineChart'
import { createServiceClient } from '@/utils/supabase/server'
import config from '@payload-config'
import { getPayload } from 'payload'

const staticMetrics = [
  {
    label: 'Total Call Clicks',
    value: '8,563',
    change: '+14% vs last month',
    trendRows: analyticsRows('date', 'eventCount', [6210, 6740, 6565, 7110, 7395, 7740, 8563]),
  },
  {
    label: '360° Tour Engagement',
    value: '64%',
    change: '+12% vs last month',
    trendRows: analyticsRows('date', 'engagementRate', [48, 51, 55, 53, 59, 61, 64]),
  },
  {
    label: 'Total Visitor',
    value: '28.9%',
    change: '+5% vs last month',
    trendRows: analyticsRows('date', 'visitorGrowthRate', [20.4, 21.1, 22.7, 22.2, 25.4, 26.1, 28.9]),
  },
]

const appointmentSeries: AnalyticsSeries[] = [
  { label: 'Pending Appointments', metricIndex: 0, color: '#bd8c32', strokeWidth: 2.2 },
  { label: 'Appointments Confirmed', metricIndex: 1, color: '#6f4e18', strokeWidth: 3 },
]

const languageRows: AnalyticsRow[] = [
  { dimensionValues: [{ value: 'Khmer' }], metricValues: [{ value: '52' }] },
  { dimensionValues: [{ value: 'English' }], metricValues: [{ value: '34' }] },
  { dimensionValues: [{ value: 'Chinese' }], metricValues: [{ value: '14' }] },
]

export default async function AdminDashboard() {
  const supabase = await createServiceClient()
  const payload = await getPayload({ config })

  const [apptResult, purchResult, countResult, chartResult, auditLogsResult, doctorsResult] = await Promise.all([
    supabase.schema('public').from('appointments').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.schema('public').from('purchases').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.schema('public').from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.schema('public').from('appointments').select('preferred_date, status, created_at').gte('created_at', sixMonthsAgoISO()),
    payload.find({ collection: 'auditLogs', limit: 10, sort: '-timestamp', depth: 0 }),
    payload.find({ collection: 'doctors', limit: 200, depth: 0 }),
  ])

  const rawAppointments = apptResult.data ?? []
  const rawPurchases = purchResult.data ?? []
  const rawAuditLogs = auditLogsResult.docs ?? []
  const confirmedCount = countResult.count ?? 0
  const rawChartData = chartResult.data ?? []

  const doctorMap = new Map<string, string>()
  for (const doc of doctorsResult.docs ?? []) {
    doctorMap.set(String(doc.id), doc.name ?? `Doctor #${doc.id}`)
  }

  const appointments = rawAppointments.slice(0, 4).map((a) => ({
    time: formatTime(a.preferred_time ?? a.slot_start ?? a.created_at),
    patient: a.patient_name ?? '-',
    doctor: a.doctor_payload_id ? (doctorMap.get(String(a.doctor_payload_id)) ?? `#${String(a.doctor_payload_id).slice(0, 8)}`) : '-',
    status: a.status ?? 'pending',
  }))

  const purchases = rawPurchases.slice(0, 4).map((p) => ({
    patient: p.patient_name ?? '-',
    package: p.promotion_title ?? '-',
    status: p.status ?? 'pending',
  }))

  const activity = rawAuditLogs.slice(0, 5).map((log) => ({
    timestamp: formatTimestamp(log.timestamp),
    actor: log.userName ?? log.userId ?? 'system',
    action: mapAuditAction(log.action),
    resource: log.documentTitle ? `${log.collectionSlug}: ${log.documentTitle}` : log.collectionSlug,
    action_btn: '',
  }))

  const sixMonths = getLastSixMonths()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthMap = new Map(sixMonths.map((d) => [`${d.getFullYear()}-${d.getMonth()}`, { pending: 0, confirmed: 0 }]))

  for (const a of rawChartData) {
    const date = a.preferred_date ?? a.created_at
    if (!date) continue
    const d = new Date(date)
    if (isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const entry = monthMap.get(key)
    if (entry) {
      if (a.status === 'confirmed') entry.confirmed++
      else entry.pending++
    }
  }

  const appointmentBookingRows: AnalyticsRow[] = Array.from(monthMap.entries()).map(([key, counts]) => ({
    dimensionValues: [{ value: monthNames[parseInt(key.split('-')[1])] }],
    metricValues: [{ value: String(counts.pending) }, { value: String(counts.confirmed) }],
  }))

  const confirmedMetric = {
    label: 'Confirmed Appointments',
    value: confirmedCount.toLocaleString(),
    change: `${rawChartData.filter((a) => a.status === 'confirmed').length} this period`,
    trendRows: analyticsRows('date', 'appointmentConfirmed', Array.from(monthMap.values()).map((m) => m.confirmed)),
  }

  const metrics = [staticMetrics[0], confirmedMetric, staticMetrics[1], staticMetrics[2]]

  return (
    <div className="orienda-dashboard px-20 py-6">
      <AdminHeader title="Analytics Dashboard" breadcrumb="Dashboard > Analytics & Reporting" />

      {/* <section className="orienda-dashboard__toolbar mt-6 flex flex-wrap gap-3">
        <ControlButton icon={CalendarDays} label="Last 7 Days" />
        <ControlButton icon={RefreshCw} label="Refresh" />
      </section> */}

      <section className="orienda-dashboard__stats mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AdminMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="orienda-dashboard__tables mt-7 grid gap-6 xl:grid-cols-2">
        <AdminDataTable
          title="This Week's Appointments"
          columns={[
            { key: 'time', label: 'Time' },
            { key: 'patient', label: 'Patient' },
            { key: 'doctor', label: 'Doctor' },
            { key: 'status', label: 'Status', kind: 'status' },
            { key: 'action', label: '', kind: 'actions' },
          ]}
          rows={appointments}
          actions={[
            {
              label: 'View Details',
              tone: 'gold',
              render: () => (
                <Link href="/admin-panel/appointments" className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#b38531] transition hover:bg-[#fbf5e9]">
                  View Details <ExternalLink className="size-3" />
                </Link>
              ),
            },
          ]}
          footer="View All Appointments"
          footerHref="/admin-panel/appointments"
        />
        <AdminDataTable
          title="This Week's Purchases"
          columns={[
            { key: 'patient', label: 'Patient' },
            { key: 'package', label: 'Promotion Package' },
            { key: 'status', label: 'Status', kind: 'status' },
            { key: 'action', label: '', kind: 'actions' },
          ]}
          rows={purchases}
          actions={[
            {
              label: 'View Details',
              tone: 'gold',
              render: () => (
                <Link href="/admin-panel/purchases" className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#b38531] transition hover:bg-[#fbf5e9]">
                  View Details <ExternalLink className="size-3" />
                </Link>
              ),
            },
          ]}
          footer="View All Purchases"
          footerHref="/admin-panel/purchases"
        />
      </section>

      <section className="orienda-dashboard__charts mt-7 grid gap-6 xl:grid-cols-[1fr_380px]">
        <AdminPanel title="Appointment Booking" subtitle="Pending vs Confirmed Appointments">
          <AnalyticsLineChart rows={appointmentBookingRows} series={appointmentSeries} />
        </AdminPanel>
        <AdminPanel title="Language Selection" subtitle="Distribution Breakdown">
          <AnalyticsDonutChart rows={languageRows} />
        </AdminPanel>
      </section>

      <section className="orienda-dashboard__activity mt-7">
        <AdminDataTable
          title="Recent Activity"
          columns={[
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'actor', label: 'Actor' },
            { key: 'action', label: 'Action', kind: 'status' },
            { key: 'resource', label: 'Resource' },
            { key: 'action_btn', label: '', kind: 'actions' },
          ]}
          rows={activity}
          actions={[
            {
              label: 'View Details',
              tone: 'gold',
              render: () => (
                <Link href="/admin/collections/auditLogs" className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#b38531] transition hover:bg-[#fbf5e9]">
                  View Details <ExternalLink className="size-3" />
                </Link>
              ),
            },
          ]}
          footer="View All Activities"
          footerHref="/admin/collections/auditLogs"
        />
      </section>
    </div>
  )
}

function ControlButton({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button className="orienda-dashboard-control inline-flex h-11 items-center gap-3 rounded-xl border border-[#eee8dd] bg-white px-5 text-sm font-semibold text-[#6d675f] shadow-sm transition hover:border-[#d7c7a9] hover:text-[#8a672c]">
      <Icon className="size-4" />
      {label}
    </button>
  )
}

function analyticsRows(dimensionName: string, metricName: string, values: number[]): AnalyticsRow[] {
  return values.map((value, index) => ({
    dimensionValues: [{ name: dimensionName, value: String(index + 1) }],
    metricValues: [{ name: metricName, value: String(value) }],
  }))
}

function formatTime(value: string | null | undefined): string {
  if (!value) return '-'
  if (value.includes('T')) return value.slice(11, 16)
  return value.slice(0, 5)
}

function mapAuditAction(action: string): string {
  const map: Record<string, string> = {
    created: 'create',
    updated: 'update',
    deleted: 'delete',
    published: 'published',
    archived: 'archived',
  }
  return map[action] ?? action
}

function formatTimestamp(ts: string | null | undefined): string {
  if (!ts) return '-'
  try {
    return new Date(ts).toISOString().replace('T', ' ').slice(0, 19)
  } catch {
    return String(ts)
  }
}

function sixMonthsAgoISO(): string {
  return new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
}

function getLastSixMonths(): Date[] {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return d
  })
}
