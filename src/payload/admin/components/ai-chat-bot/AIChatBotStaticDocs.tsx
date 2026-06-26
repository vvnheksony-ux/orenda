'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { StaticDoc } from './AIChatBotStaticDocsView'

const DOC_TYPES = ['about', 'contact', 'policy', 'brand'] as const
type DocType = typeof DOC_TYPES[number]
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
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const draftKey = `${activeDoc}:${locale}`
  const storedContent = getContent(docs, activeDoc, locale)
  const currentContent = drafts[draftKey] !== undefined ? drafts[draftKey] : storedContent
  const isDirty = drafts[draftKey] !== undefined && drafts[draftKey] !== storedContent

  function handleChange(value: string) {
    setDrafts(d => ({ ...d, [draftKey]: value }))
    setSaved(false)
    setError(null)
  }

  function handleDocChange(dt: DocType) {
    setActiveDoc(dt)
    setSaved(false)
    setError(null)
  }

  function save() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await fetch('/api/admin/ai-static-docs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ doc_type: activeDoc, locale, content: currentContent }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.doc) { setError(data?.error || 'Save failed'); return }
      setDocs(curr => {
        const exists = curr.find(d => d.doc_type === activeDoc && d.locale === locale)
        return exists
          ? curr.map(d => d.doc_type === activeDoc && d.locale === locale ? data.doc : d)
          : [...curr, data.doc]
      })
      setDrafts(d => { const n = { ...d }; delete n[draftKey]; return n })
      setSaved(true)
    })
  }

  return (
    <section className="flex flex-col gap-5 pb-10">
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
            onClick={() => handleDocChange(dt)}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold border-none transition-colors ${
              activeDoc === dt ? 'bg-[#b89148] text-white' : 'bg-[#ebe7e1] text-[#716b60] hover:bg-[#ddd7ce]'
            }`}
          >
            {DOC_LABELS[dt]}
            {getContent(docs, dt, locale).trim() ? <span className="ml-2 inline-block size-2 rounded-full bg-[#178348] align-middle" /> : null}
          </button>
        ))}
      </div>

      {/* Single textarea for current locale */}
      <div className="rounded-2xl border border-[#e7dfd5] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-[#716b60]">{DOC_LABELS[activeDoc]} · {localeLabel}</span>
          {saved ? <span className="text-xs font-bold text-[#178348]">✓ Saved &amp; embedded</span> : null}
          {isDirty && !saved ? <span className="text-xs text-[#b89148]">Unsaved changes</span> : null}
        </div>
        <textarea
          className="min-h-[300px] w-full rounded-xl border border-[#e7dfd5] px-4 py-3 text-sm text-[#393733] outline-none focus:border-[#b89148] resize-y"
          disabled={isPending}
          value={currentContent}
          onChange={e => handleChange(e.target.value)}
          placeholder={`Write ${DOC_LABELS[activeDoc]} content in ${localeLabel}...`}
        />
        <div className="mt-4">
          <button
            className="rounded-xl border-none bg-[#b89148] px-6 py-3 text-sm font-bold text-white disabled:opacity-60 hover:bg-[#a37d3e]"
            disabled={isPending || !isDirty}
            onClick={save}
            type="button"
          >
            {isPending ? 'Saving...' : 'Save & Embed'}
          </button>
        </div>
      </div>

      <p className="text-xs text-[#8c8982]">No auto-translation — input content manually for each language by switching locale at top right.</p>
    </section>
  )
}
