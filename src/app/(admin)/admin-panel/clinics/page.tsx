import { Edit, Eye, Trash2 } from 'lucide-react'
import { AdminPageFrame } from '@/components/admin/AdminManagementPage'

const clinics = [
  { name: 'Cardiology', description: 'Heart and cardiovascular care', services: '5', doctors: '5' },
  { name: 'Pediatrics', description: "Children's health and development", services: '5', doctors: '4' },
  { name: 'Orthopedics', description: 'Bone and joint treatment', services: '5', doctors: '6' },
  { name: 'Dermatology', description: 'Skin conditions and treatment', services: '5', doctors: '3' },
  { name: 'Neurology', description: 'Brain and nervous system', services: '5', doctors: '4' },
  { name: 'Emergency', description: '24/7 emergency care', services: '5', doctors: '8' },
]

export default function ClinicsPage() {
  return (
    <AdminPageFrame title="Clinics" breadcrumb="Hospital > Clinics" searchPlaceholder="Search clinics..." primaryActionLabel="Add Clinics">
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {clinics.map((clinic) => (
          <article key={clinic.name} className="rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(53,42,22,0.08)] ring-1 ring-[#f0ece4]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#2d2b28]">{clinic.name}</h2>
                <p className="mt-4 text-sm text-[#918b82]">{clinic.description}</p>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label={`View ${clinic.name}`} className="grid size-8 place-items-center rounded-lg text-[#8f8b84] transition hover:bg-[#f4f1ea]">
                  <Eye className="size-4" />
                </button>
                <button aria-label={`Edit ${clinic.name}`} className="grid size-8 place-items-center rounded-lg text-[#1687e5] transition hover:bg-[#edf7ff]">
                  <Edit className="size-4" />
                </button>
                <button aria-label={`Delete ${clinic.name}`} className="grid size-8 place-items-center rounded-lg text-[#f04455] transition hover:bg-[#fff0f2]">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <dl className="mt-5 space-y-3 border-t border-[#efede8] pt-4 text-sm text-[#918b82]">
              <div className="flex items-center justify-between">
                <dt>Total Services</dt>
                <dd className="font-bold text-[#b38531]">{clinic.services}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Total Doctors</dt>
                <dd className="font-bold text-[#b38531]">{clinic.doctors}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </AdminPageFrame>
  )
}
