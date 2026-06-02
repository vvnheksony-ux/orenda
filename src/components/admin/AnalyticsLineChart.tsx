'use client'

import { type AnalyticsRow } from './AdminMetricCard'
import { Area, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { parseMetricValue } from './analyticsChartUtils'

export type AnalyticsSeries = {
  label: string
  metricIndex: number
  color: string
  strokeWidth: number
}

export default function AnalyticsLineChart({ rows, series }: { rows: AnalyticsRow[]; series: AnalyticsSeries[] }) {
  const data = rows.map((row) => {
    return series.reduce<Record<string, string | number>>(
      (point, item) => ({
        ...point,
        [item.label]: parseMetricValue(row.metricValues[item.metricIndex]?.value),
      }),
      { label: row.dimensionValues[0]?.value ?? '' }
    )
  })

  return (
    <div className="pt-2">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 24, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#f1eee8" vertical={false} />
            <XAxis dataKey="label" tickLine={{ stroke: '#b9b2a8' }} axisLine={false} tick={{ fill: '#9d978f', fontSize: 13 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9d978f', fontSize: 13 }} />
            <Tooltip
              contentStyle={{ border: '1px solid #eadfcf', borderRadius: 14, boxShadow: '0 14px 30px rgba(53, 42, 22, 0.14)' }}
              labelStyle={{ color: '#6f4e18', fontWeight: 700 }}
            />
            {series[0] ? <Area type="monotone" dataKey={series[0].label} fill="#c49a42" fillOpacity={0.14} stroke="none" /> : null}
            {series.map((item) => (
              <Line
                key={item.label}
                type="monotone"
                dataKey={item.label}
                stroke={item.color}
                strokeWidth={item.strokeWidth}
                dot={false}
                activeDot={{ r: 5, fill: item.color }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-5 text-xs text-[#8f8577]">
        {series.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <i className="h-0.5 w-7" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
