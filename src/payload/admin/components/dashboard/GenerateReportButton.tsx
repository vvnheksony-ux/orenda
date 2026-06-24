'use client'

import { FileDown } from 'lucide-react'

// Opens the browser print dialog. Combined with the dashboard's @media print
// styles, this produces a clean, chart-included PDF ("Save as PDF").
export default function GenerateReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="orienda-no-print inline-flex h-11 items-center gap-2 rounded-xl bg-[#b89148] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a37d3e]"
    >
      <FileDown className="size-4" />
      Generate Report
    </button>
  )
}
