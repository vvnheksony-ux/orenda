import type { ReactNode } from 'react'

// Clean, professional stat card (no sparkline, so no raw chart values leak).
export default function GaStatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon?: ReactNode }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(53,42,22,0.08)] ring-1 ring-[#f0ece4]">
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f7efdf] text-[#b78632]">{icon}</span>
        ) : null}
        <p className="text-sm font-medium text-[#918b82]">{label}</p>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-[#2d2b28]">{value}</p>
      {sub ? <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#b8ab97]">{sub}</p> : null}
    </article>
  )
}
