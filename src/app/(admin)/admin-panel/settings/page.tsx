import { AdminPageFrame } from '@/components/admin/AdminManagementPage'

export default function SettingsPage() {
  return (
    <AdminPageFrame title="Settings" breadcrumb="Systems > Settings">
      <section className="rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(53,42,22,0.08)] ring-1 ring-[#f0ece4]">
        <h2 className="text-lg font-bold text-[#2d2b28]">System Settings</h2>
        <p className="mt-2 text-sm text-[#918b82]">Configure staff portal settings here.</p>
      </section>
    </AdminPageFrame>
  )
}
