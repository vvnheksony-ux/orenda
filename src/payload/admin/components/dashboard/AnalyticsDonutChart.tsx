'use client'

import { type AnalyticsRow } from './AdminMetricCard'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { parseMetricValue } from './analyticsChartUtils'

const colors = ['#c1963e', '#806017', '#bab4aa', '#d8c8a6']

export default function AnalyticsDonutChart({ rows }: { rows: AnalyticsRow[] }) {
  const data = rows.map((row) => ({
    name: row.dimensionValues[0]?.value ?? 'Unknown',
    value: parseMetricValue(row.metricValues[0]?.value),
  }))

  return (
    <div className="orienda-dashboard-donut grid min-h-[315px] place-items-center">
      <div className="orienda-dashboard-donut__canvas h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{ border: '1px solid #eadfcf', borderRadius: 14, boxShadow: '0 14px 30px rgba(53, 42, 22, 0.14)' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [
                value != null ? `${value}%` : '',
                `${data.find((item) => item.value === value)?.name ?? ''}`,
              ]}
            />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2} stroke="#ffffff" strokeWidth={5}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="orienda-dashboard__language-legend mt-3 flex flex-wrap justify-center gap-4 text-xs text-[#8f8577]">
        {data.map((item, index) => (
          <span key={item.name} className="inline-flex items-center gap-1.5">
            <i className="size-3" style={{ backgroundColor: colors[index % colors.length] }} />
            {item.name}: {item.value}%
          </span>
        ))}
      </div>
    </div>
  )
}
