import { Edit, Eye, ImageIcon, Trash2 } from 'lucide-react'
import { AdminPageFrame } from '@/components/admin/AdminManagementPage'

const centers = Array.from({ length: 5 }, (_, index) => ({
  id: `center-${index}`,
  title: 'Center of Excellence Title',
  success: '99%',
  surgeries: '99%',
  satisfaction: '99%',
  testimonials: '4',
  author: 'admin@orienda.com',
  updated: '2 days ago',
}))

export default function PromotionPurchasePage() {
  return (
    <AdminPageFrame title="Promotion Purchases" breadcrumb="Hospital > Promotion Purchases" searchPlaceholder="Search Promotion Purchases..." primaryActionLabel="Add Promotion Purchase">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {centers.map((center) => (
          <article key={center.id} className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(53,42,22,0.08)] ring-1 ring-[#f0ece4]">
            <div className="grid h-44 place-items-center bg-[#efede8] text-[#bd8d35]">
              <ImageIcon className="size-8" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-sm font-bold text-[#2d2b28]">{center.title}</h2>
                <div className="flex items-center gap-1">
                  <button aria-label={`View ${center.title}`} className="grid size-7 place-items-center rounded-lg text-[#8f8b84] transition hover:bg-[#f4f1ea]">
                    <Eye className="size-4" />
                  </button>
                  <button aria-label={`Edit ${center.title}`} className="grid size-7 place-items-center rounded-lg text-[#1687e5] transition hover:bg-[#edf7ff]">
                    <Edit className="size-4" />
                  </button>
                  <button aria-label={`Delete ${center.title}`} className="grid size-7 place-items-center rounded-lg text-[#f04455] transition hover:bg-[#fff0f2]">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7f7a72]">
                <span>Success: {center.success}</span>
                <span>Surgeries: {center.surgeries}</span>
                <span>Satisfactions: {center.satisfaction}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#7f7a72]">
                <span>Testimonials:</span>
                <span className="font-bold text-[#b38531]">{center.testimonials}</span>
              </div>
              <div className="mt-3 border-t border-[#efede8] pt-3 text-xs leading-5 text-[#7f7a72]">
                <p>By: {center.author}</p>
                <p>{center.updated}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AdminPageFrame>
  )
}
