'use client'

import { useState, useTransition } from 'react'
import type { StaticDoc } from './AIChatBotStaticDocsView'

const DOC_TYPES = ['about', 'contact', 'policy', 'brand'] as const
const LOCALES = ['en', 'km', 'zh'] as const
type DocType = typeof DOC_TYPES[number]
type Locale = typeof LOCALES[number]

const DOC_LABELS: Record<DocType, string> = { about: 'About', contact: 'Contact', policy: 'Policy', brand: 'Brand' }
const LOCALE_LABELS: Record<Locale, string> = { en: 'English', km: 'Khmer', zh: 'Chinese' }

function getContent(docs: StaticDoc[], docType: DocType, locale: Locale): string {
  return docs.find(d => d.doc_type === docType && d.locale === locale)?.content ?? ''
}

export default function AIChatBotStaticDocs({ initialDocs }: { initialDocs: StaticDoc[] }) {
  const [docs, setDocs] = useState(initialDocs)
  const [activeDoc, setActiveDoc] = useState<DocType>('about')
  const [activeLocale, setActiveLocale] = useState<Locale>('en')
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const key = `${activeDoc}:${activeLocale}`
  const storedContent = getContent(docs, activeDoc, activeLocale)
  const currentContent = draft[key] ?? storedContent

  function handleChange(value: string) {
    setDraft(d => ({ ...d, [key]: value }))
    setSaved(null)
    setError(null)
  }

  function save() {
    setError(null)
    setSaved(null)
    startTransition(async () => {
      const res = await fetch('/api/admin/ai-static-docs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ doc_type: activeDoc, locale: activeLocale, content: currentContent }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.doc) { setError(data?.error || 'Save failed'); return }
      setDocs(curr => {
        const exists = curr.find(d => d.doc_type === activeDoc && d.locale === activeLocale)
        return exists
          ? curr.map(d => d.doc_type === activeDoc && d.locale === activeLocale ? data.doc : d)
          : [...curr, data.doc]
      })
      setDraft(d => { const n = { ...d }; delete n[key]; return n })
      setSaved(key)
    })
  }

  const isDirty = draft[key] !== undefined && draft[key] !== storedContent

  return (
    <section className="flex flex-col gap-5 pb-10">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {/* Doc type tabs */}
      <div className="flex gap-2 flex-wrap">
        {DOC_TYPES.map(dt => (
          <button
            key={dt}
            type="button"
            onClick={() => { setActiveDoc(dt); setSaved(null); setError(null) }}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold border-none transition-colors ${
              activeDoc === dt
                ? 'bg-[#b89148] text-white'
                : 'bg-[#ebe7e1] text-[#716b60] hover:bg-[#ddd7ce]'
            }`}
          >
            {DOC_LABELS[dt]}
          </button>
        ))}
      </div>

      {/* Locale tabs */}
      <div className="flex gap-2">
        {LOCALES.map(loc => {
          const hasContent = getContent(docs, activeDoc, loc).trim().length > 0
          return (
            <button
              key={loc}
              type="button"
              onClick={() => { setActiveLocale(loc); setSaved(null); setError(null) }}
              className={`rounded-xl px-4 py-2 text-sm font-bold border-none transition-colors flex items-center gap-2 ${
                activeLocale === loc
                  ? 'bg-[#2b2823] text-white'
                  : 'bg-[#f7f4ef] text-[#716b60] hover:bg-[#ebe7e1]'
              }`}
            >
              {LOCALE_LABELS[loc]}
              {hasContent ? <span className="size-2 rounded-full bg-[#178348] inline-block" /> : null}
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <div className="rounded-2xl border border-[#e7dfd5] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-[#716b60]">
            {DOC_LABELS[activeDoc]} · {LOCALE_LABELS[activeLocale]}
          </span>
          {saved === key ? <span className="text-xs font-bold text-[#178348]">✓ Saved &amp; embedded</span> : null}
        </div>
        <textarea
          className="min-h-[300px] w-full rounded-xl border border-[#e7dfd5] px-4 py-3 text-sm text-[#393733] outline-none focus:border-[#b89148] resize-y"
          disabled={isPending}
          value={currentContent}
          onChange={e => handleChange(e.target.value)}
          placeholder={`Write ${DOC_LABELS[activeDoc]} content in ${LOCALE_LABELS[activeLocale]}...`}
        />
        <div className="mt-4 flex items-center gap-3">
          <button
            className="rounded-xl border-none bg-[#b89148] px-6 py-3 text-sm font-bold text-white disabled:opacity-60 hover:bg-[#a37d3e]"
            disabled={isPending || !isDirty}
            onClick={save}
            type="button"
          >
            {isPending ? 'Saving...' : 'Save & Embed'}
          </button>
          {isDirty ? <span className="text-xs text-[#b89148]">Unsaved changes</span> : null}
        </div>
      </div>

      <p className="text-xs text-[#8c8982]">Saving re-embeds the content into the AI search index for that language.</p>
    </section>
  )
}
