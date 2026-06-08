'use client'

import { CalendarDays, ClipboardList, Edit, Mail, Package, Phone, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useState, useTransition } from 'react'

import type { OperationConfig, OperationRecord } from './operationsConfig'

type OperationsDetailProps = {
  config: OperationConfig
  error?: string
  mode: 'edit' | 'view'
  record: OperationRecord | null
}

export default function OperationsDetail({ config, error, mode, record }: OperationsDetailProps) {
  const router = useRouter()
  const [form, setForm] = useState<Record<string, string>>(() => getInitialForm(config, record))
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (error) return <OperationsShell title={config.title} error={error} />
  if (!record) return <OperationsShell title={config.title} error="Record not found." />
  const currentRecord = record

  function updateField(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function save() {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch(`/api/admin/operations/${config.slug}/${currentRecord.id}`, {
        body: JSON.stringify({ data: form }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        setMessage(data?.error || 'Failed to save changes.')
        return
      }

      router.push(`/admin/operations/${config.slug}/view/${currentRecord.id}`)
      router.refresh()
    })
  }

  function markCompleted() {
    updateStatus(config.slug === 'inquiries' ? 'resolved' : 'completed')
  }

  function updateStatus(status: string) {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch(`/api/admin/operations/${config.slug}/${currentRecord.id}`, {
        body: JSON.stringify({ status }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        setMessage(data?.error || 'Failed to update status.')
        return
      }

      router.refresh()
    })
  }

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-8 py-8">
      <header className="border-b border-[#e7dfd5] bg-white px-1 pb-5">
        <h1 className="m-0 text-2xl font-bold text-[#2b2823]">{config.singularTitle} Details</h1>
        <p className="m-0 mt-1 text-sm text-[#716b60]">Operations & Sales &gt; {config.title} &gt; {mode === 'edit' ? 'Edit' : 'View'}</p>
      </header>

      {message ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div> : null}

      {mode === 'edit' ? (
        <EditForm config={config} disabled={isPending} form={form} onChange={updateField} onSave={save} record={record} />
      ) : (
        <ViewDetails config={config} isPending={isPending} markCompleted={markCompleted} record={record} />
      )}
    </main>
  )
}

