'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import type { CombinedUser } from '@/lib/admin/users'

export default function UserDeleteButton({ user }: { user: CombinedUser }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Safeguard: hide the delete button for admin/super-admin users
  if (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'super-admin') return null

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return

    startTransition(async () => {
      const isPayload = user.source === 'Payload'
      
      // If it's not Payload, we assume it's a Supabase operation (profiles)
      const opSlug = 'profiles'

      const endpoint = isPayload 
        ? `/api/users/${user.id}` 
        : `/api/admin/operations/${opSlug}/${user.id}`

      const response = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete user.')
      }
    })
  }

  return (
    <button
      className="orienda-table-action orienda-table-action--delete"
      disabled={isPending}
      onClick={handleDelete}
      type="button"
    >
      <Trash2 size={15} />
    </button>
  )
}
