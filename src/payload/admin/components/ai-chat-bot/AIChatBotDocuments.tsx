'use client'

import { Eye, FileText, Pencil, Search, Trash2, Upload } from 'lucide-react'
import { useMemo, useRef, useState, useTransition } from 'react'

import type { AITrainingDocument } from './AIChatBotAdminView'

type DocumentForm = {
  title: string
  status: string
  content: string
}

const defaultForm: DocumentForm = {
  title: '',
  status: 'draft',
  content: '',
}

export default function AIChatBotDocuments({ initialDocuments }: { initialDocuments: AITrainingDocument[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState(initialDocuments)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<DocumentForm>(defaultForm)
  const [file, setFile] = useState<File | null>(null)
  const [editing, setEditing] = useState<AITrainingDocument | null>(null)
  const [viewing, setViewing] = useState<AITrainingDocument | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return documents
    return documents.filter((doc) => [getTitle(doc), getStatus(doc), getAuthor(doc), doc.content, doc.description]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q)))
  }, [documents, search])

  function beginCreate() {
    setEditing(null)
    setForm(defaultForm)
    setFile(null)
    setError(null)
    fileInputRef.current?.click()
  }

  function beginEdit(doc: AITrainingDocument) {
    setEditing(doc)
    setForm({
      title: getTitle(doc),
      status: getStatus(doc),
      content: typeof doc.content === 'string' ? doc.content : typeof doc.description === 'string' ? doc.description : '',
    })
    setFile(null)
    setError(null)
  }

  function submit() {
    setError(null)
    startTransition(async () => {
      const body = new FormData()
      body.set('title', form.title)
      body.set('status', form.status)
      body.set('content', form.content)
      if (file) body.set('file', file)

      const response = await fetch(editing ? `/api/admin/ai-documents/${editing.id}` : '/api/admin/ai-documents', {
        body,
        credentials: 'include',
        method: editing ? 'PATCH' : 'POST',
      })

      const data = (await response.json().catch(() => null)) as { document?: AITrainingDocument; error?: string } | null
      if (!response.ok || !data?.document) {
        setError(data?.error || 'Failed to save document.')
        return
      }

      setDocuments((current) => editing
        ? current.map((doc) => doc.id === data.document!.id ? data.document! : doc)
        : [data.document!, ...current])
      setEditing(null)
      setForm(defaultForm)
      setFile(null)
    })
  }

  function deleteDocument(doc: AITrainingDocument) {
    if (!window.confirm(`Delete ${getTitle(doc)}?`)) return
    setError(null)
    startTransition(async () => {
      const response = await fetch(`/api/admin/ai-documents/${doc.id}`, {
        credentials: 'include',
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        setError(data?.error || 'Failed to delete document.')
        return
      }

      setDocuments((current) => current.filter((item) => item.id !== doc.id))
      if (viewing?.id === doc.id) setViewing(null)
    })
  }

  return (
    <section className="flex flex-col gap-5 pb-10">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8c8982]" />
          <input
            className="h-16 w-full rounded-xl border border-[#e4ded5] bg-white pl-11 pr-4 text-md text-[#393733] shadow-sm outline-none placeholder:text-[#aaa6a0]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search AI Chat Bot..."
            type="search"
            value={search}
          />
        </label>
        <button
          className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border-none bg-[#b89148] px-6 text-sm font-bold text-white shadow-sm hover:bg-[#a37d3e]"
          onClick={beginCreate}
          type="button"
        >
          <Upload size={18} /> Upload Document
        </button>
      </div>

      <input
        className="hidden"
        onChange={(event) => {
          const selected = event.target.files?.[0] || null
          setFile(selected)
          if (selected) {
            setEditing(null)
            setForm((current) => ({ ...current, title: current.title || selected.name }))
          }
          event.target.value = ''
        }}
        ref={fileInputRef}
        type="file"
      />

      {(file || editing) ? (
        <DocumentEditor
          disabled={isPending}
          editing={editing}
          file={file}
          form={form}
          onCancel={() => {
            setEditing(null)
            setFile(null)
            setForm(defaultForm)
          }}
          onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
          onChooseFile={() => fileInputRef.current?.click()}
          onSubmit={submit}
        />
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#e7dfd5] bg-white shadow-[0_8px_24px_rgb(50_39_24_/_8%)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-[#efebe4] text-[#716b60]">
              <tr>
                <th className="px-5 py-4 font-bold">Thumbnail</th>
                <th className="px-5 py-4 font-bold">Title</th>
                <th className="px-5 py-4 font-bold">Size</th>
                <th className="px-5 py-4 font-bold">Status</th>
                <th className="px-5 py-4 font-bold">Last Edited</th>
                <th className="px-5 py-4 font-bold">Author</th>
                <th className="px-5 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((doc) => (
                <tr className="border-t border-[#eee8dd] text-[#393733]" key={doc.id}>
                  <td className="px-5 py-4"><FileText className="text-[#2f80ed]" size={30} /></td>
                  <td className="px-5 py-4 font-medium">{getTitle(doc)}</td>
                  <td className="px-5 py-4 text-[#716b60]">{formatSize(getMetadataValue(doc, 'fileSize') ?? doc.file_size ?? doc.size)}</td>
                  <td className="px-5 py-4"><StatusPill status={getStatus(doc)} /></td>
                  <td className="px-5 py-4 text-[#716b60]">{formatRelativeDate((getMetadataValue(doc, 'updatedAt') ?? doc.updated_at) || doc.last_edited_at || doc.created_at)}</td>
                  <td className="px-5 py-4 text-[#716b60]">{getAuthor(doc)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <button aria-label="View document" className="border-none bg-transparent p-1 text-[#8c8982]" onClick={() => setViewing(doc)} type="button"><Eye size={18} /></button>
                      <button aria-label="Edit document" className="border-none bg-transparent p-1 text-[#8c8982]" onClick={() => beginEdit(doc)} type="button"><Pencil size={18} /></button>
                      <button aria-label="Delete document" className="border-none bg-transparent p-1 text-[#e5484d]" onClick={() => deleteDocument(doc)} type="button"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td className="px-5 py-8 text-center text-[#716b60]" colSpan={7}>No AI training documents found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewing ? <DocumentViewer document={viewing} onClose={() => setViewing(null)} /> : null}
    </section>
  )
}

function DocumentEditor({ disabled, editing, file, form, onCancel, onChange, onChooseFile, onSubmit }: { disabled: boolean; editing: AITrainingDocument | null; file: File | null; form: DocumentForm; onCancel: () => void; onChange: (key: keyof DocumentForm, value: string) => void; onChooseFile: () => void; onSubmit: () => void }) {
  return (
    <div className="rounded-2xl border border-[#e7dfd5] bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-lg font-bold text-[#2b2823]">{editing ? 'Edit Document' : 'Upload Document'}</h2>
          <p className="mb-0 mt-1 text-sm text-[#716b60]">{file ? file.name : 'Update training document metadata and searchable content.'}</p>
        </div>
        <button className="rounded-xl border border-[#e7dfd5] bg-white px-4 py-2 font-bold text-[#2b2823]" onClick={onChooseFile} type="button">Choose File</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-[#716b60]">Title</span>
          <input className="rounded-xl border border-[#e7dfd5] px-4 py-3" disabled={disabled} onChange={(event) => onChange('title', event.target.value)} value={form.title} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-[#716b60]">Status</span>
          <select className="rounded-xl border border-[#e7dfd5] px-4 py-3" disabled={disabled} onChange={(event) => onChange('status', event.target.value)} value={form.status}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-bold text-[#716b60]">Training Text</span>
          <textarea className="min-h-32 rounded-xl border border-[#e7dfd5] px-4 py-3" disabled={disabled} onChange={(event) => onChange('content', event.target.value)} value={form.content} />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="rounded-xl border-none bg-[#b89148] px-6 py-3 font-bold text-white" disabled={disabled} onClick={onSubmit} type="button">{editing ? 'Save Changes' : 'Upload Document'}</button>
        <button className="rounded-xl border-none bg-[#ebe7e1] px-6 py-3 font-bold text-[#2b2823]" disabled={disabled} onClick={onCancel} type="button">Cancel</button>
      </div>
    </div>
  )
}

function DocumentViewer({ document, onClose }: { document: AITrainingDocument; onClose: () => void }) {
  const url = typeof document.file_url === 'string' ? document.file_url : typeof document.url === 'string' ? document.url : ''
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <section className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_18px_48px_rgb(50_39_24_/_20%)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="m-0 text-2xl font-bold text-[#2b2823]">{getTitle(document)}</h2>
            <p className="mb-0 mt-1 text-sm text-[#716b60]">{String(getMetadataValue(document, 'mimeType') || document.mime_type || 'Training document')} · {formatSize(getMetadataValue(document, 'fileSize') ?? document.file_size ?? document.size)}</p>
          </div>
          <button className="rounded-xl border-none bg-[#ebe7e1] px-4 py-2 font-bold text-[#2b2823]" onClick={onClose} type="button">Close</button>
        </div>
        {url ? <a className="mb-4 inline-flex rounded-xl bg-[#b89148] px-5 py-3 font-bold text-white no-underline" href={url} rel="noreferrer" target="_blank">Open File</a> : null}
        <pre className="whitespace-pre-wrap rounded-xl bg-[#f7f4ef] p-4 text-sm leading-6 text-[#393733]">{String(document.content || document.description || 'No preview content stored for this document.')}</pre>
      </section>
    </div>
  )
}

function StatusPill({ status }: { status?: string | null }) {
  const value = status || 'draft'
  const published = value === 'published'
  return <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${published ? 'bg-[#dcf7e9] text-[#178348]' : 'bg-[#ebe7e1] text-[#716b60]'}`}>{value}</span>
}

function getTitle(doc: AITrainingDocument) {
  return String(getMetadataValue(doc, 'title') || getMetadataValue(doc, 'fileName') || doc.title || doc.name || doc.file_name || doc.filename || 'Untitled document')
}

function getAuthor(doc: AITrainingDocument) {
  return String(getMetadataValue(doc, 'authorEmail') || doc.author_email || doc.author || 'admin@orienda.com')
}

function getStatus(doc: AITrainingDocument) {
  return String(getMetadataValue(doc, 'status') || doc.status || 'draft')
}

function getMetadataValue(doc: AITrainingDocument, key: string) {
  return doc.metadata && typeof doc.metadata === 'object' ? doc.metadata[key] : undefined
}

function formatSize(value: unknown) {
  const bytes = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : 0
  if (!Number.isFinite(bytes) || bytes <= 0) return '-'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10}MB`
}

function formatRelativeDate(value: unknown) {
  if (typeof value !== 'string') return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const diff = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.round(diff / 60000))
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return date.toLocaleDateString()
}
