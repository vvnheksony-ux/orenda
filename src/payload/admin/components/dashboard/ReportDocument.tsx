'use client'

import { type AnalyticsRow } from './AdminMetricCard'
import AnalyticsLineChart, { type AnalyticsSeries } from './AnalyticsLineChart'
import AnalyticsBarChart from './AnalyticsBarChart'
import AnalyticsDonutChart from './AnalyticsDonutChart'

type Stat = { label: string; value: string; sub?: string }

const bookingSeries: AnalyticsSeries[] = [
  { label: 'Pending Appointments', metricIndex: 0, color: '#bd8c32', strokeWidth: 2.2 },
  { label: 'Appointments Confirmed', metricIndex: 1, color: '#6f4e18', strokeWidth: 3 },
]

// The full analytics report. It is ALWAYS rendered (so the charts compute real
// sizes), but parked off-screen; the print stylesheet reveals only this element,
// so "Generate Report" → Save as PDF produces a complete, chart-rich document.
export default function ReportDocument({
  generatedAt,
  kpis,
  gaStats,
  hasGa,
  gaDailyPageViews,
  gaDeviceRows,
  mostVisitedRows,
  appointmentBookingRows,
  languageRows,
}: {
  generatedAt: string
  kpis: Stat[]
  gaStats: Stat[]
  hasGa: boolean
  gaDailyPageViews: AnalyticsRow[]
  gaDeviceRows: AnalyticsRow[]
  mostVisitedRows: AnalyticsRow[]
  appointmentBookingRows: AnalyticsRow[]
  languageRows: AnalyticsRow[]
}) {
  const renderCards = (items: Stat[]) => (
    <div className="orpt-grid">
      {items.map((s) => (
        <div className="orpt-card" key={s.label}>
          <p className="orpt-card__label">{s.label}</p>
          <p className="orpt-card__value">{s.value}</p>
          {s.sub ? <p className="orpt-card__sub">{s.sub}</p> : null}
        </div>
      ))}
    </div>
  )

  return (
    <div className="orienda-report-root" aria-hidden>
      <style>{`
        .orienda-report-root { position: fixed; left: -100000px; top: 0; width: 780px; background: #fff; color: #2d2b28; padding: 28px; }
        .orpt-h1 { font-size: 22px; font-weight: 800; margin: 0; }
        .orpt-sub { font-size: 12px; color: #716b60; margin: 4px 0 0; }
        .orpt-rule { height: 2px; background: #b89148; margin: 10px 0 18px; border: 0; }
        .orpt-section-title { font-size: 15px; font-weight: 700; margin: 22px 0 10px; }
        .orpt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .orpt-card { border: 1px solid #f0ece4; border-radius: 14px; padding: 14px; }
        .orpt-card__label { font-size: 12px; color: #918b82; margin: 0; }
        .orpt-card__value { font-size: 24px; font-weight: 800; margin: 6px 0 0; }
        .orpt-card__sub { font-size: 11px; color: #b8ab97; margin: 2px 0 0; text-transform: uppercase; }
        .orpt-panel { border: 1px solid #f0ece4; border-radius: 14px; padding: 14px; margin-top: 14px; break-inside: avoid; }
        .orpt-panel__title { font-size: 14px; font-weight: 700; margin: 0 0 6px; }
        @media print {
          body * { visibility: hidden !important; }
          .orienda-report-root, .orienda-report-root * { visibility: visible !important; }
          .orienda-report-root { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 0 !important; }
          @page { margin: 14mm; }
        }
      `}</style>

      <header>
        <h1 className="orpt-h1">Orienda Hospital — Analytics Report</h1>
        <p className="orpt-sub">Generated {generatedAt}</p>
        <hr className="orpt-rule" />
      </header>

      <h2 className="orpt-section-title">Key Metrics</h2>
      {renderCards(kpis)}

      {hasGa ? (
        <>
          <h2 className="orpt-section-title">Website Traffic · last 30 days</h2>
          {renderCards(gaStats)}
          <div className="orpt-panel">
            <p className="orpt-panel__title">Daily Page Views</p>
            <AnalyticsBarChart rows={gaDailyPageViews} valueLabel="Page Views" />
          </div>
          {gaDeviceRows.length ? (
            <div className="orpt-panel">
              <p className="orpt-panel__title">Devices — share of sessions</p>
              <AnalyticsDonutChart rows={gaDeviceRows} />
            </div>
          ) : null}
        </>
      ) : null}

      {mostVisitedRows.length ? (
        <div className="orpt-panel">
          <p className="orpt-panel__title">Most Visited Pages</p>
          <AnalyticsBarChart rows={mostVisitedRows} horizontal valueLabel="Views" />
        </div>
      ) : null}

      <div className="orpt-panel">
        <p className="orpt-panel__title">Appointment Booking — Pending vs Confirmed</p>
        <AnalyticsLineChart rows={appointmentBookingRows} series={bookingSeries} />
      </div>

      {languageRows.length ? (
        <div className="orpt-panel">
          <p className="orpt-panel__title">Language Selection</p>
          <AnalyticsDonutChart rows={languageRows} />
        </div>
      ) : null}
    </div>
  )
}
