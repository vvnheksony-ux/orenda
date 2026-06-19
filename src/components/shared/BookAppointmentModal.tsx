'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth-context'
import { useBranch } from '@/lib/branch-context'
import LoginModal from '@/components/shared/LoginModal'

interface Props {
  open: boolean
  onClose: () => void
  defaultService?: string
}

const inputCls = 'w-full border border-[#7a5f2c] rounded-[12px] px-[12px] py-[12px] font-dm-sans text-[16px] text-[#3b2d17] bg-white outline-none focus:border-[#b89148] transition-colors placeholder:text-[rgba(59,45,23,0.3)]'
const labelCls = 'font-dm-sans font-medium text-[16px] text-[#7a5f2c]'

const TIME_PERIODS = [
  { id: 'early-morning',  label: 'Early Morning',  range: '7am – 9am',   time: '07:00 AM', start: 7,  end: 9  },
  { id: 'morning',        label: 'Morning',        range: '9am – 11am',  time: '09:00 AM', start: 9,  end: 11 },
  { id: 'late-morning',   label: 'Late Morning',   range: '11am – 1pm',  time: '11:00 AM', start: 11, end: 13 },
  { id: 'afternoon',      label: 'Afternoon',      range: '1pm – 3pm',   time: '01:00 PM', start: 13, end: 15 },
  { id: 'late-afternoon', label: 'Late Afternoon', range: '3pm – 5pm',   time: '03:00 PM', start: 15, end: 17 },
  { id: 'evening',        label: 'Evening',        range: '5pm – 8pm',   time: '05:00 PM', start: 17, end: 20 },
]

