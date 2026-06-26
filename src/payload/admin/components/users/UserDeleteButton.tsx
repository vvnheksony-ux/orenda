'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import ConfirmModal from '../ui/ConfirmModal'

import type { CombinedUser } from '@/lib/admin/users'

export default function UserDeleteButton({ user }: { user: CombinedUser }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void; danger?: boolean } | null>(null)

  // Safeguard: hide the delete button for admin users
  if (user.role?.toLowerCase() === 'admin') return null

  const handleDelete = () => {
    setConfirm({
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      onConfirm: () => {
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
      },
    })
  }

  return (
    <>
      {confirm ? <ConfirmModal {...confirm} confirmLabel="Delete" danger onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null) }} /> : null}
      <button
        className="orienda-table-action orienda-table-action--delete"
        disabled={isPending}
        onClick={handleDelete}
        type="button"
      >
        <Trash2 size={15} />
      </button>
    </>
  )
}
