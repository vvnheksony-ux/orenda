import { Bell } from 'lucide-react'

export default function AdminHeader({ title, breadcrumb }: { title: string; breadcrumb: string }) {
  return (
    <header className="-mx-4 border-b border-[#ebe7df] bg-white/92 px-4 py-5 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#242424]">{title}</h1>
          <p className="mt-1 text-sm text-[#8f8a82]">{breadcrumb}</p>
        </div>
        <div className="flex items-center gap-4">
          <button aria-label="Notifications" className="grid size-10 place-items-center rounded-full text-[#7c766d] transition hover:bg-[#f5f1ea]">
            <Bell className="size-5" />
          </button>
          <div className="grid size-11 place-items-center rounded-full bg-[#c49a42] font-bold text-white">A</div>
        </div>
      </div>
    </header>
  )
}
