import { Edit, Eye, Plus, Trash2 } from 'lucide-react'
import { AdminPageFrame } from '@/components/admin/AdminManagementPage'

const roles = [
  {
    name: 'admin',
    description: 'Full system access and control',
    users: '3',
    permissions: ['All Permissions'],
  },
  {
    name: 'editor',
    description: 'Content management and publishing access',
    users: '8',
    permissions: ['Manage Content', 'Manage Hospital', 'View Reports'],
  },
  {
    name: 'contributor',
    description: 'Create and edit content with limited permissions',
    users: '12',
    permissions: ['Create Content', 'Edit Content', 'View Reports'],
  },
]

export default function RolesPage() {
  return (
    <AdminPageFrame title="Roles" breadcrumb="Identity > Roles">
      <div className="mb-6 flex justify-end">
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#b98a3a] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#a57a31]">
          <Plus className="size-4" />
          Create Role
        </button>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        {roles.map((role) => (
          <article key={role.name} className="rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(53,42,22,0.08)] ring-1 ring-[#f0ece4]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#2d2b28]">{role.name}</h2>
                <p className="mt-2 text-sm text-[#918b82]">{role.description}</p>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label={`View ${role.name}`} className="grid size-8 place-items-center rounded-lg text-[#8f8b84] transition hover:bg-[#f4f1ea]">
                  <Eye className="size-4" />
                </button>
                <button aria-label={`Edit ${role.name}`} className="grid size-8 place-items-center rounded-lg text-[#1687e5] transition hover:bg-[#edf7ff]">
                  <Edit className="size-4" />
                </button>
                <button aria-label={`Delete ${role.name}`} className="grid size-8 place-items-center rounded-lg text-[#f04455] transition hover:bg-[#fff0f2]">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-[#efede8] pt-4 text-sm text-[#918b82]">
              <div className="flex items-center justify-between">
                <span>Users with this role</span>
                <span className="font-bold text-[#b38531]">{role.users}</span>
              </div>
              <p className="mt-4">Key Permissions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span key={permission} className="rounded bg-[#f3f1ed] px-3 py-1 text-xs font-medium text-[#77726b]">
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </AdminPageFrame>
  )
}
