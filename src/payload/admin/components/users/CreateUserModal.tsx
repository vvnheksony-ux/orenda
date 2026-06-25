'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

type Role = {
  id: number
  code: string
  name: string
}

type CreateUserModalProps = {
  open: boolean
  onClose: () => void
}

function generatePassword(length = 16) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [roles, setRoles] = useState<Role[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    fetch('/api/admin/roles', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: { roles?: Role[] }) => setRoles(data.roles || []))
      .catch(() => {})
  }, [open])

  function reset() {
    setName('')
    setEmail('')
    setPassword('')
    setRoleId('')
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleGenerate() {
    setPassword(generatePassword())
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    startTransition(async () => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name || undefined,
          roleId: roleId || undefined,
        }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        setError(data?.error || 'Failed to create user.')
        return
      }

      toast.success('User created')
      router.refresh()
      handleClose()
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <section className="w-full max-w-md rounded-2xl border border-[#e7dfd5] bg-white p-6 shadow-[0_18px_48px_rgb(50_39_24_/_20%)]">
        <h2 className="m-0 text-2xl font-bold text-[#2b2823]">Create User</h2>
        <p className="mb-5 mt-2 text-sm leading-6 text-[#716b60]">
          Add a new admin panel user with login credentials.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-[#716b60]">Name</span>
            <input
              className="rounded-xl border border-[#e7dfd5] px-4 py-3 text-base"
              disabled={isPending}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              type="text"
              value={name}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-[#716b60]">Email *</span>
            <input
              className="rounded-xl border border-[#e7dfd5] px-4 py-3 text-base"
              disabled={isPending}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-[#716b60]">Password *</span>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-[#e7dfd5] px-4 py-3 text-base"
                disabled={isPending}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                type="text"
                value={password}
              />
              <button
                className="shrink-0 rounded-xl border border-[#e7dfd5] bg-[#f4f1ea] px-4 py-3 text-sm font-bold text-[#716b60] transition hover:bg-[#ebe7e1]"
                disabled={isPending}
                onClick={handleGenerate}
                type="button"
              >
                Generate
              </button>
            </div>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-[#716b60]">Role</span>
            <select
              className="rounded-xl border border-[#e7dfd5] px-4 py-3 text-base"
              disabled={isPending}
              onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : '')}
              value={roleId}
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-2 flex flex-wrap justify-end gap-3">
            <button
              className="rounded-xl border-none bg-[#ebe7e1] px-5 py-3 font-bold text-[#2b2823]"
              disabled={isPending}
              onClick={handleClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-xl border-none bg-[#b89148] px-5 py-3 font-bold text-white disabled:opacity-50"
              disabled={isPending}
              type="submit"
            >
              {isPending ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
