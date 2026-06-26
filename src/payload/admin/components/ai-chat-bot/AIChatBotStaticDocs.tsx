'use client'

import { useState, useTransition } from 'react'
import type { StaticDoc } from './AIChatBotStaticDocsView'

const DOC_TYPES = ['about', 'contact', 'policy', 'brand'] as const
const LOCALES = [
  { key: 'en', label: 'English' },
  { key: 'km', label: 'Khmer' },
  { key: 'zh', label: 'Chinese' },
] as const
type DocType = typeof DOC_TYPES[number]
const DOC_LABELS: Record<DocType, string> = { about: 'About', contact: 'Contact', policy: 'Policy', brand: 'Brand' }

function getContent(docs: StaticDoc[], docType: DocType, locale: string): string {
  return docs.find(d => d.doc_type === docType && d.locale === locale)?.content ?? ''
}

export default function AIChatBotStaticDocs({ initialDocs }: { initialDocs: StaticDoc[] }) {
  const [docs, setDocs] = useState(initialDocs)
  const [activeDoc, setActiveDoc] = useState<DocType>('about')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingLocale, setSavingLocale] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function draftKey(locale: string) { return `${activeDoc}:${locale}` }

  function getVal(locale: string) {
    const k = draftKey(locale)
    return drafts[k] !== undefined ? drafts[k] : getContent(docs, activeDoc, locale)
  }

  function handleChange(locale: string, value: string) {
    setDrafts(d => ({ ...d, [draftKey(locale)]: value }))
    setSavedKey(null)
    setError(null)
  }

  function save(locale: string) {
    const content = getVal(locale)
    setError(null)
    setSavedKey(null)
    setSavingLocale(locale)
    startTransition(async () => {
      const res = await fetch('/api/admin/ai-static-docs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ doc_type: activeDoc, locale, content }),
      })
      const data = await res.json().catch(() => null)
      setSavingLocale(null)
      if (!res.ok || !data?.doc) { setError(data?.error || 'Save failed'); return }
      setDocs(curr => {
        const exists = curr.find(d => d.doc_type === activeDoc && d.locale === locale)
        return exists
          ? curr.map(d => d.doc_type === activeDoc && d.locale === locale ? data.doc : d)
          : [...curr, data.doc]
      })
      const k = draftKey(locale)
      setDrafts(d => { const n = { ...d }; delete n[k]; return n })
      setSavedKey(draftKey(locale))
    })
  }

  return (
    <section className="flex flex-col gap-5 pb-10">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {/* Doc type tabs */}
      <div className="flex gap-2 flex-wrap">
        {DOC_TYPES.map(dt => (
          <button
            key={dt}
            type="button"
            onClick={() => { setActiveDoc(dt); setSavedKey(null); setError(null) }}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold border-none transition-colors ${
              activeDoc === dt ? 'bg-[#b89148] text-white' : 'bg-[#ebe7e1] text-[#716b60] hover:bg-[#ddd7ce]'
            }`}
          >
            {DOC_LABELS[dt]}
          </button>
        ))}
      </div>

      {/* All 3 locales shown at once */}
      <div className="flex flex-col gap-4">
        {LOCALES.map(({ key: locale, label }) => {
          const val = getVal(locale)
          const stored = getContent(docs, activeDoc, locale)
          const isDirty = drafts[draftKey(locale)] !== undefined && drafts[draftKey(locale)] !== stored
          const isSaving = savingLocale === locale
          const isSaved = savedKey === draftKey(locale)

          return (
            <div key={locale} className="rounded-2xl border border-[#e7dfd5] bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-[#2b2823]">{label}</span>
                {isSaved ? <span className="text-xs font-bold text-[#178348]">✓ Saved &amp; embedded</span> : null}
                {isDirty && !isSaved ? <span className="text-xs text-[#b89148]">Unsaved</span> : null}
              </div>
              <textarea
                className="min-h-[160px] w-full rounded-xl border border-[#e7dfd5] px-4 py-3 text-sm text-[#393733] outline-none focus:border-[#b89148] resize-y"
                disabled={isSaving}
                value={val}
                onChange={e => handleChange(locale, e.target.value)}
                placeholder={`Write ${DOC_LABELS[activeDoc]} content in ${label}...`}
              />
              <div className="mt-3">
                <button
                  className="rounded-xl border-none bg-[#b89148] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 hover:bg-[#a37d3e]"
                  disabled={isSaving || !isDirty}
                  onClick={() => save(locale)}
                  type="button"
                >
                  {isSaving ? 'Saving...' : 'Save & Embed'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-[#8c8982]">Each save re-embeds that locale into AI search.</p>
    </section>
  )
}
