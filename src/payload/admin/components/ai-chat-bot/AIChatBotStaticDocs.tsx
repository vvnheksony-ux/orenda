'use client'

import { Pencil, Upload } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { ConfirmationModal, useModal } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import type { StaticDoc } from './AIChatBotStaticDocsView'

const LEAVE_MODAL_SLUG = 'static-docs-leave-without-saving'
const DOC_TYPES = ['about', 'contact', 'policy', 'brand'] as const
type DocType = (typeof DOC_TYPES)[number]
const DOC_LABELS: Record<DocType, string> = { about: 'About', contact: 'Contact', policy: 'Policy', brand: 'Brand' }
const LOCALE_LABELS: Record<string, string> = { en: 'English', km: 'Khmer', zh: 'Chinese' }

function getContent(docs: StaticDoc[], docType: DocType, locale: string): string {
  return docs.find(d => d.doc_type === docType && d.locale === locale)?.content ?? ''
}

export default function AIChatBotStaticDocs({ initialDocs }: { initialDocs: StaticDoc[] }) {
  const searchParams = useSearchParams()
  const rawLocale = searchParams.get('locale') ?? 'en'
  const locale = ['en', 'km', 'zh'].includes(rawLocale) ? rawLocale : 'en'
  const localeLabel = LOCALE_LABELS[locale] ?? locale

  const [docs, setDocs] = useState(initialDocs)
  const [activeDoc, setActiveDoc] = useState<DocType>('about')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [editingKeys, setEditingKeys] = useState<Record<string, boolean>>({})
  const [savedKeys, setSavedKeys] = useState<Record<string, { embedded: boolean }>>({})
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isExtracting, startExtract] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { openModal, closeModal } = useModal()
  const router = useRouter()
  const pendingHref = useRef<string | null>(null)
  const isDirtyRef = useRef(false)

  const draftKey = `${activeDoc}:${locale}`
  const storedContent = getContent(docs, activeDoc, locale)
  const currentContent = drafts[draftKey] !== undefined ? drafts[draftKey] : storedContent
  const isDirty = drafts[draftKey] !== undefined && drafts[draftKey] !== storedContent
  const isEditing = editingKeys[draftKey] !== undefined ? editingKeys[draftKey] : !storedContent
  const justSaved = savedKeys[draftKey] != null && !isDirty

  useEffect(() => { isDirtyRef.current = isDirty }, [isDirty])

  // Block browser close/reload
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return
      e.preventDefault()
      e.returnValue = ''
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
    e.preventDefault()
    e.stopPropagation()
    pendingHref.current = href
    openModal(LEAVE_MODAL_SLUG)
  }, [openModal])

  useEffect(() => {
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [handleClick])

  function startEdit() {
    setEditingKeys(k => ({ ...k, [draftKey]: true }))
    setSavedKeys(k => { const n = { ...k }; delete n[draftKey]; return n })
    setError(null)
  }

  function cancelEdit() {
    setDrafts(d => { const n = { ...d }; delete n[draftKey]; return n })
    setEditingKeys(k => ({ ...k, [draftKey]: false }))
    setError(null)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!fileInputRef.current) return
    fileInputRef.current.value = ''
    if (!file) return
    setError(null)
    startExtract(async () => {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/ai-static-docs/extract', { method: 'POST', credentials: 'include', body: form })
      const data = await res.json().catch(() => null)
      if (!res.ok) { setError(data?.error || 'Text extraction failed'); return }
      const extracted: string = data.text ?? ''
      // Append to existing content with a newline separator
      setDrafts(d => {
        const existing = d[draftKey] !== undefined ? d[draftKey] : storedContent
        const joined = existing ? `${existing}\n\n${extracted}` : extracted
        return { ...d, [draftKey]: joined }
      })
      setEditingKeys(k => ({ ...k, [draftKey]: true }))
      setSavedKeys(k => { const n = { ...k }; delete n[draftKey]; return n })
    })
  }

  function handleChange(value: string) {
    setDrafts(d => ({ ...d, [draftKey]: value }))
    setSavedKeys(k => { const n = { ...k }; delete n[draftKey]; return n })
    setError(null)
  }

  async function save() {
    setIsSaving(true)
    setError(null)
    const res = await fetch('/api/admin/ai-static-docs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ doc_type: activeDoc, locale, content: currentContent }),
    })
    const data = await res.json().catch(() => null)
    setIsSaving(false)
    if (!res.ok || !data?.doc) { setError(data?.error || 'Save failed'); return }
    setDocs(curr => {
      const exists = curr.find(d => d.doc_type === activeDoc && d.locale === locale)
      return exists
        ? curr.map(d => d.doc_type === activeDoc && d.locale === locale ? data.doc : d)
        : [...curr, data.doc]
    })
    setDrafts(d => { const n = { ...d }; delete n[draftKey]; return n })
    setEditingKeys(k => ({ ...k, [draftKey]: false }))
    setSavedKeys(k => ({ ...k, [draftKey]: { embedded: !!data.embedded } }))
  }

  function leaveAnyway() {
    closeModal(LEAVE_MODAL_SLUG)
    const href = pendingHref.current
    if (href) router.push(href)
  }

  return (
    <section className="flex flex-col gap-5 pb-10">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md"
        className="hidden"
        onChange={handleFileSelect}
      />
      <ConfirmationModal
        body="Your changes have not been saved. If you leave now, you will lose your changes."
        cancelLabel="Stay on this page"
        confirmLabel="Leave anyway"
        heading="Leave without saving"
        modalSlug={LEAVE_MODAL_SLUG}
        onCancel={() => closeModal(LEAVE_MODAL_SLUG)}
        onConfirm={leaveAnyway}
      />

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="rounded-xl bg-[#f7f4ef] border border-[#e7dfd5] px-4 py-3 text-sm text-[#716b60]">
        Current locale: <strong className="text-[#2b2823]">{localeLabel}</strong> — change using the &ldquo;Locale&rdquo; dropdown in the top right corner. Content saved separately per language.
      </div>

      <div className="flex gap-2 flex-wrap">
        {DOC_TYPES.map(dt => (
          <button
            key={dt}
            type="button"
            onClick={() => { setActiveDoc(dt); setError(null) }}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold border-none transition-colors ${
              activeDoc === dt ? 'bg-[#b89148] text-white' : 'bg-[#ebe7e1] text-[#716b60] hover:bg-[#ddd7ce]'
            }`}
          >
            {DOC_LABELS[dt]}
            {getContent(docs, dt, locale).trim() ? <span className="ml-2 inline-block size-2 rounded-full bg-[#178348] align-middle" /> : null}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[#e7dfd5] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-[#716b60]">{DOC_LABELS[activeDoc]} · {localeLabel}</span>
          <div className="flex items-center gap-3">
            {justSaved
              ? savedKeys[draftKey]?.embedded
                ? <span className="text-xs font-bold text-[#178348]">✓ Saved &amp; embedded</span>
                : <span className="text-xs font-bold text-[#716b60]">✓ Saved (cleared — no embedding)</span>
              : null}
            {isDirty ? <span className="text-xs font-medium text-[#b89148]">Unsaved changes</span> : null}
            <button
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e7dfd5] bg-white px-3 py-1.5 text-xs font-bold text-[#2b2823] hover:bg-[#f4f0eb] disabled:opacity-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtracting || isSaving}
              type="button"
              title="Extract text from file and append to this doc"
            >
              <Upload size={12} /> {isExtracting ? 'Extracting...' : 'Append from file'}
            </button>
            {!isEditing && storedContent ? (
              <button
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e7dfd5] bg-white px-3 py-1.5 text-xs font-bold text-[#2b2823] hover:bg-[#f4f0eb]"
                onClick={startEdit}
                type="button"
              >
                <Pencil size={12} /> Edit
              </button>
            ) : null}
          </div>
        </div>

        {isEditing ? (
          <>
            <textarea
              className="min-h-[300px] w-full rounded-xl border border-[#e7dfd5] px-4 py-3 text-sm text-[#393733] outline-none focus:border-[#b89148] resize-y"
              disabled={isSaving}
              value={currentContent}
              onChange={e => handleChange(e.target.value)}
              placeholder={`Write ${DOC_LABELS[activeDoc]} content in ${localeLabel}...`}
            />
            <div className="mt-4 flex gap-3">
              <button
                className="rounded-xl border-none bg-[#b89148] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60 hover:bg-[#a37d3e]"
                disabled={isSaving || !isDirty}
                onClick={save}
                type="button"
              >
                {isSaving ? 'Saving...' : 'Save & Embed'}
              </button>
              {storedContent ? (
                <button
                  className="rounded-xl border border-[#e7dfd5] bg-white px-6 py-2.5 text-sm font-bold text-[#716b60] hover:bg-[#f4f0eb]"
                  disabled={isSaving}
                  onClick={cancelEdit}
                  type="button"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <div className="min-h-[120px] whitespace-pre-wrap rounded-xl bg-[#f7f4ef] px-4 py-3 text-sm leading-relaxed text-[#393733]">
            {storedContent || <span className="text-[#aaa6a0]">No content saved yet.</span>}
          </div>
        )}
      </div>

      <p className="text-xs text-[#8c8982]">No auto-translation — input content manually for each language by switching locale at top right.</p>
    </section>
  )
}