function ViewDetails({ config, isPending, markCompleted, record }: { config: OperationConfig; isPending: boolean; markCompleted: () => void; record: OperationRecord }) {
  return (
    <>
      <section className="rounded-2xl border border-[#e7dfd5] bg-white p-6 shadow-[0_10px_24px_rgb(50_39_24_/_6%)]">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="m-0 text-3xl font-bold text-[#2b2823]">{config.singularTitle} #{shortId(record.id)}</h2>
              <span className="rounded-full bg-[#ebe7e1] px-4 py-2 text-sm capitalize text-[#716b60]">{record.status || 'unknown'}</span>
            </div>
            <p className="mb-0 mt-4 text-lg text-[#716b60]">Created on {formatDate(record.created_at)}</p>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-xl bg-[#b89148] px-5 py-3 font-bold text-white no-underline" href={`/admin/operations/${config.slug}/edit/${record.id}`}>
            <Edit size={18} /> Edit {config.singularTitle}
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {getDetailItems(config, record).map((item) => {
            const Icon = item.icon
            return (
              <div className="grid grid-cols-[28px_1fr] gap-4" key={item.label}>
                <Icon className="mt-1 text-[#b89148]" size={24} />
                <div>
                  <p className="m-0 text-sm text-[#716b60]">{item.label}</p>
                  <p className="m-0 mt-1 whitespace-pre-line text-lg font-medium text-[#2b2823]">{item.value || '-'}</p>
                  {item.subValue ? <p className="m-0 mt-1 text-base text-[#716b60]">{item.subValue}</p> : null}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <ContentCard title={config.slug === 'appointments' ? 'Reason for Visit' : config.slug === 'purchases' ? 'Note' : 'Inquiry Message'}>
        {String(record.message || 'No message provided.')}
      </ContentCard>

      <ContentCard title="Record Metadata">
        ID: {record.id}\nLanguage: {record.language || '-'}\nSource: {record.source || '-'}
      </ContentCard>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-xl bg-[#22a95a] px-8 py-4 font-bold text-white" disabled={isPending} onClick={markCompleted} type="button">
          Mark as {config.slug === 'inquiries' ? 'Resolved' : 'Completed'}
        </button>
        <Link className="rounded-xl bg-[#ebe7e1] px-8 py-4 font-bold text-[#2b2823] no-underline" href={`/admin/operations/${config.slug}/edit/${record.id}`}>
          Update Content
        </Link>
      </div>
    </>
  )
}

function EditForm({ config, disabled, form, onChange, onSave, record }: { config: OperationConfig; disabled: boolean; form: Record<string, string>; onChange: (key: string, value: string) => void; onSave: () => void; record: OperationRecord }) {
  return (
    <section className="rounded-2xl border border-[#e7dfd5] bg-white p-6 shadow-[0_10px_24px_rgb(50_39_24_/_6%)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="m-0 text-3xl font-bold text-[#2b2823]">Edit {config.singularTitle} #{shortId(record.id)}</h2>
          <p className="mb-0 mt-2 text-sm text-[#716b60]">Update public.{config.slug}; no schema changes are made.</p>
        </div>
        <Link className="rounded-xl bg-[#ebe7e1] px-5 py-3 font-bold text-[#2b2823] no-underline" href={`/admin/operations/${config.slug}/view/${record.id}`}>
          Cancel
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {config.editableFields.map((field) => (
          <label className={field.type === 'textarea' ? 'flex flex-col gap-2 md:col-span-2' : 'flex flex-col gap-2'} key={field.key}>
            <span className="text-sm font-bold text-[#716b60]">{field.label}</span>
            {field.key === 'status' ? (
              <select className="rounded-xl border border-[#e7dfd5] px-4 py-3 text-base" disabled={disabled} onChange={(event) => onChange(field.key, event.target.value)} value={form[field.key] || ''}>
                {config.statusOptions.map((option) => (
                  <option key={option} value={option}>{formatLabel(option)}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea className="min-h-36 rounded-xl border border-[#e7dfd5] px-4 py-3 text-base" disabled={disabled} onChange={(event) => onChange(field.key, event.target.value)} value={form[field.key] || ''} />
            ) : (
              <input className="rounded-xl border border-[#e7dfd5] px-4 py-3 text-base" disabled={disabled} onChange={(event) => onChange(field.key, event.target.value)} type={field.type === 'date' ? 'date' : field.type === 'datetime' ? 'datetime-local' : 'text'} value={form[field.key] || ''} />
            )}
          </label>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button className="rounded-xl bg-[#b89148] px-8 py-4 font-bold text-white" disabled={disabled} onClick={onSave} type="button">
          Save Changes
        </button>
        <Link className="rounded-xl bg-[#ebe7e1] px-8 py-4 font-bold text-[#2b2823] no-underline" href={`/admin/operations/${config.slug}/view/${record.id}`}>
          Back to Detail
        </Link>
      </div>
    </section>
  )
}

function OperationsShell({ error, title }: { error: string; title: string }) {
  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-8 py-8">
      <h1 className="m-0 text-2xl font-bold text-[#2b2823]">{title}</h1>
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
    </main>
  )
}

function ContentCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-2xl border border-[#e7dfd5] bg-white p-6 shadow-[0_10px_24px_rgb(50_39_24_/_6%)]">
      <h2 className="m-0 mb-6 text-2xl font-bold text-[#2b2823]">{title}</h2>
      <p className="m-0 whitespace-pre-line text-lg leading-8 text-[#2b2823]">{children}</p>
    </section>
  )
}

function getInitialForm(config: OperationConfig, record: OperationRecord | null) {
  return Object.fromEntries(
    config.editableFields.map((field) => [field.key, formatInputValue(record?.[field.key], field.type)])
  )
}

function getDetailItems(config: OperationConfig, record: OperationRecord) {
  if (config.slug === 'appointments') {
    return [
      { icon: CalendarDays, label: 'Date & Time', value: record.preferred_date || formatDate(record.slot_start), subValue: record.preferred_time || formatTimeRange(record.slot_start, record.slot_end) },
      { icon: Package, label: 'Services & Branch', value: valueWithFallback(record.department_payload_id, 'Department not assigned'), subValue: valueWithFallback(record.branch_payload_id, 'Branch not assigned') },
      { icon: ClipboardList, label: 'Doctor', value: valueWithFallback(record.doctor_payload_id, 'Doctor not assigned'), subValue: record.source || undefined },
      { icon: UserRound, label: 'Patient', value: record.patient_name, subValue: record.patient_email || undefined },
      { icon: Phone, label: 'Contact Phone', value: record.patient_phone },
    ]
  }

  if (config.slug === 'purchases') {
    return [
      { icon: Package, label: 'Promotions Package', value: record.promotion_title || record.promotion_id, subValue: valueWithFallback(record.branch_payload_id || record.branch_id, 'Branch not assigned') },
      { icon: UserRound, label: 'Patient', value: record.patient_name, subValue: record.patient_email || undefined },
      { icon: Phone, label: 'Contact Phone', value: record.patient_phone },
      { icon: ClipboardList, label: 'Promotion Reference', value: valueWithFallback(record.promotion_payload_id || record.promotion_id, '-') },
    ]
  }

  return [
    { icon: UserRound, label: 'Customer', value: record.name, subValue: record.email || undefined },
    { icon: Phone, label: 'Contact Phone', value: record.phone },
    { icon: Mail, label: 'Email', value: record.email },
    { icon: ClipboardList, label: 'Subject', value: record.subject },
  ]
}

function shortId(id: string) {
  return id.slice(0, 8)
}

function formatDate(value: OperationRecord[string]) {
  if (typeof value !== 'string') return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: value.includes('T') ? 'short' : undefined }).format(date)
}

function formatInputValue(value: OperationRecord[string], type?: string) {
  if (value == null) return ''
  if (type === 'datetime' && typeof value === 'string') return value.slice(0, 16)
  return String(value)
}

function formatTimeRange(start: OperationRecord[string], end: OperationRecord[string]) {
  if (!start || !end) return undefined
  return `${formatDate(start)} - ${formatDate(end)}`
}

function formatLabel(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function valueWithFallback(value: OperationRecord[string], fallback: string) {
  return value == null || value === '' ? fallback : String(value)
}
