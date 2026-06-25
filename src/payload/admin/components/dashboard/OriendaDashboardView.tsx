import Link from 'next/link'
import { headers } from 'next/headers'
import { ExternalLink } from 'lucide-react'
import { getPermissionAccess } from '@zealamic/payload-plugin-rbac'
import AdminHeader from './AdminHeader'
import AdminMetricCard, { type AnalyticsRow } from './AdminMetricCard'
import AdminPanel from './AdminPanel'
import AdminDataTable from './AdminDataTable'
import AnalyticsDonutChart from './AnalyticsDonutChart'
import AnalyticsLineChart, { type AnalyticsSeries } from './AnalyticsLineChart'
import AnalyticsBarChart from './AnalyticsBarChart'
import GenerateReportButton from './GenerateReportButton'
import ReportDocument from './ReportDocument'
import { createServiceClient } from '@/utils/supabase/server'
import { getRawPool } from '@/lib/db'
import config from '@payload-config'
import { getPayload } from 'payload'

const appointmentSeries: AnalyticsSeries[] = [
  { label: 'Pending Appointments', metricIndex: 0, color: '#bd8c32', strokeWidth: 2.2 },
  { label: 'Appointments Confirmed', metricIndex: 1, color: '#6f4e18', strokeWidth: 3 },
]

async function hasPermission(
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: Record<string, unknown> | null | undefined,
  headersList: ReturnType<typeof headers> extends Promise<infer H> ? H : never,
  featureCode: string,
  actionCode: string = 'read',
): Promise<boolean> {
  if (!user) return false
  if (user.isSuperAdmin === true) return true
  const check = getPermissionAccess({ featureCode, actionCode, mode: 'none' })
  const result = await check({ req: { user, payload, headers: headersList } } as any)
  return result === true
}

