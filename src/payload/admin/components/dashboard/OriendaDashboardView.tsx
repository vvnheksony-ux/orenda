import { CalendarDays, RefreshCw } from 'lucide-react'
import AdminHeader from './AdminHeader'
import AdminMetricCard, {type AnalyticsRow } from './AdminMetricCard'
import AdminPanel from './AdminPanel'
import AdminDataTable from './AdminDataTable'
import AnalyticsDonutChart from './AnalyticsDonutChart'
import AnalyticsLineChart, { type AnalyticsSeries } from './AnalyticsLineChart'

const metrics = [
  {
    label: 'Total Call Clicks',
    value: '8,563',
    change: '+14% vs last month',
    trendRows: analyticsRows('date', 'eventCount', [6210, 6740, 6565, 7110, 7395, 7740, 8563]),
  },
  {
    label: 'Completed Appointments',
    value: '2,478',
    change: '+8% vs last month',
    trendRows: analyticsRows('date', 'appointmentCompleted', [1940, 2025, 1988, 2115, 2240, 2362, 2478]),
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

const appointments = [
  { time: '09:00', patient: 'Sok Dara', doctor: 'Dr. Pheakdey Lim', status: 'pending' as const },
  { time: '10:30', patient: 'Maria Santos', doctor: 'Dr. Chanthou Kim', status: 'confirmed' as const },
  { time: '14:00', patient: 'Wei Zhang', doctor: 'Dr. Sophea Nak', status: 'pending' as const },
  { time: '15:30', patient: 'Pisach Hor', doctor: 'Dr. Pheakdey Lim', status: 'confirmed' as const },
]

const purchases = [
  { patient: 'Sok Dara', package: 'Free Health Checkup', status: 'pending' as const },
  { patient: 'Maria Santos', package: 'Free Health Checkup', status: 'confirmed' as const },
  { patient: 'Wei Zhang', package: 'Free Health Checkup', status: 'pending' as const },
  { patient: 'Pisach Hor', package: 'Free Health Checkup', status: 'confirmed' as const },
]

const activity = [
  { timestamp: '2026-05-22 14:30:15', actor: 'admin@orienda.com', action: 'published' as const, resource: 'Page: About Us', ip: '192.168.1.10' },
  { timestamp: '2026-05-22 14:15:42', actor: 'editor@orienda.com', action: 'update' as const, resource: 'Doctor: Pheakdey Lim', ip: '192.168.1.22' },
  { timestamp: '2026-05-22 13:45:30', actor: 'admin@orienda.com', action: 'delete' as const, resource: 'Media: old-banner.jpg', ip: '192.168.1.10' },
  { timestamp: '2026-05-22 12:20:18', actor: 'staff@orienda.com', action: 'create' as const, resource: 'Appointment: #1234', ip: '192.168.1.45' },
  { timestamp: '2026-05-22 11:50:05', actor: 'editor@orienda.com', action: 'update' as const, resource: 'Page: Services', ip: '192.168.1.22' },
]

const appointmentBookingRows: AnalyticsRow[] = [
  { dimensionValues: [{ value: 'Jan' }], metricValues: [{ value: '420' }, { value: '360' }] },
  { dimensionValues: [{ value: 'Feb' }], metricValues: [{ value: '395' }, { value: '342' }] },
  { dimensionValues: [{ value: 'Mar' }], metricValues: [{ value: '515' }, { value: '445' }] },
  { dimensionValues: [{ value: 'Apr' }], metricValues: [{ value: '485' }, { value: '410' }] },
  { dimensionValues: [{ value: 'May' }], metricValues: [{ value: '535' }, { value: '475' }] },
  { dimensionValues: [{ value: 'Jun' }], metricValues: [{ value: '590' }, { value: '520' }] },
]

const appointmentSeries: AnalyticsSeries[] = [
  { label: 'Pending Appointments', metricIndex: 0, color: '#bd8c32', strokeWidth: 2.2 },
  { label: 'Appointments Completed', metricIndex: 1, color: '#6f4e18', strokeWidth: 3 },
]

const languageRows: AnalyticsRow[] = [
  { dimensionValues: [{ value: 'Khmer' }], metricValues: [{ value: '52' }] },
  { dimensionValues: [{ value: 'English' }], metricValues: [{ value: '34' }] },
  { dimensionValues: [{ value: 'Chinese' }], metricValues: [{ value: '14' }] },
]

export default function AdminDashboard() {
  return (
    <div className="orienda-dashboard px-4 ">
      <AdminHeader title="Analytics Dashboard" breadcrumb="Dashboard > Analytics & Reporting" />

      <section className="orienda-dashboard__toolbar mt-6 flex flex-wrap gap-3">
        <ControlButton icon={CalendarDays} label="Last 7 Days" />
        <ControlButton icon={RefreshCw} label="Refresh" />
      </section>

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
          actions={[{ label: 'View Details', tone: 'gold' }]}
          footer="View All Appointments"
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
          actions={[{ label: 'View Details', tone: 'gold' }]}
          footer="View All Purchases"
        />
      </section>

      <section className="orienda-dashboard__charts mt-7 grid gap-6 xl:grid-cols-[1fr_380px]">
        <AdminPanel title="Appointment Booking" subtitle="Pending vs Completed Appointments">
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
            // { key: 'ip', label: 'IP Address' },
          ]}
          rows={activity}
          footer="View All Activities"
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
