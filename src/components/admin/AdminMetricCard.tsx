'use client'

import { Download } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts'
import { parseMetricValue } from './analyticsChartUtils'

export type AnalyticsRow = {
  dimensionValues: Array<{ name?: string; value: string }>
  metricValues: Array<{ name?: string; value: string }>
}

type AdminMetric = {
  label: string
  value: string
  change: string
  trendRows: AnalyticsRow[]
}

export default function AdminMetricCard({ metric }: { metric: AdminMetric }) {
  const data = metric.trendRows.map((row) => ({
    label: row.dimensionValues[0]?.value,
    value: parseMetricValue(row.metricValues[0]?.value),
  }))

  return (
    <article className="rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(53,42,22,0.08)] ring-1 ring-[#f0ece4]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#918b82]">{metric.label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#2d2b28]">{metric.value}</p>
          <p className="mt-2 text-sm font-bold text-[#2fac73]">{metric.change}</p>
        </div>
        <Download className="size-4 text-[#bb8d36]" />
      </div>
      <div className="mt-6 h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 3, right: 2, bottom: 3, left: 2 }}>
            <Tooltip
              cursor={false}
              contentStyle={{ border: '1px solid #eadfcf', borderRadius: 12, boxShadow: '0 12px 24px rgba(53, 42, 22, 0.12)' }}
              labelStyle={{ color: '#6f4e18', fontWeight: 700 }}
            />
            <Line type="monotone" dataKey="value" stroke="#b78632" strokeWidth={2.2} dot={false} activeDot={{ r: 4, fill: '#b78632' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}