export default async function AdminDashboard() {
  const supabase = await createServiceClient()
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })
  const userRec = user as Record<string, unknown> | null

  const [canAppointments, canPurchases, canAuditLogs] = await Promise.all([
    hasPermission(payload, userRec, headersList, 'appointments'),
    hasPermission(payload, userRec, headersList, 'purchases'),
    hasPermission(payload, userRec, headersList, 'auditLogs'),
  ])

  const since7 = sevenDaysAgoISO()

  const [
    apptResult,
    purchResult,
    countResult,
    chartResult,
    auditLogsResult,
    doctorsResult,
    callClicks,
    tourViews,
    langEvents,
    recentEvents,
    gaReportsResult,
  ] = await Promise.all([
    canAppointments
      ? supabase.schema('public').from('appointments').select('*').order('created_at', { ascending: false }).limit(10)
      : (Promise.resolve({ data: null }) as any),
    canPurchases
      ? supabase.schema('public').from('purchases').select('*').order('created_at', { ascending: false }).limit(10)
      : (Promise.resolve({ data: null }) as any),
    canAppointments
      ? supabase.schema('public').from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed')
      : (Promise.resolve({ count: 0 }) as any),
    canAppointments
      ? supabase.schema('public').from('appointments').select('preferred_date, status, created_at').gte('created_at', sixMonthsAgoISO())
      : (Promise.resolve({ data: null }) as any),
    canAuditLogs
      ? payload.find({ collection: 'auditLogs', limit: 10, sort: '-timestamp', depth: 0 })
      : (Promise.resolve({ docs: [] }) as any),
    canAppointments
      ? payload.find({ collection: 'doctors', limit: 200, depth: 0 })
      : (Promise.resolve({ docs: [] }) as any),
    payload.count({ collection: 'analyticsEvents', where: { event: { equals: 'call_click' } } }),
    payload.count({ collection: 'analyticsEvents', where: { event: { equals: 'tour_scene_view' } } }),
    payload.find({ collection: 'analyticsEvents', where: { event: { equals: 'language_switch' } }, limit: 5000, depth: 0 }),
    payload.find({
      collection: 'analyticsEvents',
      where: { timestamp: { greater_than_equal: since7 }, event: { in: ['call_click', 'page_view', 'tour_scene_view'] } },
      limit: 20000,
      depth: 0,
      sort: 'timestamp',
    }),
    payload.find({ collection: 'gaReports', where: { reportType: { in: ['overview', 'devices'] } }, sort: '-fetchedAt', limit: 10, depth: 0 }),
  ])

  // Real visitor counts + most-visited pages from our own analytics (raw SQL — a
  // small second batch so it doesn't add to the main query spike). "Total Visitors"
  // must be DISTINCT sessions, not raw page-view rows (which bots/testing inflate).
  const pool = getRawPool()
  const [visitorRes, mostVisitedRes] = await Promise.all([
    pool.query("select count(distinct session_id)::int as sessions from payload.analytics_events where event = 'page_view'"),
    pool.query("select coalesce(nullif(slug, ''), '(home)') as slug, count(*)::int as views from payload.analytics_events where event = 'page_view' group by 1 order by views desc limit 8"),
  ])
  const uniqueVisitors = (visitorRes.rows[0]?.sessions as number) ?? 0
  const mostVisitedRows: AnalyticsRow[] = (mostVisitedRes.rows as { slug: string; views: number }[]).map((r) => ({
    dimensionValues: [{ value: r.slug }],
    metricValues: [{ value: String(r.views) }],
  }))

  const rawAppointments = apptResult.data ?? []
  const rawPurchases = purchResult.data ?? []
  const confirmedCount = countResult.count ?? 0
  const rawChartData = chartResult.data ?? []

  const doctorMap = new Map<string, string>()
  for (const doc of doctorsResult.docs ?? []) {
    doctorMap.set(String(doc.id), doc.name ?? `Doctor #${doc.id}`)
  }

  const appointments = rawAppointments.slice(0, 4).map((a: any) => ({
    time: formatTime(a.preferred_time ?? a.slot_start ?? a.created_at),
    patient: a.patient_name ?? '-',
    doctor: a.doctor_payload_id ? (doctorMap.get(String(a.doctor_payload_id)) ?? `#${String(a.doctor_payload_id).slice(0, 8)}`) : '-',
    status: a.status ?? 'pending',
  }))

  const purchases = rawPurchases.slice(0, 4).map((p: any) => ({
    patient: p.patient_name ?? '-',
    package: p.promotion_title ?? '-',
    status: p.status ?? 'pending',
  }))

  const rawAuditLogs = auditLogsResult.docs ?? []

  const activity = rawAuditLogs.slice(0, 5).map((log: any) => ({
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
    change: `${rawChartData.filter((a: any) => a.status === 'confirmed').length} this period`,
    trendRows: analyticsRows('date', 'appointmentConfirmed', Array.from(monthMap.values()).map((m) => m.confirmed)),
  }

  const recentEventDocs = recentEvents.docs ?? []
  const last7Count = (event: string) => recentEventDocs.filter((d) => d.event === event).length

  const callClickMetric = {
    label: 'Total Call Clicks',
    value: callClicks.totalDocs.toLocaleString(),
    change: `${last7Count('call_click')} in last 7 days`,
    trendRows: buildDailySeries(recentEventDocs, 'call_click', 'callClicks'),
  }
  const tourMetric = {
    label: '360° Tour Views',
    value: tourViews.totalDocs.toLocaleString(),
    change: `${last7Count('tour_scene_view')} in last 7 days`,
    trendRows: buildDailySeries(recentEventDocs, 'tour_scene_view', 'tourViews'),
  }
  const last7Visitors = new Set(
    recentEventDocs
      .filter((d) => d.event === 'page_view')
      .map((d) => (d as { sessionId?: string }).sessionId)
      .filter(Boolean),
  ).size
  const visitorMetric = {
    label: 'Unique Visitors',
    value: uniqueVisitors.toLocaleString(),
    change: `${last7Visitors.toLocaleString()} in last 7 days`,
    trendRows: buildDailySeries(recentEventDocs, 'page_view', 'pageViews'),
  }

  const localeLabels: Record<string, string> = { km: 'Khmer', en: 'English', zh: 'Chinese' }
  const langCounts = new Map<string, number>()
  for (const doc of langEvents.docs ?? []) {
    const loc = doc.locale ?? 'unknown'
    langCounts.set(loc, (langCounts.get(loc) ?? 0) + 1)
  }
  const languageRows: AnalyticsRow[] = Array.from(langCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([loc, n]) => ({ dimensionValues: [{ value: localeLabels[loc] ?? loc }], metricValues: [{ value: String(n) }] }))

  const metrics = [callClickMetric, confirmedMetric, tourMetric, visitorMetric]

  // ---- Google Analytics (GA4) — read latest cached reports (sorted newest-first) ----
  const gaDocs = gaReportsResult.docs ?? []
  const latestGa = (type: string) => gaDocs.find((d) => d.reportType === type)?.data as GaData | undefined
  const gaOverviewRows = sortGaByDate(latestGa('overview')?.rows)
  const gaDevicesRows = latestGa('devices')?.rows ?? []
  const hasGa = gaOverviewRows.length > 0

  const gaSum = (idx: number) => gaOverviewRows.reduce((acc, r) => acc + Number(r.metricValues?.[idx]?.value ?? 0), 0)
  const gaTotalSessions = gaSum(0)
  // Session-weighted average — the correct way to combine daily averages. A plain
  // mean over-weights low-traffic days and produced nonsense like "136m".
  const gaWeighted = (idx: number) => {
    if (!gaTotalSessions) return 0
    const num = gaOverviewRows.reduce(
      (acc, r) => acc + Number(r.metricValues?.[idx]?.value ?? 0) * Number(r.metricValues?.[0]?.value ?? 0),
      0,
    )
    return num / gaTotalSessions
  }

  const gaStats = [
    { label: 'Sessions', value: gaTotalSessions.toLocaleString(), sub: 'Last 30 days' },
    { label: 'Page Views', value: gaSum(1).toLocaleString(), sub: 'Last 30 days' },
    { label: 'Bounce Rate', value: `${(gaWeighted(2) * 100).toFixed(1)}%`, sub: '30-day average' },
    { label: 'Avg. Session', value: formatDuration(gaWeighted(3)), sub: '30-day average' },
  ]

  const gaDailyPageViews: AnalyticsRow[] = gaOverviewRows.map((r) => ({
    dimensionValues: [{ value: formatGaDate(r.dimensionValues?.[0]?.value) }],
    metricValues: [{ value: String(r.metricValues?.[1]?.value ?? '0') }],
  }))

  // Devices as a real percentage share so the donut's "%" labels are correct.
  const gaDeviceTotal = gaDevicesRows.reduce((acc, r) => acc + Number(r.metricValues?.[0]?.value ?? 0), 0)
  const gaDeviceRows: AnalyticsRow[] = gaDevicesRows.map((r) => ({
    dimensionValues: [{ value: capitalize(r.dimensionValues?.[0]?.value ?? 'Unknown') }],
    metricValues: [{ value: gaDeviceTotal ? String(Math.round((Number(r.metricValues?.[0]?.value ?? 0) / gaDeviceTotal) * 100)) : '0' }],
  }))

  return (
    <div className="orienda-dashboard px-20 py-6">
      <div className="flex items-start justify-between gap-4">
        <AdminHeader title="Analytics Dashboard" breadcrumb="Dashboard > Analytics & Reporting" />
        <GenerateReportButton />
      </div>

      <section className="orienda-dashboard__stats mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AdminMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      {(canAppointments || canPurchases) && (
        <section className="orienda-dashboard__tables orienda-no-print mt-7 grid gap-6 xl:grid-cols-2">
          {canAppointments && (
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
                    <Link href="/admin/operations/appointments" className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#b38531] transition hover:bg-[#fbf5e9]">
                      View Details <ExternalLink className="size-3" />
                    </Link>
                  ),
                },
              ]}
              footer="View All Appointments"
              footerHref="/admin/operations/appointments"
            />
          )}
          {canPurchases && (
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
                    <Link href="/admin/operations/purchases" className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#b38531] transition hover:bg-[#fbf5e9]">
                      View Details <ExternalLink className="size-3" />
                    </Link>
                  ),
                },
              ]}
              footer="View All Purchases"
              footerHref="/admin/operations/purchases"
            />
          )}
        </section>
      )}

      {canAppointments && (
        <section className="orienda-dashboard__charts mt-7 grid gap-6 xl:grid-cols-[1fr_380px]">
          <AdminPanel title="Appointment Booking" subtitle="Pending vs Confirmed Appointments">
            <AnalyticsLineChart rows={appointmentBookingRows} series={appointmentSeries} />
          </AdminPanel>
          <AdminPanel title="Language Selection" subtitle="Distribution Breakdown">
            <AnalyticsDonutChart rows={languageRows} />
          </AdminPanel>
        </section>
      )}

      {mostVisitedRows.length > 0 ? (
        <section className="orienda-dashboard__most-visited mt-8">
          <AdminPanel title="Most Visited Pages" subtitle="Top pages by total views (all time)">
            <AnalyticsBarChart rows={mostVisitedRows} horizontal valueLabel="Views" />
          </AdminPanel>
        </section>
      ) : null}

      {hasGa ? (
        <>
          <h2 className="orienda-dashboard__ga-title mt-8 text-lg font-bold text-[#2d2b28]">
            Website Traffic <span className="text-sm font-medium text-[#918b82]">· last 30 days</span>
          </h2>
          <section className="orienda-dashboard__ga-charts mt-4">
            <AdminPanel title="Daily Page Views" subtitle="Last 30 days">
              <AnalyticsBarChart rows={gaDailyPageViews} valueLabel="Page Views" />
            </AdminPanel>
          </section>
        </>
      ) : null}

      {canAuditLogs && (
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
      )}

      <ReportDocument
        generatedAt={new Date().toLocaleString()}
        kpis={metrics.map((m) => ({ label: m.label, value: m.value, sub: m.change }))}
        gaStats={gaStats}
        hasGa={hasGa}
        gaDailyPageViews={gaDailyPageViews}
        gaDeviceRows={gaDeviceRows}
        mostVisitedRows={mostVisitedRows}
        appointmentBookingRows={appointmentBookingRows}
        languageRows={languageRows}
      />
    </div>
  )
}

