'use client'

import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { KPI_METRIC_OPTIONS, KpiMetricValue } from '../constants'

const COLORS = ['#C7A779', '#4A3B2C', '#A07A44', '#EAE2D3', '#8B7E74']

interface KpiDoc {
  metric: KpiMetricValue
  value: number
  date: string
}

interface DashboardData {
  docs: KpiDoc[]
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/payload-api/analytics/kpi')
        const json = await response.json()
        setData(json)
      } catch (err) {
        console.error('Failed to fetch analytics data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8">Loading dashboard...</div>
  if (!data) return <div className="p-8">No data available.</div>

  return (
    <div className="p-8 bg-[#fbf7ee] min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3B2C]">Analytics & KPI Dashboard</h1>
          <p className="text-[#A07A44]">Real-time performance metrics for Orienda Hospital</p>
        </div>
        <button 
          onClick={() => window.location.href = '/payload-api/analytics/export'}
          className="bg-[#C7A779] text-white px-6 py-2 rounded-full font-bold hover:bg-[#b69668] transition-colors shadow-sm"
        >
          Export CSV
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {data.docs?.slice(0, 4).map((kpi, i: number) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gold-100">
            <h3 className="text-sm font-bold text-gold-600 uppercase tracking-wider mb-2">
              {KPI_METRIC_OPTIONS.find(o => o.value === kpi.metric)?.label || kpi.metric}
            </h3>
            <div className="text-3xl font-bold text-[#4A3B2C]">{kpi.value}</div>
            <p className="text-xs text-green-600 mt-2">↑ 12% vs last period</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Trend Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gold-100">
          <h3 className="text-xl font-bold text-[#4A3B2C] mb-6">Activity Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.docs?.slice(0, 10).reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#C7A779" strokeWidth={3} dot={{r: 4, fill: '#C7A779'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Split */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gold-100">
          <h3 className="text-xl font-bold text-[#4A3B2C] mb-6">Language Usage</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'English', value: 65 },
                    { name: 'Khmer', value: 35 }
                  ]}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 ml-8">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#C7A779]"></div>
                 <span className="text-sm font-medium text-[#4A3B2C]">English (65%)</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#4A3B2C]"></div>
                 <span className="text-sm font-medium text-[#4A3B2C]">Khmer (35%)</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Performance */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gold-100">
        <h3 className="text-xl font-bold text-[#4A3B2C] mb-6">Top Performing Content</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gold-100">
              <th className="pb-4 font-bold text-gold-600 text-sm uppercase tracking-wider">Page / Doctor</th>
              <th className="pb-4 font-bold text-gold-600 text-sm uppercase tracking-wider text-right">Views</th>
              <th className="pb-4 font-bold text-gold-600 text-sm uppercase tracking-wider text-right">Trend</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Dr. John Doe', views: 1240, trend: '+15%' },
              { name: 'Cardiology Department', views: 890, trend: '+8%' },
              { name: 'Emergency Services', views: 760, trend: '-2%' },
              { name: 'Health Screening Packages', views: 540, trend: '+24%' }
            ].map((row, i) => (
              <tr key={i} className="border-b border-gold-50 last:border-0">
                <td className="py-4 font-medium text-[#4A3B2C]">{row.name}</td>
                <td className="py-4 text-right text-[#4A3B2C]">{row.views}</td>
                <td className={`py-4 text-right font-bold ${row.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                  {row.trend}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
