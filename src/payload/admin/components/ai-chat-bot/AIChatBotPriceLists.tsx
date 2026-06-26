'use client'

import { FileSpreadsheet, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'
import type { PriceRow } from './AIChatBotPriceListsView'

type PriceForm = {
  service_name_en: string
  service_name_km: string
  price_khmer: string
  price_foreign: string
  price_emergency_khmer: string
  price_emergency_foreign: string
  department: string
}

const emptyForm: PriceForm = {
  service_name_en: '',
  service_name_km: '',
  price_khmer: '',
  price_foreign: '',
  price_emergency_khmer: '',
  price_emergency_foreign: '',
  department: '',
}

function rowToForm(row: PriceRow): PriceForm {
  return {
    service_name_en: row.service_name_en ?? '',
    service_name_km: row.service_name_km ?? '',
    price_khmer: row.price_khmer != null ? String(row.price_khmer) : '',
    price_foreign: row.price_foreign != null ? String(row.price_foreign) : '',
    price_emergency_khmer: row.price_emergency_khmer != null ? String(row.price_emergency_khmer) : '',
    price_emergency_foreign: row.price_emergency_foreign != null ? String(row.price_emergency_foreign) : '',
    department: row.department ?? '',
  }
}

const COLUMNS = [
  { col: 'A', name: 'Service Name (EN)', note: 'Required — English service name' },
  { col: 'B', name: 'Service Name (KM)', note: 'Optional — Khmer name' },
  { col: 'C', name: 'Khmer Price', note: 'Number (USD)' },
  { col: 'D', name: 'Foreign Price', note: 'Number (USD)' },
  { col: 'E', name: 'Emergency Khmer Price', note: 'Number (USD)' },
  { col: 'F', name: 'Emergency Foreign Price', note: 'Number (USD)' },
  { col: 'G', name: 'Department', note: 'e.g. Emergency, Dermatology' },
]

export default function AIChatBotPriceLists({ initialPrices }: { initialPrices: PriceRow[] }) {
  const [prices, setPrices] = useState(initialPrices)
  const [form, setForm] = useState<PriceForm>(emptyForm)
  const [editing, setEditing] = useState<PriceRow | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  function beginAdd() { setEditing(null); setForm(emptyForm); setShowForm(true); setError(null) }
  function beginEdit(row: PriceRow) { setEditing(row); setForm(rowToForm(row)); setShowForm(true); setError(null) }
  function cancel() { setShowForm(false); setEditing(null); setForm(emptyForm); setError(null) }
  function set(key: keyof PriceForm, value: string) { setForm(f => ({ ...f, [key]: value })) }

  function submit() {
    if (!form.service_name_en.trim()) { setError('Service name (EN) required'); return }
    setError(null)
    startTransition(async () => {
      const url = editing ? `/api/admin/ai-price-lists/${editing.id}` : '/api/admin/ai-price-lists'
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.price) { setError(data?.error || 'Save failed'); return }
      setPrices(curr => editing ? curr.map(p => p.id === data.price.id ? data.price : p) : [...curr, data.price])
      cancel()
    })
  }

  function deleteRow(row: PriceRow) {
    if (!window.confirm(`Delete "${row.service_name_en}"?`)) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/ai-price-lists/${row.id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { const d = await res.json().catch(() => null); setError(d?.error || 'Delete failed'); return }
      setPrices(curr => curr.filter(p => p.id !== row.id))
    })
  }

  async function downloadTemplate() {
    const res = await fetch('/api/admin/ai-price-lists/template', { credentials: 'include' })
    if (!res.ok) { setError('Download failed'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'price-list-template.xlsx'; a.click()
    URL.revokeObjectURL(url)
  }

  async function exportPrices() {
    const XLSX = await import('xlsx')
    const headers = COLUMNS.map(c => c.name)
    const rows = prices.map(r => [
      r.service_name_en ?? '',
      r.service_name_km ?? '',
      r.price_khmer ?? '',
      r.price_foreign ?? '',
      r.price_emergency_khmer ?? '',
      r.price_emergency_foreign ?? '',
      r.department ?? '',
    ])
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = [{ wch: 45 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 22 }, { wch: 22 }, { wch: 20 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Price List')
    XLSX.writeFile(wb, 'orienda-price-list.xlsx')
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!window.confirm(`Upload "${file.name}"?\n\nThis will REPLACE ALL existing prices with data from this file.`)) {
      e.target.value = ''; return
    }
    setShowUploadModal(false)
    setError(null); setImportMsg(null); setImporting(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/admin/ai-price-lists/import', { method: 'POST', credentials: 'include', body: fd })
    const data = await res.json().catch(() => null)
    setImporting(false); e.target.value = ''
    if (!res.ok) { setError(data?.error || 'Import failed'); return }
    setImportMsg(`Imported ${data.imported} prices — reloading...`)
    setTimeout(() => window.location.reload(), 1200)
  }

  return (
    <section className="flex flex-col gap-5 pb-10">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {importMsg ? <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{importMsg}</div> : null}

      <input accept=".xlsx" className="hidden" onChange={handleImport} ref={fileRef} type="file" />

      <div className="flex flex-wrap justify-end gap-2">
        {prices.length > 0 ? (
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e7dfd5] bg-white px-4 text-sm font-bold text-[#716b60] hover:bg-[#f4f0eb]"
            onClick={exportPrices}
            type="button"
          >
            <FileSpreadsheet size={15} /> Export XLSX
          </button>
        ) : null}
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e7dfd5] bg-white px-4 text-sm font-bold text-[#716b60] hover:bg-[#f4f0eb] disabled:opacity-50"
          disabled={importing}
          onClick={() => setShowUploadModal(true)}
          type="button"
        >
          <Upload size={15} /> {importing ? 'Importing...' : 'Upload XLSX'}
        </button>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl border-none bg-[#b89148] px-5 text-sm font-bold text-white hover:bg-[#a37d3e]"
          onClick={beginAdd}
          type="button"
        >
          <Plus size={16} /> Add Price
        </button>
      </div>

      {/* Upload modal */}
      {showUploadModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) setShowUploadModal(false) }}>
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              className="absolute right-4 top-4 rounded-lg border-none bg-transparent p-1 text-[#8c8982] hover:text-[#393733]"
              onClick={() => setShowUploadModal(false)}
              type="button"
            >
              <X size={18} />
            </button>

            <h2 className="mb-1 mt-0 text-lg font-bold text-[#2b2823]">Upload Price List</h2>
            <p className="mb-4 mt-0 text-sm text-[#716b60]">
              File must follow the exact column format below. Download the template, fill it in, then upload. Uploading will <strong>replace all existing prices</strong>.
            </p>

            {/* Column format table */}
            <div className="mb-5 overflow-hidden rounded-xl border border-[#e7dfd5]">
              <table className="w-full text-xs">
                <thead className="bg-[#efebe4] text-[#716b60]">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold w-10">Col</th>
                    <th className="px-3 py-2 text-left font-bold">Header · Note</th>
                  </tr>
                </thead>
                <tbody>
                  {COLUMNS.map(c => (
                    <tr className="border-t border-[#eee8dd]" key={c.col}>
                      <td className="px-3 py-2.5 font-mono font-bold text-[#b89148] align-top">{c.col}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-semibold text-[#393733]">{c.name}</span>
                        <span className="ml-2 text-[#8c8982]">— {c.note}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-[#e7dfd5] bg-[#f7f4ef] px-4 py-2.5 text-sm font-bold text-[#716b60] hover:bg-[#efebe4]"
                onClick={downloadTemplate}
                type="button"
              >
                <FileSpreadsheet size={15} /> Download Template
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl border-none bg-[#b89148] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a37d3e]"
                onClick={() => fileRef.current?.click()}
                type="button"
              >
                <Upload size={15} /> Choose File & Upload
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showForm ? (
        <div className="rounded-2xl border border-[#e7dfd5] bg-white p-5 shadow-sm">
          <h2 className="mb-4 m-0 text-lg font-bold text-[#2b2823]">{editing ? 'Edit Price' : 'Add Price'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Service Name (EN) *">
              <input className={inputCls} disabled={isPending} value={form.service_name_en} onChange={e => set('service_name_en', e.target.value)} placeholder="e.g. Consultation ER less than 20 min" />
            </Field>
            <Field label="Service Name (KM)">
              <input className={inputCls} disabled={isPending} value={form.service_name_km} onChange={e => set('service_name_km', e.target.value)} placeholder="ការពិគ្រោះ..." />
            </Field>
            <Field label="Khmer Price ($)">
              <input className={inputCls} disabled={isPending} type="number" step="0.01" value={form.price_khmer} onChange={e => set('price_khmer', e.target.value)} placeholder="15" />
            </Field>
            <Field label="Foreign Price ($)">
              <input className={inputCls} disabled={isPending} type="number" step="0.01" value={form.price_foreign} onChange={e => set('price_foreign', e.target.value)} placeholder="15" />
            </Field>
            <Field label="Emergency Khmer ($)">
              <input className={inputCls} disabled={isPending} type="number" step="0.01" value={form.price_emergency_khmer} onChange={e => set('price_emergency_khmer', e.target.value)} placeholder="15" />
            </Field>
            <Field label="Emergency Foreign ($)">
              <input className={inputCls} disabled={isPending} type="number" step="0.01" value={form.price_emergency_foreign} onChange={e => set('price_emergency_foreign', e.target.value)} placeholder="15" />
            </Field>
            <Field label="Department" className="sm:col-span-2">
              <input className={inputCls} disabled={isPending} value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. Emergency, Dermatology" />
            </Field>
          </div>
          <div className="mt-5 flex gap-3">
            <button className="rounded-xl border-none bg-[#b89148] px-6 py-3 font-bold text-white disabled:opacity-60" disabled={isPending} onClick={submit} type="button">
              {isPending ? 'Saving...' : 'Save'}
            </button>
            <button className="rounded-xl border-none bg-[#ebe7e1] px-6 py-3 font-bold text-[#2b2823]" disabled={isPending} onClick={cancel} type="button">Cancel</button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#e7dfd5] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead className="bg-[#efebe4] text-[#716b60]">
              <tr>
                <th className="px-4 py-3 font-bold w-[240px]">Service Name</th>
                <th className="px-4 py-3 font-bold w-[160px]">Khmer Name</th>
                <th className="px-4 py-3 font-bold w-[90px]">Khmer Price</th>
                <th className="px-4 py-3 font-bold w-[100px]">Foreign Price</th>
                <th className="px-4 py-3 font-bold w-[110px]">Emergency (KH)</th>
                <th className="px-4 py-3 font-bold w-[110px]">Emergency (FO)</th>
                <th className="px-4 py-3 font-bold w-[130px]">Department</th>
                <th className="px-4 py-3 text-right font-bold w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prices.length ? prices.map(row => (
                <tr className="border-t border-[#eee8dd] text-[#393733]" key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.service_name_en || '-'}</td>
                  <td className="px-4 py-3 text-[#716b60] text-xs">{row.service_name_km || '-'}</td>
                  <td className="px-4 py-3">{row.price_khmer != null ? `$${row.price_khmer}` : '-'}</td>
                  <td className="px-4 py-3">{row.price_foreign != null ? `$${row.price_foreign}` : '-'}</td>
                  <td className="px-4 py-3">{row.price_emergency_khmer != null ? `$${row.price_emergency_khmer}` : '-'}</td>
                  <td className="px-4 py-3">{row.price_emergency_foreign != null ? `$${row.price_emergency_foreign}` : '-'}</td>
                  <td className="px-4 py-3 text-[#716b60]">{row.department || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button aria-label="Edit" className="border-none bg-transparent p-1 text-[#8c8982] hover:text-[#393733]" onClick={() => beginEdit(row)} type="button"><Pencil size={16} /></button>
                      <button aria-label="Delete" className="border-none bg-transparent p-1 text-[#e5484d]" onClick={() => deleteRow(row)} type="button"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td className="px-4 py-8 text-center text-[#716b60]" colSpan={8}>No prices yet. Click Add Price to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-[#8c8982]">{prices.length} price{prices.length !== 1 ? 's' : ''} · All changes auto-embed into AI search</p>
    </section>
  )
}

const inputCls = 'rounded-xl border border-[#e7dfd5] px-4 py-3 w-full text-sm text-[#393733] outline-none focus:border-[#b89148]'

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-xs font-bold text-[#716b60] uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}