function analyticsRows(dimensionName: string, metricName: string, values: number[]): AnalyticsRow[] {
  return values.map((value, index) => ({
    dimensionValues: [{ name: dimensionName, value: String(index + 1) }],
    metricValues: [{ name: metricName, value: String(value) }],
  }))
}

function buildDailySeries(
  docs: Array<{ event?: string | null; timestamp?: string | null }>,
  eventType: string,
  metricName: string,
): AnalyticsRow[] {
  const now = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i))
    return { key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, label: String(d.getDate()) }
  })
  const counts = new Map(days.map((d) => [d.key, 0]))
  for (const doc of docs) {
    if (doc.event !== eventType || !doc.timestamp) continue
    const d = new Date(doc.timestamp)
    if (isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return days.map((d) => ({
    dimensionValues: [{ name: 'date', value: d.label }],
    metricValues: [{ name: metricName, value: String(counts.get(d.key) ?? 0) }],
  }))
}

function formatTime(value: string | null | undefined): string {
  if (!value) return '-'
  if (value.includes('T')) return value.slice(11, 16)
  return value.slice(0, 5)
}

type GaRow = { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }
type GaData = { rows?: GaRow[] }

function sortGaByDate(rows: GaRow[] | undefined): GaRow[] {
  return [...(rows ?? [])].sort((a, b) =>
    String(a.dimensionValues?.[0]?.value ?? '').localeCompare(String(b.dimensionValues?.[0]?.value ?? '')),
  )
}

// GA4 returns dates as YYYYMMDD → show as MM/DD.
function formatGaDate(value: string | undefined): string {
  if (!value || value.length !== 8) return String(value ?? '')
  return `${value.slice(4, 6)}/${value.slice(6, 8)}`
}

function formatDuration(seconds: number): string {
  if (!seconds || Number.isNaN(seconds)) return '0s'
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
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

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function sixMonthsAgoISO(): string {
  return new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
}

function sevenDaysAgoISO(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
}

function getLastSixMonths(): Date[] {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return d
  })
}
