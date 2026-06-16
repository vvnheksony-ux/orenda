'use client'

import { CalendarDays, ClipboardList, Edit, Mail, MessageSquare, Package, Phone, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useState, useTransition } from 'react'

import { getOperationHref, statusColor, type OperationConfig, type OperationRecord, type ReferenceOptionMap } from './operationsConfig'

type OperationsDetailProps = {
  config: OperationConfig
  error?: string
  mode: 'create' | 'edit' | 'view'
  record?: OperationRecord | null
  referenceOptions?: ReferenceOptionMap
}

export default function OperationsDetail({ config, error, mode, record, referenceOptions }: OperationsDetailProps) {
  const router = useRouter()
  const [form, setForm] = useState<Record<string, string>>(() => getInitialForm(config, mode === 'create' ? null : record))
  const [message, setMessage] = useState<string | null>(null)
  const [patientIdModalOpen, setPatientIdModalOpen] = useState(false)
  const [confirmPatientId, setConfirmPatientId] = useState('')
  const [confirmPatientIdError, setConfirmPatientIdError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (error && mode !== 'create') return <OperationsShell title={config.title} error={error} />
  if (!record && mode !== 'create') return <OperationsShell title={config.title} error="Record not found." />
  const currentRecord = record

  function updateField(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function save() {
    setMessage(null)
    startTransition(async () => {
      if (mode === 'create') {
        const response = await fetch(`/api/admin/operations/${config.slug}`, {
          body: JSON.stringify({ data: form }),
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null
          setMessage(data?.error || 'Failed to create record.')
          return
        }

        router.push(getOperationHref(config.slug))
        router.refresh()
        return
      }

      const response = await fetch(`/api/admin/operations/${config.slug}/${currentRecord!.id}`, {
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

      router.push(getOperationHref(config.slug, 'view', currentRecord!.id))
      router.refresh()
    })
  }

  function markConfirmed() {
    const status = config.slug === 'inquiries' ? 'resolved' : config.slug === 'profiles' ? 'active' : config.slug === 'feedback' ? 'approved' : 'confirmed'
    if (config.slug === 'appointments') {
      const existingPatientId = typeof currentRecord?.patient_id === 'string' && currentRecord.patient_id !== '00000000' ? currentRecord.patient_id : ''
      setConfirmPatientId(existingPatientId)
      setConfirmPatientIdError(null)
      setPatientIdModalOpen(true)
      return
    }
    updateStatus(status)
  }

  function confirmAppointment() {
    const patientId = confirmPatientId.trim()
    if (!patientId) {
      setConfirmPatientIdError('Patient ID is required to confirm this appointment.')
      return
    }
    setConfirmPatientIdError(null)
    setPatientIdModalOpen(false)
    updateStatus('confirmed', { patient_id: patientId })
  }

  function updateStatus(status: string, data?: Record<string, string>) {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch(`/api/admin/operations/${config.slug}/${currentRecord!.id}`, {
        body: JSON.stringify(data ? { data: { status, ...data } } : { status }),
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
    <main className="mx-auto flex w-full flex-col gap-6 px-20 py-8">
      <header className="border-b border-[#e7dfd5] bg-white px-1 pb-5">
        <h1 className="m-0 text-2xl font-bold text-[#2b2823]">{mode === 'create' ? `New ${config.singularTitle}` : `${config.singularTitle} Details`}</h1>
      </header>

      {message ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div> : null}

      {mode === 'create' || mode === 'edit' ? (
        <EditForm config={config} disabled={isPending} form={form} isNew={mode === 'create'} onChange={updateField} onSave={save} record={record} referenceOptions={referenceOptions} />
      ) : record ? (
        <ViewDetails config={config} isPending={isPending} markConfirmed={markConfirmed} record={record} />
      ) : null}

      {patientIdModalOpen ? (
        <PatientIdModal
          disabled={isPending}
          error={confirmPatientIdError}
          patientId={confirmPatientId}
          onCancel={() => {
            setConfirmPatientIdError(null)
            setPatientIdModalOpen(false)
          }}
          onChange={(value) => {
            setConfirmPatientId(value)
            setConfirmPatientIdError(null)
          }}
          onConfirm={confirmAppointment}
        />
      ) : null}
    </main>
  )
}

function PatientIdModal({ disabled, error, onCancel, onChange, onConfirm, patientId }: { disabled: boolean; error: string | null; onCancel: () => void; onChange: (value: string) => void; onConfirm: () => void; patientId: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <section className="w-full max-w-md rounded-2xl border border-[#e7dfd5] bg-white p-6 shadow-[0_18px_48px_rgb(50_39_24_/_20%)]">
        <h2 className="m-0 text-2xl font-bold text-[#2b2823]">Confirm Appointment</h2>
        <p className="mb-5 mt-2 text-sm leading-6 text-[#716b60]">Enter the hospital patient ID before saving this appointment as confirmed.</p>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-[#716b60]">Patient ID</span>
          <input
            autoFocus
            className="rounded-xl border border-[#e7dfd5] px-4 py-3 text-base"
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Enter patient ID"
            type="text"
            value={patientId}
          />
          {error ? <span className="text-sm font-medium text-red-700">{error}</span> : null}
        </label>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button className="rounded-xl border-none bg-[#ebe7e1] px-5 py-3 font-bold text-[#2b2823]" disabled={disabled} onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="rounded-xl border-none bg-[#22a95a] px-5 py-3 font-bold text-white" disabled={disabled} onClick={onConfirm} type="button">
            Save & Confirm
          </button>
        </div>
      </section>
    </div>
  )
}

function ViewDetails({ config, isPending, markConfirmed, record }: { config: OperationConfig; isPending: boolean; markConfirmed: () => void; record: OperationRecord }) {
  return (
    <>
      <section className="rounded-2xl border border-[#e7dfd5] bg-white p-6 shadow-[0_10px_24px_rgb(50_39_24_/_6%)]">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="m-0 text-3xl font-bold text-[#2b2823]">{config.singularTitle} #{shortId(record.id)}</h2>
              {config.statusOptions.length ? <span className={`rounded-full px-4 py-2 text-sm capitalize ${statusColor(record.status || 'unknown')}`}>{record.status || 'unknown'}</span> : null}
            </div>
            <p className="mb-0 mt-4 text-lg text-[#716b60]">Created on {formatDate(record.created_at)}</p>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-xl bg-[#b89148] px-5 py-3 font-bold text-white no-underline" href={getOperationHref(config.slug, 'edit', record.id)}>
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

      <ContentCard title={config.slug === 'appointments' ? 'Reason for Visit' : config.slug === 'purchases' ? 'Note' : config.slug === 'profiles' || config.slug === 'patients' ? 'Additional Info' : 'Inquiry Message'}>
        {String(record.message || record.bio || record.address || 'No additional information.')}
      </ContentCard>

      <ContentCard title="Record Metadata">
        {`ID: ${record.id}\nLanguage: ${record.language || '-'}\nSource: ${record.source || '-'}`}
      </ContentCard>

      <div className="flex flex-wrap gap-3">
        {!config.statusOptions.length ? null : config.slug === 'feedback' && record?.status === 'approved' ? (
          <div className="rounded-xl bg-[#dcf7e9] px-8 py-4 font-bold text-[#065f46]">
            Approved ✓
          </div>
        ) : config.slug === 'feedback' && record?.status === 'rejected' ? (
          <div className="rounded-xl bg-[#fee2e2] px-8 py-4 font-bold text-[#991b1b]">
            Rejected ✗
          </div>
        ) : (
          <button className="rounded-xl bg-[#22a95a] border-none px-8 py-4 font-bold text-white" disabled={isPending} onClick={markConfirmed} type="button">
            Mark as {config.slug === 'inquiries' ? 'Resolved' : config.slug === 'profiles' ? 'Active' : config.slug === 'feedback' ? 'Approved' : 'Confirmed'}
          </button>
        )}
        <Link className="rounded-xl bg-[#ebe7e1] px-8 py-4 font-bold text-[#2b2823] no-underline" href={getOperationHref(config.slug, 'edit', record.id)}>
          Update Content
        </Link>
      </div>
    </>
  )
}

function EditForm({ config, disabled, form, isNew, onChange, onSave, record, referenceOptions }: { config: OperationConfig; disabled: boolean; form: Record<string, string>; isNew: boolean; onChange: (key: string, value: string) => void; onSave: () => void; record?: OperationRecord | null; referenceOptions?: ReferenceOptionMap }) {
  return (
    <section className="rounded-2xl border border-[#e7dfd5] bg-white p-6 shadow-[0_10px_24px_rgb(50_39_24_/_6%)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="m-0 text-3xl font-bold text-[#2b2823]">{isNew ? `New ${config.singularTitle}` : `Edit ${config.singularTitle} #${record ? shortId(record.id) : ''}`}</h2>
          <p className="mb-0 mt-2 text-sm text-[#716b60]">{isNew ? `Create a new record in public.${config.slug}.` : `Update public.${config.slug}; no schema changes are made.`}</p>
        </div>
        <Link className="rounded-xl bg-[#ebe7e1] px-5 py-3 font-bold text-[#2b2823] no-underline" href={getOperationHref(config.slug)}>
          Cancel
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {config.editableFields.map((field) => (
          <label className={field.type === 'textarea' ? 'flex flex-col gap-2 md:col-span-2' : 'flex flex-col gap-2'} key={field.key}>
            <span className="text-sm font-bold text-[#716b60]">{field.label}</span>
            {field.key === 'status' ? (
              <select className="rounded-xl border border-[#e7dfd5] px-4 py-3 text-base" disabled={disabled} onChange={(event) => onChange(field.key, event.target.value)} value={form[field.key] || ''}>
                <option value="">Select status</option>
                {config.statusOptions.map((option) => (
                  <option key={option} value={option}>{formatLabel(option)}</option>
                ))}
              </select>
            ) : referenceOptions && referenceOptions[field.key] ? (
              <select className="rounded-xl border border-[#e7dfd5] px-4 py-3 text-base" disabled={disabled} onChange={(event) => onChange(field.key, event.target.value)} value={form[field.key] || ''}>
                <option value="">Select {field.label}</option>
                {referenceOptions[field.key].map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            ) : field.type === 'boolean' ? (
              <select className="rounded-xl border border-[#e7dfd5] px-4 py-3 text-base" disabled={disabled} onChange={(event) => onChange(field.key, event.target.value)} value={form[field.key] || ''}>
                <option value="">Select {field.label}</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
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
        <button className="rounded-xl bg-[#b89148] border-none px-8 py-4 font-bold text-white" disabled={disabled} onClick={onSave} type="button">
          {isNew ? 'Create Record' : 'Save Changes'}
        </button>
        <Link className="rounded-xl bg-[#ebe7e1] px-8 py-4 font-bold text-[#2b2823] no-underline" href={getOperationHref(config.slug)}>
          {isNew ? 'Back to List' : 'Back to Detail'}
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

function getInitialForm(config: OperationConfig, record: OperationRecord | null | undefined) {
  return Object.fromEntries(
    config.editableFields.map((field) => [field.key, formatInputValue(record?.[field.key], field.type)])
  )
}

function getDetailItems(config: OperationConfig, record: OperationRecord) {
  if (config.slug === 'feedback') {
    const fullName = [record.first_name, record.last_name].filter(Boolean).join(' ') || '-'
    return [
      { icon: UserRound, label: 'Name', value: fullName, subValue: record.email || undefined },
      { icon: Phone, label: 'Phone', value: record.phone || '-' },
      { icon: ClipboardList, label: 'Nationality', value: record.nationality || '-' },
      { icon: CalendarDays, label: 'Date of Birth', value: record.date_of_birth || '-' },
      { icon: ClipboardList, label: 'Role', value: record.role || '-' },
      { icon: ClipboardList, label: 'Clinic Visited', value: record.clinic_visited || '-' },
      { icon: ClipboardList, label: 'Feedback Type', value: record.feedback_type || '-' },
      { icon: MessageSquare, label: 'Comment', value: record.comment || '-' },
      { icon: Mail, label: 'Locale', value: record.locale || undefined },
    ]
  }

  if (config.slug === 'appointments') {
    return [
      { icon: CalendarDays, label: 'Date & Time', value: record.preferred_date || formatDate(record.slot_start), subValue: record.preferred_time || formatTimeRange(record.slot_start, record.slot_end) },
      // { icon: Package, label: 'Services & Branch', value: valueWithFallback(record.department_payload_id, 'Department not assigned'), subValue: valueWithFallback(record.branch_payload_id, 'Branch not assigned') },
      // { icon: ClipboardList, label: 'Doctor', value: valueWithFallback(record.doctor_payload_id, 'Doctor not assigned'), subValue: record.source || undefined },
      // { icon: Package, label: 'Services & Branch', value: valueWithFallback(record.department_payload_id, 'Department not assigned'), subValue: valueWithFallback(record.branch_payload_id, 'Branch not assigned') },
      // { icon: ClipboardList, label: 'Doctor', value: valueWithFallback(record.doctor_payload_id, 'Doctor not assigned'), subValue: record.source || undefined },
      { icon: Package, label: 'Services & Branch', value: resolvedValue(record, 'department_payload_id'), subValue: resolvedValue(record, 'branch_payload_id') },
      { icon: ClipboardList, label: 'Doctor & Source', value: resolvedValue(record, 'doctor_payload_id'), subValue: record.source || undefined },
      { icon: UserRound, label: 'Patient', value: record.patient_name, subValue: record.patient_email || undefined },
      { icon: ClipboardList, label: 'Patient ID', value: record.patient_id || '-' },
      { icon: Phone, label: 'Contact Phone', value: record.patient_phone },
    ]
  }

  if (config.slug === 'purchases') {
    const branchName = resolvedValue(record, 'branch_payload_id') || record.branch_id || 'Branch not assigned'
    return [
      { icon: Package, label: 'Promotions Package', value: record.promotion_title || resolvedValue(record, 'promotion_payload_id'), subValue: branchName },
      { icon: UserRound, label: 'Patient', value: record.patient_name, subValue: record.patient_email || undefined },
      { icon: Phone, label: 'Contact Phone', value: record.patient_phone },
    ]
  }

  if (config.slug === 'profiles' || config.slug === 'patients') {
    return [
      { icon: UserRound, label: 'Name', value: record.name || record.full_name || record.display_name, subValue: record.email || record.email_user || record.phone || undefined },
      { icon: Mail, label: 'Email', value: record.email || record.email_user },
      { icon: Phone, label: 'Phone', value: record.phone },
      { icon: ClipboardList, label: 'Role', value: record.role || record.user_type || 'Customer' },
      { icon: ClipboardList, label: 'Gender', value: record.gender || '-' },
      { icon: ClipboardList, label: 'Language', value: record.language || '-' },
      { icon: CalendarDays, label: 'Date of Birth', value: record.date_of_birth && typeof record.date_of_birth === 'string' ? formatDate(record.date_of_birth) : '-' },
    ]
  }

  return [
    { icon: UserRound, label: 'Customer', value: record.name, subValue: record.email || undefined },
    { icon: Phone, label: 'Contact Phone', value: record.phone },
    { icon: Mail, label: 'Email', value: record.email },
    { icon: ClipboardList, label: 'Subject', value: record.subject },
  ]
}

function shortId(id: string | number) {
  return String(id).slice(0, 8)
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

function resolvedValue(record: OperationRecord, fieldKey: string): string {
  const resolvedKey = `${fieldKey}_resolved`
  const resolved = record[resolvedKey]
  if (resolved && typeof resolved === 'string') return resolved
  const raw = record[fieldKey]
  return raw != null ? String(raw) : '-'
}
