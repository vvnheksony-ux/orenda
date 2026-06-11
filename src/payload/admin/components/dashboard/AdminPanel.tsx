

export default function AdminPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <article className="orienda-dashboard-panel rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(53,42,22,0.08)] ring-1 ring-[#f0ece4]">
      <div className="orienda-dashboard-panel__title mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2d2b28]">{title}</h2>
          <p className="mt-1 text-sm text-[#918b82]">{subtitle}</p>
        </div>
      </div>
      {children}
    </article>
  )
}
