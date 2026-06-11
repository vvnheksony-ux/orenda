import { Bell } from 'lucide-react'

export default function AdminHeader({ title, breadcrumb }: { title: string; breadcrumb: string }) {
  return (
    <header className="orienda-dashboard-header -mx-4 border-none bg-white/92 px-4 backdrop-blur">
      <div className="orienda-dashboard-header__inner flex items-center justify-between gap-4">
        <div>
          <h1 className="orienda-dashboard-header__title text-2xl font-bold tracking-tight text-[#242424]">{title}</h1>
          {/* <p className="orienda-dashboard-header__breadcrumb mt-1 text-sm text-[#8f8a82]">{breadcrumb}</p> */}
        </div>
        {/* <div className="orienda-dashboard-header__actions flex items-center gap-4">
          <button aria-label="Notifications" className="orienda-dashboard-header__button grid size-10 place-items-center rounded-full text-[#7c766d] transition hover:bg-[#f5f1ea]">
            <Bell className="size-5" />
          </button>
          <div className="orienda-dashboard-header__avatar grid size-11 place-items-center rounded-full bg-[#c49a42] font-bold text-white">A</div>
        </div> */}
      </div>
    </header>
  )
}
