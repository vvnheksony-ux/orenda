'use client'

import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
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

export default function AIChatBotPriceLists({ initialPrices }: { initialPrices: PriceRow[] }) {
  const [prices, setPrices] = useState(initialPrices)
  const [form, setForm] = useState<PriceForm>(emptyForm)
  const [editing, setEditing] = useState<PriceRow | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function beginAdd() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
    setError(null)
  }

  function beginEdit(row: PriceRow) {
    setEditing(row)
    setForm(rowToForm(row))
    setShowForm(true)
    setError(null)
  }

  function cancel() {
    setShowForm(false)
    setEditing(null)
    setForm(emptyForm)
    setError(null)
  }

  function set(key: keyof PriceForm, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

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
      setPrices(curr => editing
        ? curr.map(p => p.id === data.price.id ? data.price : p)
        : [...curr, data.price])
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

  return (
    <section className="flex flex-col gap-5 pb-10">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex justify-end">
        <button
          className="inline-flex h-12 items-center gap-2 rounded-xl border-none bg-[#b89148] px-5 text-sm font-bold text-white hover:bg-[#a37d3e]"
          onClick={beginAdd}
          type="button"
        >
          <Plus size={16} /> Add Price
        </button>
      </div>

      {showForm ? (
        <div className="rounded-2xl border border-[#e7dfd5] bg-white p-5 shadow-sm">
          <h2 className="mb-4 m-0 text-lg font-bold text-[#2b2823]">{editing ? 'Edit Price' : 'Add Price'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Service Name (EN) *">
              <input className={input} disabled={isPending} value={form.service_name_en} onChange={e => set('service_name_en', e.target.value)} placeholder="e.g. Consultation ER less than 20 min" />
            </Field>
            <Field label="Service Name (KM)">
              <input className={input} disabled={isPending} value={form.service_name_km} onChange={e => set('service_name_km', e.target.value)} placeholder="ការពិគ្រោះ..." />
            </Field>
            <Field label="Khmer Price ($)">
              <input className={input} disabled={isPending} type="number" step="0.01" value={form.price_khmer} onChange={e => set('price_khmer', e.target.value)} placeholder="15" />
            </Field>
            <Field label="Foreign Price ($)">
              <input className={input} disabled={isPending} type="number" step="0.01" value={form.price_foreign} onChange={e => set('price_foreign', e.target.value)} placeholder="15" />
            </Field>
            <Field label="Emergency Khmer ($)">
              <input className={input} disabled={isPending} type="number" step="0.01" value={form.price_emergency_khmer} onChange={e => set('price_emergency_khmer', e.target.value)} placeholder="15" />
            </Field>
            <Field label="Emergency Foreign ($)">
              <input className={input} disabled={isPending} type="number" step="0.01" value={form.price_emergency_foreign} onChange={e => set('price_emergency_foreign', e.target.value)} placeholder="15" />
            </Field>
            <Field label="Department" className="sm:col-span-2">
              <input className={input} disabled={isPending} value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. Emergency, Dermatology" />
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
                      <button aria-label="Edit" className="border-none bg-transparent p-1 text-[#8c8982]" onClick={() => beginEdit(row)} type="button"><Pencil size={16} /></button>
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

const input = 'rounded-xl border border-[#e7dfd5] px-4 py-3 w-full text-sm text-[#393733] outline-none focus:border-[#b89148]'

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-xs font-bold text-[#716b60] uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}
