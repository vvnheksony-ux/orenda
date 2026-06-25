'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import CreateUserModal from './CreateUserModal'

export default function UsersHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="flex items-center justify-between gap-2">
        <h1 className="m-0 text-[20px] font-bold text-[#2b2823]">Users</h1>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#b98a3a] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#a57a31]"
          onClick={() => setOpen(true)}
          type="button"
        >
          <Plus className="size-4" />
          Add User
        </button>
      </header>
      <CreateUserModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
