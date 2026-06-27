'use client'

import { Pencil } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { StaticDoc } from './AIChatBotStaticDocsView'

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
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingNav, setPendingNav] = useState<string | null>(null)
  const pendingNavRef = useRef<string | null>(null)

  const draftKey = `${activeDoc}:${locale}`
  const storedContent = getContent(docs, activeDoc, locale)
  const currentContent = drafts[draftKey] !== undefined ? drafts[draftKey] : storedContent
  const isDirty = drafts[draftKey] !== undefined && drafts[draftKey] !== storedContent
  const isEditing = editingKeys[draftKey] !== undefined ? editingKeys[draftKey] : !storedContent
  const justSaved = savedKeys[draftKey] && !isDirty

  // Track isDirty in ref for event listeners
  const isDirtyRef = useRef(isDirty)
  useEffect(() => { isDirtyRef.current = isDirty }, [isDirty])
  useEffect(() => { pendingNavRef.current = pendingNav }, [pendingNav])

  // Browser close/reload guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // Intercept internal SPA link clicks
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isDirtyRef.current) return
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href === window.location.pathname) return
      e.preventDefault()
      e.stopPropagation()
      setPendingNav(href)
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  function startEdit() {
    setEditingKeys(k => ({ ...k, [draftKey]: true }))
    setSavedKeys(k => ({ ...k, [draftKey]: false }))
    setError(null)
  }

  function cancelEdit() {
    setDrafts(d => { const n = { ...d }; delete n[draftKey]; return n })
    setEditingKeys(k => ({ ...k, [draftKey]: false }))
    setError(null)
  }

  function handleChange(value: string) {
    setDrafts(d => ({ ...d, [draftKey]: value }))
    setSavedKeys(k => ({ ...k, [draftKey]: false }))
    setError(null)
  }

  async function doSave(content: string, docType: DocType): Promise<boolean> {
    setIsSaving(true)
    setError(null)
    const res = await fetch('/api/admin/ai-static-docs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ doc_type: docType, locale, content }),
    })
    const data = await res.json().catch(() => null)
    setIsSaving(false)
    if (!res.ok || !data?.doc) {
      setError(data?.error || 'Save failed')
      return false
    }
    setDocs(curr => {
      const exists = curr.find(d => d.doc_type === docType && d.locale === locale)
      return exists
        ? curr.map(d => d.doc_type === docType && d.locale === locale ? data.doc : d)
        : [...curr, data.doc]
    })
    const key = `${docType}:${locale}`
    setDrafts(d => { const n = { ...d }; delete n[key]; return n })
    setEditingKeys(k => ({ ...k, [key]: false }))
    setSavedKeys(k => ({ ...k, [key]: true }))
    return true
  }

  function save() { void doSave(currentContent, activeDoc) }

  function stayOnPage() { setPendingNav(null) }

  function leaveAnyway() {
    const href = pendingNav
    if (!href) return
    setDrafts({})
    window.location.href = href
  }

  return (
    <section className="flex flex-col gap-5 pb-10">
      {/* Payload-style unsaved changes overlay */}
      {pendingNav ? (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
          <h2 className="mb-2 text-2xl font-bold text-[#2b2823]">Leave without saving</h2>
          <p className="mb-8 text-sm text-[#716b60]">Your changes have not been saved. If you leave now, you will lose your changes.</p>
          <div className="flex gap-3">
            <button
              className="rounded-xl border border-[#e7dfd5] bg-white px-5 py-2.5 text-sm font-bold text-[#2b2823] hover:bg-[#f4f0eb]"
              onClick={stayOnPage}
              type="button"
            >
              Stay on this page
            </button>
            <button
              className="rounded-xl border-none bg-[#b89148] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a37d3e]"
              onClick={leaveAnyway}
              type="button"
            >
              Leave anyway
            </button>
          </div>
        </div>
      ) : null}

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="rounded-xl bg-[#f7f4ef] border border-[#e7dfd5] px-4 py-3 text-sm text-[#716b60]">
        Current locale: <strong className="text-[#2b2823]">{localeLabel}</strong> — change using the &ldquo;Locale&rdquo; dropdown in the top right corner. Content saved separately per language.
      </div>

      {/* Doc type tabs */}
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

      {/* Content card */}
      <div className="rounded-2xl border border-[#e7dfd5] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-[#716b60]">{DOC_LABELS[activeDoc]} · {localeLabel}</span>
          <div className="flex items-center gap-3">
            {justSaved ? <span className="text-xs font-bold text-[#178348]">✓ Saved &amp; embedded</span> : null}
            {isDirty ? <span className="text-xs font-medium text-[#b89148]">Unsaved changes</span> : null}
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