function localDateString(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function availablePeriodsForDate(date: string, now = new Date()) {
  const today = localDateString(now)
  if (date !== today) return TIME_PERIODS
  const h = now.getHours()
  return TIME_PERIODS.filter(p => p.end > h + 1)
}

function getEarliestAppointment(now = new Date()) {
  const today = localDateString(now)
  const periods = availablePeriodsForDate(today, now)
  if (periods[0]) return { date: today, time: periods[0].time }
  return { date: localDateString(addDays(now, 1)), time: TIME_PERIODS[0].time }
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['S','M','T','W','T','F','S']

function CustomSelect({ value, onChange, options, placeholder, disabled }: {
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string; group?: string }>
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const selected = options.find(o => o.value === value)

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: r.bottom + 4,
      left: r.left,
      width: r.width,
      zIndex: 9999,
    })
  }, [open])

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const groups = options.reduce<Record<string, Array<{ value: string; label: string }>>>((acc, o) => {
    const g = o.group ?? ''
    acc[g] = acc[g] ?? []
    acc[g].push({ value: o.value, label: o.label })
    return acc
  }, {})

  const dropdown = open ? (
    <div
      style={{ ...dropdownStyle, background: '#fbf7ee', border: '1px solid #dcbd72', borderRadius: 12, boxShadow: '0px 8px 24px rgba(89,69,34,0.18)', overflow: 'hidden', maxHeight: 240, overflowY: 'auto' }}
    >
      {Object.entries(groups).map(([group, opts]) => (
        <div key={group}>
          {group && (
            <div className="px-[16px] py-[8px] font-dm-sans text-[11px] text-[#b89148] font-semibold uppercase tracking-wider border-b border-[#ead6a4]/60">
              {group}
            </div>
          )}
          {opts.map(o => (
            <button
              key={o.value}
              type="button"
              onMouseDown={e => { e.preventDefault(); onChange(o.value); setOpen(false) }}
              className={`w-full text-left px-[16px] py-[10px] font-dm-sans text-[15px] transition-colors ${
                o.value === value ? 'bg-[#b89148] text-white' : 'text-[#3b2d17] hover:bg-[#f0e8d4]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  ) : null

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
      onClick={() => {
        if (disabled) return
        setOpen(v => !v)
      }}
      disabled={disabled}
      className={`w-full border border-[#7a5f2c] rounded-[12px] px-[12px] py-[12px] font-dm-sans text-[16px] bg-white outline-none flex items-center justify-between focus:border-[#b89148] transition-colors ${
        disabled ? 'cursor-not-allowed bg-[#f5f0e5] text-[rgba(59,45,23,0.45)]' : ''
      }`}
    >
      <span className={selected ? 'text-[#3b2d17]' : 'text-[rgba(59,45,23,0.3)]'}>
        {selected?.label ?? placeholder ?? ''}
      </span>
      <ChevronDown size={20} className={`shrink-0 transition-transform duration-200 ${disabled ? 'text-[rgba(59,45,23,0.35)]' : 'text-[#3b2d17]'} ${open ? 'rotate-180' : ''}`} />
    </button>
      {typeof document !== 'undefined' && dropdown && createPortal(dropdown, document.body)}
    </div>
  )
}

type Doctor = { id: string; name: string; specialty: string; department: string; department_payload_id: string }
type Department = { id: string; name: string }
type Service = { id: string; title: string; department?: { id: string; name: string } | null }

export default function BookAppointmentModal({ open, onClose, defaultService = '' }: Props) {
  const locale = useLocale()
  const t = useTranslations('BookAppointmentModal')
  const { user, loading: authLoading } = useAuth()
  const { selectedBranch } = useBranch()
  const [dateChoice, setDateChoice] = useState<'earliest' | 'choose'>('earliest')
  const [form, setForm] = useState(() => {
    const earliest = getEarliestAppointment()
    return {
      patient_name: '', patient_phone: '', patient_email: '',
      department_id: defaultService, department_payload_id: '', doctor_payload_id: '', service_payload_id: '',
      preferred_date: earliest.date, preferred_time: earliest.time, message: '',
    }
  })
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())

  useEffect(() => {
    // Reset all selections that depend on branch when branch changes
    setForm(f => ({ ...f, department_payload_id: '', department_id: '', service_payload_id: '', doctor_payload_id: '' }))
    const deptUrl = selectedBranch
      ? `/api/departments?locale=${locale}&branch=${selectedBranch.id}`
      : `/api/departments?locale=${locale}`
    fetch(deptUrl)
      .then(r => r.ok ? r.json() : { docs: [] })
      .then(d => setDepartments((d.docs ?? []).map((dept: any) => ({ id: String(dept.id), name: dept.name ?? '' }))))
      .catch(() => {})
    const docUrl = selectedBranch
      ? `/api/doctors?locale=${locale}&branch=${selectedBranch.id}`
      : `/api/doctors?locale=${locale}`
    fetch(docUrl)
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setDoctors(d) })
      .catch(() => {})
  }, [locale, selectedBranch])

  useEffect(() => {
    if (!departments.length || !form.department_id || form.department_payload_id) return
    const matched = departments.find(d => d.name === form.department_id)
    if (matched) setForm(f => ({ ...f, department_id: matched.name, department_payload_id: matched.id }))
  }, [departments, form.department_id, form.department_payload_id])

  useEffect(() => {
    const svcUrl = form.department_payload_id
      ? `/api/services?locale=${locale}&department=${form.department_payload_id}`
      : `/api/services?locale=${locale}`
    fetch(svcUrl)
      .then(r => r.ok ? r.json() : { docs: [] })
      .then(d => setServices((d.docs ?? []).map((s: any) => ({ id: String(s.id), title: s.title ?? '', department: s.department ?? null }))))
      .catch(() => {})
  }, [locale, form.department_payload_id])

  useEffect(() => {
    if (!open) return
    const scrollY      = window.scrollY
    const scrollbarW   = window.innerWidth - document.documentElement.clientWidth
    const htmlEl       = document.documentElement
    const bodyEl       = document.body
    const prevHtmlOverflow   = htmlEl.style.overflow
    const prevBodyOverflow   = bodyEl.style.overflow
    const prevBodyPosition   = bodyEl.style.position
    const prevBodyTop        = bodyEl.style.top
    const prevBodyWidth      = bodyEl.style.width
    const prevBodyPaddingRight = bodyEl.style.paddingRight
    htmlEl.style.overflow      = 'hidden'
    bodyEl.style.overflow      = 'hidden'
    bodyEl.style.position      = 'fixed'
    bodyEl.style.top           = `-${scrollY}px`
    bodyEl.style.width         = '100%'
    // Compensate scrollbar disappearing so layout doesn't shift
    if (scrollbarW > 0) bodyEl.style.paddingRight = `${scrollbarW}px`
    return () => {
      htmlEl.style.overflow    = prevHtmlOverflow
      bodyEl.style.overflow    = prevBodyOverflow
      bodyEl.style.position    = prevBodyPosition
      bodyEl.style.top         = prevBodyTop
      bodyEl.style.width       = prevBodyWidth
      bodyEl.style.paddingRight = prevBodyPaddingRight
      window.scrollTo(0, scrollY)
    }
  }, [open])

  const today = localDateString()
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleDateSelect = (dateStr: string) => {
    setForm(f => {
      const periods = availablePeriodsForDate(dateStr)
      const currentPeriod = TIME_PERIODS.find(p => p.time === f.preferred_time)
      const keep = currentPeriod && periods.some(p => p.id === currentPeriod.id)
      return { ...f, preferred_date: dateStr, preferred_time: keep ? f.preferred_time : (periods[0]?.time ?? TIME_PERIODS[0].time) }
    })
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const selectedPeriod = TIME_PERIODS.find(p => p.time === form.preferred_time)

  const handleClose = () => {
    if (status === 'loading') return
    setStatus('idle'); setError(''); setSubmitted(false)
    onClose()
  }

  const handleDepartmentChange = (value: string) => {
    const matched = departments.find(d => d.id === value)
    setForm(f => ({ ...f, department_id: matched?.name ?? '', department_payload_id: matched?.id ?? '', service_payload_id: '', doctor_payload_id: '' }))
  }

  const handleDoctorChange = (v: string) => {
    const doc = doctors.find(d => d.id === v)
    if (doc?.department_payload_id && !form.department_payload_id) {
      const dept = departments.find(d => d.id === doc.department_payload_id)
      setForm(f => ({ ...f, doctor_payload_id: v, department_id: dept?.name ?? doc.department, department_payload_id: doc.department_payload_id, service_payload_id: '' }))
    } else {
      set('doctor_payload_id', v)
    }
  }

  const filteredDoctors = form.department_payload_id
    ? doctors.filter(d => d.department_payload_id === form.department_payload_id)
    : doctors
  const serviceLocked = Boolean(form.department_payload_id) && services.length === 0
  const requiredReady = Boolean(form.patient_name.trim() && form.patient_phone.trim())

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!form.patient_name.trim() || !form.patient_phone.trim()) {
      setError('Patient name and phone are required.')
      return
    }
    const preferred = dateChoice === 'earliest'
      ? getEarliestAppointment()
      : { date: form.preferred_date, time: form.preferred_time }
    setStatus('loading'); setError('')
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: form.patient_name,
          patient_phone: form.patient_phone,
          patient_email: form.patient_email || null,
          doctor_payload_id: form.doctor_payload_id ? Number(form.doctor_payload_id) : null,
          department_payload_id: form.department_payload_id ? Number(form.department_payload_id) : null,
          branch_payload_id: selectedBranch ? Number(selectedBranch.id) : null,
          department_id: form.department_id || null,
          preferred_date: preferred.date,
          preferred_time: preferred.time,
          source: 'website',
          message: form.message || null,
          language: locale,
          status: 'pending',
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Something went wrong.'); setStatus('error'); return }
      setStatus('success'); setSubmitted(false)
    } catch {
      setError('Could not reach the server. Please try again.'); setStatus('error')
    }
  }

  const reqCls = (missing: boolean) => missing && submitted ? ' !border-red-400' : ''

  if (open && !authLoading && !user) {
    return (
      <LoginModal
        open={true}
        onClose={onClose}
        onSuccess={() => {}}
        redirectTo={typeof window !== 'undefined' ? window.location.pathname : '/'}
        initialView="login"
      />
    )
  }

  return (
    <>
      <AnimatePresence>
        {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] overflow-y-auto"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.25)]" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />

          {/* Centering wrapper — min-h-full so short modals stay centered */}
          <div className="relative min-h-full flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-[1100px] rounded-[12px] px-5 py-8 sm:px-8 sm:py-10 lg:px-14 lg:py-12 xl:px-[80px] xl:py-14 flex flex-col gap-6 sm:gap-8 lg:gap-[40px] items-center"
            style={{
              background: '#fbf7ee',
              boxShadow: '0px 4px 12px 3px rgba(89,69,34,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-[40px] lg:right-[40px] flex items-center justify-center rounded-full p-[10px] transition-colors hover:bg-black/10"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <X size={16} className="text-[#3b2d17]" />
            </button>

            {status === 'success' ? (
              <div className="flex flex-col items-center gap-[24px] py-[40px]">
                <div className="w-16 h-16 rounded-full bg-[#b89148] flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none text-center">{t('title')}</h2>
                <p className="font-dm-sans text-[20px] text-[#594522] text-center max-w-[480px]">{t('successMessage')}</p>
                <button
                  onClick={handleClose}
                  className="mt-2 h-[64px] px-[64px] rounded-[12px] font-dm-sans text-[16px] text-white"
                  style={{ background: 'rgba(184,145,72,0.7)', boxShadow: '0px 0px 12px 4px rgba(184,145,72,0.15)' }}
                >
                  {t('done')}
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex flex-col gap-[12px] text-center w-full leading-none">
                  <h2 className="font-cormorant font-bold text-[32px] sm:text-[40px] lg:text-[48px] text-[#3b2d17] leading-none w-full">
                    {t('title')}
                  </h2>
                  <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522] w-full">
                    {t('subtitle')}
                  </p>
                </div>

                <form onSubmit={submit} noValidate className="flex flex-col gap-[24px] w-full">

                  {/* Patient's Name */}
                  <div className="flex flex-col gap-[8px] w-full">
                    <label className={labelCls}>Patient&apos;s Name</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.patient_name}
                      onChange={e => set('patient_name', e.target.value)}
                      className={inputCls + reqCls(!form.patient_name.trim())}
                    />
                  </div>

                  {/* Email + Phone */}
                  <div className="flex flex-col sm:flex-row gap-[24px] w-full">
                    <div className="flex flex-1 flex-col gap-[8px]">
                      <label className={labelCls}>Email</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={form.patient_email}
                        onChange={e => set('patient_email', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-[8px]">
                      <label className={labelCls}>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="098 000 999"
                        value={form.patient_phone}
                        onChange={e => set('patient_phone', e.target.value)}
                        className={inputCls + reqCls(!form.patient_phone.trim())}
                      />
                    </div>
                  </div>

                  {/* Clinic (dept) */}
                  <div className="flex flex-col gap-[8px] w-full">
                    <label className={labelCls}>
                      Clinic <span className="text-[#b89148] font-normal">(Optional)</span>
                    </label>
                    <CustomSelect
                      value={form.department_payload_id}
                      onChange={handleDepartmentChange}
                      placeholder="Select department"
                      options={departments.map(d => ({ value: d.id, label: d.name }))}
                    />
                  </div>

                  {/* Service/Purpose + Doctor row */}
                  <div className="flex flex-col sm:flex-row gap-[24px] w-full">
                    <div className="flex flex-1 flex-col gap-[8px]">
                      <label className={labelCls}>
                        Service / Purpose <span className="text-[#b89148] font-normal">(Optional)</span>
                      </label>
                      <CustomSelect
                        value={form.service_payload_id}
                        onChange={v => set('service_payload_id', v)}
                        placeholder={
                          !form.department_payload_id
                            ? 'Select service'
                            : serviceLocked
                              ? 'No services available for this clinic'
                              : 'Select service'
                        }
                        options={services.map(s => ({ value: s.id, label: s.title }))}
                        disabled={serviceLocked}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-[8px]">
                      <label className={labelCls}>
                        Doctor&apos;s Name <span className="text-[#b89148] font-normal">(Optional)</span>
                      </label>
                      <CustomSelect
                        value={form.doctor_payload_id}
                        onChange={handleDoctorChange}
                        placeholder="Select doctor"
                        options={filteredDoctors.map(d => ({
                          value: d.id,
                          label: d.name + (d.specialty ? ` — ${d.specialty}` : ''),
                          group: d.department || 'General',
                        }))}
                      />
                    </div>
                  </div>

                  {/* Date radios */}
                  <div className="flex flex-col gap-[24px]">
                    {(['earliest', 'choose'] as const).map((choice, i) => (
                      <label key={choice} className="flex items-center gap-[16px] cursor-pointer" onClick={() => setDateChoice(choice)}>
                        <div className="shrink-0 size-[24px] rounded-[10px] border-[1.5px] border-[#b89148] flex items-center justify-center transition-colors relative overflow-hidden">
                          {dateChoice === choice && <div className="size-[12px] rounded-full bg-[#b89148] absolute" />}
                        </div>
                        <span className="font-dm-sans text-[16px] text-[#7a5f2c]">
                          {i === 0 ? 'Earliest date available' : 'Choose Prefer Date'}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Date + Time — only when choose */}
                  {dateChoice === 'choose' && (
                    <div className="flex flex-col lg:flex-row gap-4 w-full">

                      {/* ── Calendar ── */}
                      <div className="flex-1 min-w-0">
                        <p className="font-dm-sans text-[16px] text-[#3b2d17] mb-2">Preferred date</p>
                        <div className="px-4 py-3 rounded-xl outline outline-1 outline-[#7a5f2c] flex items-center justify-between bg-white mb-3">
                          <span className="font-dm-sans text-[16px] text-[#3b2d17] leading-6">
                            {form.preferred_date
                              ? new Date(form.preferred_date + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                              : '12/05/2026'}
                          </span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b2d17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        </div>
                        {/* Calendar card — square */}
                        <div
                          className="w-full rounded-[20px] overflow-hidden"
                          style={{
                            background: '#faf8f4',
                            boxShadow: '0px 1px 3px rgba(28,21,10,0.04), 0px 4px 16px rgba(28,21,10,0.06), inset 0px 1px 0px rgba(255,255,255,0.9)',
                            outline: '1.3px solid rgba(120,113,108,0.7)',
                          }}
                        >
                          {/* Month nav */}
                          <div className="flex items-center justify-between px-4 pt-5 pb-4">
                            <button type="button" onClick={prevMonth} className="size-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
                              <span className="font-dm-sans font-bold text-[16px] text-stone-500 leading-none">‹</span>
                            </button>
                            <span className="font-dm-sans font-semibold text-[13px] text-stone-900">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                            <button type="button" onClick={nextMonth} className="size-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
                              <span className="font-dm-sans font-bold text-[16px] text-stone-500 leading-none">›</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-7 px-1">
                            {DAY_NAMES.map((d, i) => (
                              <div key={i} className="text-center font-dm-sans font-semibold text-[11px] text-stone-500 py-1">{d}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 px-1 pb-4">
                            {Array.from({ length: firstDay }).map((_, i) => <div key={'e'+i} />)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                              const day = i + 1
                              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                              const isPast = dateStr < today
                              const isToday = dateStr === today
                              const isSelected = dateStr === form.preferred_date
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => handleDateSelect(dateStr)}
                                  className={[
                                    'mx-auto flex items-center justify-center w-9 h-10 rounded-full font-dm-sans font-semibold text-[12px] transition-colors',
                                    isPast ? 'text-stone-300 cursor-not-allowed' : 'cursor-pointer',
                                    isSelected ? 'bg-[#b89148] text-white' : '',
                                    isToday && !isSelected ? 'text-orange-400' : '',
                                    !isPast && !isSelected && !isToday ? 'text-slate-700 hover:bg-black/5' : '',
                                  ].join(' ')}
                                  style={isToday && !isSelected ? { outline: '1.3px solid rgba(251,146,60,0.5)', outlineOffset: '-1.3px' } : undefined}
                                >
                                  {day}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* ── Time periods ── */}
                      <div className="flex-1 min-w-0">
                        <p className="font-dm-sans text-[16px] text-[#3b2d17] mb-2">Preferred time</p>
                        <div className="px-4 py-3 rounded-xl outline outline-1 outline-[#7a5f2c] flex items-center justify-between bg-white mb-3">
                          <span className="font-dm-sans text-[16px] text-[#3b2d17] leading-6">
                            {TIME_PERIODS.find(p => p.time === form.preferred_time)?.time ?? '12:00 AM'}
                          </span>
                          <ChevronDown size={24} className="text-[#3b2d17]" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {TIME_PERIODS.map(p => {
                            const isActive = form.preferred_time === p.time
                            const available = availablePeriodsForDate(form.preferred_date).some(a => a.id === p.id)
                            return (
                              <button
                                key={p.id}
                                type="button"
                                disabled={!available}
                                onClick={() => set('preferred_time', p.time)}
                                className={[
                                  'w-full p-4 rounded-2xl flex items-center gap-4 text-left transition-all',
                                  !available ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
                                ].join(' ')}
                                style={{
                                  background: isActive ? '#b89148' : '#faf8f4',
                                  boxShadow: '0px 1px 3px rgba(28,21,10,0.04), 0px 4px 16px rgba(28,21,10,0.06), inset 0px 1px 0px rgba(255,255,255,0.9)',
                                  outline: isActive ? 'none' : '1px solid rgba(120,113,108,0.9)',
                                  outlineOffset: '-1.1px',
                                }}
                              >
                                <span className={`font-dm-sans font-bold text-[12px] leading-3 ${isActive ? 'text-white' : 'text-slate-700'}`}>{p.label}</span>
                                <span className={`font-dm-sans font-medium text-[10px] leading-3 ${isActive ? 'text-white/80' : 'text-stone-500'}`}>{p.range}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Request */}
                  <div className="flex flex-col gap-[8px] w-full">
                    <label className={labelCls}>Personal Request</label>
                    <textarea
                      rows={4}
                      placeholder="Enter your message here"
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      className={inputCls + ' resize-none'}
                    />
                  </div>

                  {error && <p className="font-dm-sans text-[14px] text-red-400 w-full">{error}</p>}

                  {/* Submit — matches Figma: full width, h-64px, rgba(184,145,72,0.7) */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-[64px] rounded-[12px] font-dm-sans text-[16px] text-[#f9f9f9] disabled:opacity-60 transition-opacity hover:opacity-90"
                    style={{
                      background: requiredReady ? '#b89148' : 'rgba(184,145,72,0.7)',
                      boxShadow: requiredReady ? '0px 0px 12px 4px rgba(184,145,72,0.22)' : '0px 0px 12px 4px rgba(184,145,72,0.15)',
                    }}
                  >
                    {status === 'loading' ? 'Booking...' : 'Book Appointment'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

    </>
  )
}
