'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export function DatePicker({
  label, value, onChange, placeholder, labelCls = '',
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  labelCls?: string
}) {
  const t = useTranslations('FormControls')
  const MONTHS = t.raw('months') as string[]
  const DAYS_SHORT = t.raw('daysShort') as string[]
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const today = new Date()

  const [viewYear, setViewYear] = useState(() =>
    value ? parseInt(value.split('-')[0]) : today.getFullYear()
  )
  const [viewMonth, setViewMonth] = useState(() =>
    value ? parseInt(value.split('-')[1]) - 1 : today.getMonth()
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  const selectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${viewYear}-${m}-${d}`)
    setOpen(false)
  }

  const selParts = value ? value.split('-').map(Number) : null

  return (
    <div ref={ref} className="relative flex flex-col gap-[8px]">
      {label && (
        <label className={labelCls || 'font-dm-sans font-medium text-[13px] sm:text-[15px] text-[#3b2d17]'}>{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full border border-[#dcbd72] rounded-[12px] px-3.5 py-2.5 sm:px-[16px] sm:py-[12px] font-dm-sans text-[15px] sm:text-[16px] bg-transparent outline-none focus:border-[#b89148] transition-colors flex items-center justify-between gap-2 text-left"
        style={{ color: displayValue ? '#3b2d17' : 'rgba(59,45,23,0.4)' }}
      >
        <span>{displayValue || placeholder || t('selectDate')}</span>
        <Calendar size={16} className="text-[#b89148] shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 z-[100] bg-white rounded-[16px] shadow-[0px_8px_40px_rgba(122,95,44,0.20)] border border-[#e8d9b8] p-4 w-[288px]">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="size-8 flex items-center justify-center rounded-full hover:bg-[#f5edd8] transition-colors"
            >
              <ChevronLeft size={16} className="text-[#3b2d17]" />
            </button>
            <span className="font-dm-sans font-semibold text-[14px] text-[#3b2d17]">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="size-8 flex items-center justify-center rounded-full hover:bg-[#f5edd8] transition-colors"
            >
              <ChevronRight size={16} className="text-[#3b2d17]" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_SHORT.map(d => (
              <div key={d} className="text-center font-dm-sans text-[11px] text-[#b89148] font-semibold uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isSelected = selParts &&
                selParts[0] === viewYear &&
                selParts[1] - 1 === viewMonth &&
                selParts[2] === day
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className="size-8 mx-auto flex items-center justify-center rounded-full font-dm-sans text-[13px] transition-colors hover:bg-[#f5edd8]"
                  style={{
                    background: isSelected ? '#b89148' : isToday ? 'rgba(184,145,72,0.12)' : undefined,
                    color: isSelected ? '#fff' : '#3b2d17',
                    fontWeight: isSelected || isToday ? '600' : '400',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function CustomSelect({
  label, value, onChange, options, placeholder, labelCls = '',
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  labelCls?: string
}) {
  const t = useTranslations('FormControls')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative flex flex-col gap-[8px]">
      {label && (
        <label className={labelCls || 'font-dm-sans font-medium text-[13px] sm:text-[15px] text-[#3b2d17]'}>{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full border border-[#dcbd72] rounded-[12px] px-3.5 py-2.5 sm:px-[16px] sm:py-[12px] font-dm-sans text-[15px] sm:text-[16px] bg-transparent outline-none transition-colors flex items-center justify-between gap-2 text-left"
        style={{
          color: value ? '#3b2d17' : 'rgba(59,45,23,0.4)',
          borderColor: open ? '#b89148' : '#dcbd72',
        }}
      >
        <span className="truncate">{value || placeholder || t('selectPlaceholder')}</span>
        <ChevronDown
          size={16}
          className="text-[#b89148] shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 z-[100] bg-white rounded-[12px] shadow-[0px_8px_40px_rgba(122,95,44,0.18)] border border-[#e8d9b8] overflow-hidden w-full" style={{ maxHeight: 240, overflowY: 'auto' }}>
          {options.map(o => (
            <button
              key={o}
              type="button"
              onClick={() => { onChange(o); setOpen(false) }}
              className="w-full text-left px-[16px] py-[11px] font-dm-sans text-[15px] transition-colors hover:bg-[#fdf6e8]"
              style={{
                background: o === value ? 'rgba(184,145,72,0.08)' : undefined,
                color: o === value ? '#b89148' : '#3b2d17',
                fontWeight: o === value ? '600' : '400',
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
