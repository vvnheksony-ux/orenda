'use client'

import { Camera, KeyRound, Save, ShieldCheck, UploadCloud, UserRound } from 'lucide-react'
import { useMemo, useRef, useState, useTransition } from 'react'

export type SettingsUser = {
  avatar?: { url?: string | null } | number | string | null
  id?: number | string
  name?: string | null
  email?: string | null
  role?: string | null
}

type SaveResponse = {
  error?: string
  user?: SettingsUser
}

type Notice = {
  tone: 'error' | 'success'
  text: string
}

export default function SettingsForm({ user }: { user: SettingsUser | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(user?.name || 'Admin Username')
  const [email, setEmail] = useState(user?.email || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetPassword, setResetPassword] = useState(false)
  const initialAvatar = getAvatarUrl(user?.avatar)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(initialAvatar)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [isPending, startTransition] = useTransition()

  const initial = useMemo(() => ({ email: user?.email || '', name: user?.name || 'Admin Username' }), [user?.email, user?.name])
  const initialChar = (name || email || 'A').trim().charAt(0).toUpperCase()

  function cancel() {
    setName(initial.name)
    setEmail(initial.email)
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setResetPassword(false)
    setAvatarFile(null)
    setPreview(initialAvatar)
    setNotice(null)
  }

  function save() {
    setNotice(null)

    if (!name.trim()) {
      setNotice({ tone: 'error', text: 'Name is required.' })
      return
    }

    if (!email.trim()) {
      setNotice({ tone: 'error', text: 'Email is required.' })
      return
    }

    if (newPassword || confirmPassword || oldPassword) {
      if (!resetPassword && !oldPassword) {
        setNotice({ tone: 'error', text: 'Enter your old password or choose reset password.' })
        return
      }

      if (newPassword.length < 8) {
        setNotice({ tone: 'error', text: 'New password must be at least 8 characters.' })
        return
      }

      if (newPassword !== confirmPassword) {
        setNotice({ tone: 'error', text: 'New password and confirmation do not match.' })
        return
      }
    }

    startTransition(async () => {
      const body = new FormData()
      body.set('confirmPassword', confirmPassword)
      body.set('email', email.trim())
      body.set('name', name.trim())
      body.set('newPassword', newPassword)
      body.set('oldPassword', oldPassword)
      body.set('resetPassword', resetPassword ? 'true' : 'false')
      if (avatarFile) body.set('avatar', avatarFile)

      const response = await fetch('/api/admin/settings/profile', {
        body,
        credentials: 'include',
        method: 'PATCH',
      })
      const data = (await response.json().catch(() => null)) as SaveResponse | null

      if (!response.ok) {
        setNotice({ tone: 'error', text: data?.error || 'Failed to save settings.' })
        return
      }

      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setResetPassword(false)
      setAvatarFile(null)
      setNotice({ tone: 'success', text: 'Settings saved successfully.' })
      if (data?.user?.name) setName(data.user.name)
      if (data?.user?.email) setEmail(data.user.email)
      setPreview(getAvatarUrl(data?.user?.avatar) || preview)
    })
  }

  return (
    <section className="max-w-5xl pb-10">
      {notice ? (
        <div className={`mb-5 rounded-2xl border px-5 py-4 text-sm font-semibold ${notice.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {notice.text}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#eee8dd] bg-white p-6 shadow-[0_8px_24px_rgb(50_39_24_/_8%)] md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <UserRound className="text-[#b89148]" size={24} />
          <h2 className="m-0 text-xl font-bold text-[#2b2823]">Profile Settings</h2>
        </div>

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            className="group flex size-36 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-[#9b9893] bg-[#fbfaf8] text-[#8c8982] transition-colors hover:border-[#b89148] hover:text-[#b89148]"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {preview ? <span aria-label="Profile preview" className="h-full w-full bg-cover bg-center" role="img" style={{ backgroundImage: `url(${preview})` }} /> : <><UploadCloud size={34} /><span className="text-sm font-semibold">Upload Photo</span></>}
          </button>
          <div>
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-[#c39a43] text-lg font-bold text-white">{initialChar}</div>
            <p className="m-0 text-sm font-bold text-[#2b2823]">{name || 'Admin Username'}</p>
            <p className="mb-3 mt-1 text-sm text-[#716b60]">{user?.role || 'admin'}</p>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#e7dfd5] bg-white px-4 py-2 text-sm font-bold text-[#2b2823]" onClick={() => fileInputRef.current?.click()} type="button">
              <Camera size={16} /> Choose photo
            </button>
            <p className="mb-0 mt-2 text-xs text-[#8c8982]">JPG, PNG, WebP, GIF, or SVG. Uploaded photos are saved to your profile.</p>
          </div>
          <input
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              setAvatarFile(file || null)
              setPreview(file ? URL.createObjectURL(file) : null)
              event.target.value = ''
            }}
            ref={fileInputRef}
            type="file"
          />
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#716b60]">Name</span>
            <input className="h-12 rounded-xl border border-[#ded8cf] px-4 text-base text-[#2b2823] outline-none focus:border-[#b89148]" disabled={isPending} onChange={(event) => setName(event.target.value)} value={name} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#716b60]">Email</span>
            <input className="h-12 rounded-xl border border-[#ded8cf] px-4 text-base text-[#2b2823] outline-none focus:border-[#b89148]" disabled={isPending} onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          </label>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-[#eee8dd] bg-white p-6 shadow-[0_8px_24px_rgb(50_39_24_/_8%)] md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <KeyRound className="text-[#b89148]" size={24} />
            <h2 className="m-0 text-xl font-bold text-[#2b2823]">Update Password</h2>
          </div>
          <label className="inline-flex items-center gap-2 rounded-full bg-[#f7f1e7] px-4 py-2 text-sm font-bold text-[#7d612d]">
            <input checked={resetPassword} className="accent-[#b89148]" disabled={isPending} onChange={(event) => setResetPassword(event.target.checked)} type="checkbox" />
            Reset password
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-[#716b60]">Old Password</span>
          <input className="h-12 rounded-xl border border-[#ded8cf] px-4 text-base text-[#2b2823] outline-none focus:border-[#b89148] disabled:bg-[#f6f3ee]" disabled={isPending || resetPassword} onChange={(event) => setOldPassword(event.target.value)} type="password" value={oldPassword} />
        </label>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#716b60]">New password</span>
            <input className="h-12 rounded-xl border border-[#ded8cf] px-4 text-base text-[#2b2823] outline-none focus:border-[#b89148]" disabled={isPending} onChange={(event) => setNewPassword(event.target.value)} type="password" value={newPassword} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#716b60]">Confirm password</span>
            <input className="h-12 rounded-xl border border-[#ded8cf] px-4 text-base text-[#2b2823] outline-none focus:border-[#b89148]" disabled={isPending} onChange={(event) => setConfirmPassword(event.target.value)} type="password" value={confirmPassword} />
          </label>
        </div>

        <p className="mt-4 inline-flex items-center gap-2 text-sm text-[#716b60]"><ShieldCheck size={16} /> Leave password fields blank to only update profile information.</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border-none bg-[#b89148] px-7 text-sm font-bold text-white shadow-sm hover:bg-[#a37d3e] disabled:opacity-60" disabled={isPending} onClick={save} type="button">
          <Save size={18} /> {isPending ? 'Saving...' : 'Save All Settings'}
        </button>
        <button className="h-14 rounded-xl border-none bg-[#ebe7e1] px-7 text-sm font-bold text-[#2b2823] hover:bg-[#ded8cf]" disabled={isPending} onClick={cancel} type="button">Cancel</button>
      </div>
    </section>
  )
}

function getAvatarUrl(avatar: SettingsUser['avatar']) {
  return avatar && typeof avatar === 'object' && typeof avatar.url === 'string' ? avatar.url : null
}
