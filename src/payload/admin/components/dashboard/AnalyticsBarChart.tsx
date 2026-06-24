'use client'

import { type AnalyticsRow } from './AdminMetricCard'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { parseMetricValue } from './analyticsChartUtils'

export default function AnalyticsBarChart({
  rows,
  color = '#c49a42',
  horizontal = false,
  valueLabel = 'Value',
}: {
  rows: AnalyticsRow[]
  color?: string
  horizontal?: boolean
  valueLabel?: string
}) {
  const data = rows.map((row) => ({
    label: row.dimensionValues[0]?.value ?? '',
    value: parseMetricValue(row.metricValues[0]?.value),
  }))

  return (
    <div className="orienda-dashboard-bar-chart pt-2">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 16, right: 16, bottom: 8, left: horizontal ? 16 : 0 }}>
            <CartesianGrid stroke="#f1eee8" vertical={false} />
            {horizontal ? (
              <>
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#9d978f', fontSize: 12 }} />
                <YAxis type="category" dataKey="label" width={150} tickLine={false} axisLine={false} tick={{ fill: '#6f675d', fontSize: 12 }} />
              </>
            ) : (
              <>
                <XAxis dataKey="label" tickLine={{ stroke: '#b9b2a8' }} axisLine={false} tick={{ fill: '#9d978f', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9d978f', fontSize: 13 }} allowDecimals={false} />
              </>
            )}
            <Tooltip
              cursor={{ fill: 'rgba(196,154,66,0.08)' }}
              contentStyle={{ border: '1px solid #eadfcf', borderRadius: 14, boxShadow: '0 14px 30px rgba(53, 42, 22, 0.14)' }}
              labelStyle={{ color: '#6f4e18', fontWeight: 700 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [value, valueLabel]}
            />
            <Bar dataKey="value" fill={color} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={horizontal ? 22 : 46} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
