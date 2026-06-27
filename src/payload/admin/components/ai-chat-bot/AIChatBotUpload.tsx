'use client'

import { FileText, Trash2, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { ConfirmationModal, useModal } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import ConfirmModal from '../ui/ConfirmModal'
import type { UploadRecord } from './AIChatBotUploadView'

const LEAVE_MODAL_SLUG = 'upload-leave-without-saving'

export default function AIChatBotUpload({ initialUploads }: { initialUploads: UploadRecord[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = useState(initialUploads)
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Staged file waiting for title/description input before upload
  const [staged, setStaged] = useState<{ file: File; title: string; description: string } | null>(null)

  const { openModal, closeModal } = useModal()
  const router = useRouter()
  const pendingHref = useRef<string | null>(null)
  const isDirtyRef = useRef(false)

  // isDirty when staged (file selected but not yet uploaded) or uploading in progress
  const isDirty = staged !== null || isPending
  useEffect(() => { isDirtyRef.current = isDirty }, [isDirty])

  // Block browser close/reload
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return
      e.preventDefault(); e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // Intercept SPA link clicks
  const handleClick = useCallback((e: MouseEvent) => {
    if (!isDirtyRef.current) return
    let el = e.target as HTMLElement | null
    while (el && el.tagName.toLowerCase() !== 'a') el = el.parentElement
    if (!el) return
    const anchor = el as HTMLAnchorElement
    const href = anchor.href
    if (!href || href === window.location.href || anchor.target === '_blank' || anchor.download) return
    e.preventDefault(); e.stopPropagation()
    pendingHref.current = href
    openModal(LEAVE_MODAL_SLUG)
  }, [openModal])

  useEffect(() => {
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [handleClick])

  function pickFile() {
    fileInputRef.current?.click()
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setError(null)
    // Pre-fill title from filename (strip extension)
    const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
    setStaged({ file, title, description: '' })
  }

  function cancelStaged() {
    setStaged(null)
    setError(null)
  }

  function submitUpload() {
    if (!staged) return
    const { file, title, description } = staged
    if (!title.trim()) { setError('Title is required'); return }
    setError(null)
    setStaged(null)
    startTransition(async () => {
      const form = new FormData()
      form.set('file', file)
      form.set('title', title.trim())
      if (description.trim()) form.set('description', description.trim())
      const res = await fetch('/api/admin/ai-upload', { method: 'POST', credentials: 'include', body: form })
      const data = await res.json().catch(() => null)
      if (!res.ok) { setError(data?.error || 'Upload failed'); return }
      const listRes = await fetch('/api/admin/ai-upload', { credentials: 'include' })
      const listData = await listRes.json().catch(() => null)
      if (listData?.uploads) setUploads(listData.uploads)
    })
  }

  function deleteUpload(id: string, filename: string | null) {
    setConfirm({
      message: `Delete "${filename || 'this file'}"? This cannot be undone.`,
      onConfirm: () => startTransition(async () => {
        const res = await fetch(`/api/admin/ai-upload/${id}`, { method: 'DELETE', credentials: 'include' })
        if (!res.ok) { const d = await res.json().catch(() => null); setError(d?.error || 'Delete failed'); return }
        setUploads(curr => curr.filter(u => u.id !== id))
      }),
    })
  }

  function leaveAnyway() {
    closeModal(LEAVE_MODAL_SLUG)
    const href = pendingHref.current
    if (href) router.push(href)
  }

  return (
    <section className="flex flex-col gap-5 pb-10">
      <ConfirmationModal
        body="Your upload has not been completed. If you leave now, your progress will be lost."
        cancelLabel="Stay on this page"
        confirmLabel="Leave anyway"
        heading="Leave without saving"
        modalSlug={LEAVE_MODAL_SLUG}
        onCancel={() => closeModal(LEAVE_MODAL_SLUG)}
        onConfirm={leaveAnyway}
      />
      {confirm ? <ConfirmModal {...confirm} confirmLabel="Delete" danger onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null) }} /> : null}
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {/* Step 1: drop zone — hidden while staged */}
      {!staged ? (
        <div className="rounded-2xl border-2 border-dashed border-[#e7dfd5] bg-white p-10 text-center">
          <FileText className="mx-auto mb-3 text-[#c2b49d]" size={40} />
          <p className="mb-1 text-sm font-bold text-[#2b2823]">Upload a miscellaneous document</p>
          <p className="mb-4 text-xs text-[#716b60]">PDF, DOCX, DOC, TXT, MD · max 10MB · tagged as &quot;other&quot; in AI search</p>
          <button
            className="inline-flex h-12 items-center gap-2 rounded-xl border-none bg-[#b89148] px-6 text-sm font-bold text-white hover:bg-[#a37d3e] disabled:opacity-60"
            disabled={isPending}
            onClick={pickFile}
            type="button"
          >
            <Upload size={16} /> {isPending ? 'Uploading...' : 'Choose File'}
          </button>
          <input accept=".pdf,.txt,.md,.docx,.doc" className="hidden" onChange={onFileSelect} ref={fileInputRef} type="file" />
        </div>
      ) : (
        /* Step 2: title + description form before confirming upload */
        <div className="rounded-2xl border border-[#e7dfd5] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="shrink-0 text-[#2f80ed]" size={20} />
              <span className="text-sm font-bold text-[#2b2823] break-all">{staged.file.name}</span>
              <span className="text-xs text-[#8c8982]">({formatSize(staged.file.size)})</span>
            </div>
            <button type="button" onClick={cancelStaged} className="shrink-0 rounded-lg border-none bg-transparent p-1 text-[#8c8982] hover:text-[#e5484d]">
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#716b60]">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border border-[#e7dfd5] px-4 py-2.5 text-sm text-[#2b2823] outline-none focus:border-[#b89148]"
                placeholder="e.g. 2024 Annual Report, Hospital Policy Manual..."
                value={staged.title}
                onChange={e => setStaged(s => s ? { ...s, title: e.target.value } : s)}
              />
              <p className="mt-1 text-xs text-[#8c8982]">Used as the document title in AI search results.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#716b60]">
                Description <span className="text-[#aaa6a0]">(optional)</span>
              </label>
              <textarea
                className="w-full resize-none rounded-xl border border-[#e7dfd5] px-4 py-2.5 text-sm text-[#2b2823] outline-none focus:border-[#b89148]"
                placeholder="Briefly describe what this document is about so the AI can use it as context..."
                rows={3}
                value={staged.description}
                onChange={e => setStaged(s => s ? { ...s, description: e.target.value } : s)}
              />
            </div>

            <div className="flex gap-3">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl border-none bg-[#b89148] px-5 text-sm font-bold text-white hover:bg-[#a37d3e] disabled:opacity-60"
                disabled={isPending || !staged.title.trim()}
                onClick={submitUpload}
                type="button"
              >
                <Upload size={14} /> Upload &amp; Embed
              </button>
              <button
                className="h-10 rounded-xl border border-[#e7dfd5] bg-white px-5 text-sm font-bold text-[#716b60] hover:bg-[#f4f0eb]"
                onClick={cancelStaged}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {uploads.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[#e7dfd5] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#efebe4] text-[#716b60]">
                <tr>
                  <th className="px-5 py-3 font-bold">Document</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Size</th>
                  <th className="px-5 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map(u => (
                  <tr className="border-t border-[#eee8dd] text-[#393733]" key={u.id}>
                    <td className="px-5 py-3 max-w-xs">
                      <div className="flex items-start gap-2">
                        <FileText className="mt-0.5 shrink-0 text-[#2f80ed]" size={18} />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#2b2823]">{u.title || u.filename || '-'}</p>
                          <p className="truncate text-xs text-[#8c8982]">{u.filename}</p>
                          {u.description ? <p className="mt-0.5 line-clamp-2 text-xs text-[#716b60]">{u.description}</p> : null}
                          {u.status === 'error' && u.error ? (
                            <p className="mt-1 text-xs text-red-600">⚠ {u.error}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={u.status} />
                    </td>
                    <td className="px-5 py-3 text-[#716b60]">{formatSize(u.size_bytes)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        {u.url ? (
                          <a href={u.url} target="_blank" rel="noreferrer" className="border-none bg-transparent p-1 text-[#8c8982] no-underline">
                            <FileText size={16} />
                          </a>
                        ) : null}
                        <button aria-label="Delete" className="border-none bg-transparent p-1 text-[#e5484d]" onClick={() => deleteUpload(u.id, u.filename)} type="button">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-[#8c8982]">No files uploaded yet.</p>
      )}
    </section>
  )
}

function StatusPill({ status }: { status?: string | null }) {
  const s = status || 'pending'
  const cls = s === 'embedded' ? 'bg-[#dcf7e9] text-[#178348]'
    : s === 'error' ? 'bg-red-50 text-red-700'
    : 'bg-[#ebe7e1] text-[#716b60]'
  return <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${cls}`}>{s}</span>
}

function formatSize(bytes: number | null | undefined) {
  if (bytes == null || bytes <= 0) return '-'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10}MB`
}
