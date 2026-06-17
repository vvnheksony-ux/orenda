'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, Clock, Building2, Stethoscope, MapPin, X, Phone, Mail } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import BookAppointmentButton from '@/components/shared/BookAppointmentButton'
import LoginModal from '@/components/shared/LoginModal'
import { useAuth } from '@/lib/auth-context'

interface Appointment {
  id: string
  patient_name: string
  patient_phone: string
  patient_email?: string
  preferred_date?: string
  preferred_time?: string
  status?: string
  doctor_name?: string | null
  department_name?: string | null
  branch_name?: string | null
  message?: string
  source?: string
  created_at: string
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status || 'pending').toLowerCase()
  const styles: Record<string, string> = {
    confirmed: 'bg-[#e8f5e9] text-[#2e7d32]',
    pending: 'bg-[#fff8e1] text-[#92400e]',
    cancelled: 'bg-[#fee2e2] text-[#991b1b]',
  }
  const label = s.charAt(0).toUpperCase() + s.slice(1)
  return (
    <span className={`px-3 py-1 rounded-full text-[12px] font-dm-sans ${styles[s] || styles.pending}`}>
      {label}
    </span>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-[10px]">
      <span className="text-[#b89148] mt-[2px]">{icon}</span>
      <div className="flex flex-col">
        <span className="font-dm-sans text-[12px] text-[#9a8a6a]">{label}</span>
        <span className="font-dm-sans text-[15px] text-[#3b2d17]">{value}</span>
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Appointment | null>(null)
  // Capture the deep-link id at first render, before the URL-sync effect runs.
  const [focusId] = useState(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null))

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => {
        const docs: Appointment[] = d.docs ?? []
        setAppointments(docs)
        // Deep-link: if the URL has ?id=<appointmentId> (e.g. from a push
        // notification), auto-open that appointment's detail modal.
        if (focusId) {
          const match = docs.find(a => a.id === focusId)
          if (match) setSelected(match)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading, focusId])

  // Refresh the list when returning to the tab (e.g. after an admin confirms),
  // so statuses update without a manual reload.
  useEffect(() => {
    if (!user) return
    const refetch = () => {
      fetch('/api/appointments')
        .then(r => r.json())
        .then(d => setAppointments(d.docs ?? []))
        .catch(() => {})
    }
    const onVisible = () => { if (document.visibilityState === 'visible') refetch() }
    window.addEventListener('focus', refetch)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', refetch)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [user])

  // Keep the URL in sync with the open appointment, so it's shareable and
  // matches the ?id= deep-link used by push notifications.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (selected) url.searchParams.set('id', selected.id)
    else url.searchParams.delete('id')
    window.history.replaceState(null, '', url.toString())
  }, [selected])

  // Lock background scroll while the detail modal is open.
  useEffect(() => {
    if (!selected) return
    const scrollY = window.scrollY
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth
    const htmlEl = document.documentElement
    const bodyEl = document.body
    const prev = {
      htmlOverflow: htmlEl.style.overflow,
      bodyOverflow: bodyEl.style.overflow,
      bodyPosition: bodyEl.style.position,
      bodyTop: bodyEl.style.top,
      bodyWidth: bodyEl.style.width,
      bodyPaddingRight: bodyEl.style.paddingRight,
    }
    htmlEl.style.overflow = 'hidden'
    bodyEl.style.overflow = 'hidden'
    bodyEl.style.position = 'fixed'
    bodyEl.style.top = `-${scrollY}px`
    bodyEl.style.width = '100%'
    if (scrollbarW > 0) bodyEl.style.paddingRight = `${scrollbarW}px`
    return () => {
      htmlEl.style.overflow = prev.htmlOverflow
      bodyEl.style.overflow = prev.bodyOverflow
      bodyEl.style.position = prev.bodyPosition
      bodyEl.style.top = prev.bodyTop
      bodyEl.style.width = prev.bodyWidth
      bodyEl.style.paddingRight = prev.bodyPaddingRight
      window.scrollTo(0, scrollY)
    }
  }, [selected])

  if (!authLoading && !user) {
    return (
      <SiteLayout>
        <div className="min-h-screen bg-[#fbf7ee]" />
        <LoginModal
          open={true}
          onClose={() => window.location.href = '/'}
          onSuccess={() => window.location.href = '/appointments'}
          redirectTo="/appointments"
          initialView="login"
          message="Sign in to view your appointments and book new ones."
        />
      </SiteLayout>
    )
  }

  if (authLoading || loading) {
    return (
      <SiteLayout>
        <div className="min-h-screen bg-[#fbf7ee] flex items-center justify-center pt-[120px]">
          <div className="w-10 h-10 border-4 border-[#b89148] border-t-transparent rounded-full animate-spin" />
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      <div className="bg-[#fbf7ee] min-h-screen">
        <div className="narrow-shell pt-[140px] pb-[120px]">

          {/* Header */}
          <div className="flex items-start justify-between mb-[48px] flex-wrap gap-4">
            <div className="flex flex-col gap-[8px]">
              <h1 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">My Appointments</h1>
              <p className="font-dm-sans text-[18px] text-[#594522]">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found</p>
            </div>
            <BookAppointmentButton
              label="Book New Appointment"
              className="flex items-center gap-[8px] bg-[#b89148] hover:bg-[#9a7630] transition-colors text-white font-dm-sans text-[16px] px-[24px] py-[14px] rounded-[12px]"
            />
          </div>

          {/* Empty state */}
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[80px] gap-[20px] text-center">
              <CalendarDays size={64} className="text-[#b89148] opacity-40" />
              <p className="font-cormorant font-bold text-[32px] text-[#3b2d17]">No appointments yet</p>
              <p className="font-dm-sans text-[18px] text-[#594522]">Book your first appointment with our specialists.</p>
              <BookAppointmentButton
                label="Book Appointment"
                className="flex items-center justify-center bg-[#b89148] hover:bg-[#9a7630] transition-colors text-white font-dm-sans text-[16px] px-[32px] py-[14px] rounded-[12px]"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-[16px]">
              {appointments.map(appt => (
                <div
                  key={appt.id}
                  onClick={() => setSelected(appt)}
                  className="bg-white rounded-[16px] p-[24px] sm:p-[32px] flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ boxShadow: '0px 4px 16px rgba(184,145,72,0.10)' }}
                >
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex items-center gap-[12px] flex-wrap">
                      <p className="font-cormorant font-bold text-[22px] text-[#3b2d17]">{appt.patient_name}</p>
                      <StatusBadge status={appt.status} />
                    </div>
                    <div className="flex flex-wrap gap-[16px]">
                      {appt.doctor_name && (
                        <div className="flex items-center gap-[6px] text-[#594522]">
                          <Stethoscope size={15} />
                          <span className="font-dm-sans text-[14px]">{appt.doctor_name}</span>
                        </div>
                      )}
                      {appt.department_name && (
                        <div className="flex items-center gap-[6px] text-[#594522]">
                          <Building2 size={15} />
                          <span className="font-dm-sans text-[14px]">{appt.department_name}</span>
                        </div>
                      )}
                      {appt.branch_name && (
                        <div className="flex items-center gap-[6px] text-[#594522]">
                          <MapPin size={15} />
                          <span className="font-dm-sans text-[14px]">{appt.branch_name}</span>
                        </div>
                      )}
                      {appt.preferred_date && (
                        <div className="flex items-center gap-[6px] text-[#594522]">
                          <CalendarDays size={15} />
                          <span className="font-dm-sans text-[14px]">{new Date(appt.preferred_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                      {appt.preferred_time && (
                        <div className="flex items-center gap-[6px] text-[#594522]">
                          <Clock size={15} />
                          <span className="font-dm-sans text-[14px]">{appt.preferred_time}</span>
                        </div>
                      )}
                    </div>
                    {appt.message && (
                      <p className="font-dm-sans text-[13px] text-[#7a5f2c] italic line-clamp-1">{appt.message}</p>
                    )}
                  </div>
                  <p className="font-dm-sans text-[12px] text-[#b89148] shrink-0">
                    {new Date(appt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment detail modal (click a card to open) */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-[20px] w-full max-w-[480px] max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0px 12px 40px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-[28px] py-[20px] border-b border-[#f0ebe0]">
              <h2 className="font-cormorant font-bold text-[26px] text-[#3b2d17]">Appointment Details</h2>
              <button onClick={() => setSelected(null)} className="text-[#594522] hover:text-[#3b2d17]" aria-label="Close">
                <X size={22} />
              </button>
            </div>
            <div className="px-[28px] py-[24px] flex flex-col gap-[18px]">
              <div className="flex items-center justify-between">
                <StatusBadge status={selected.status} />
                <span className="font-dm-sans text-[12px] text-[#b89148]">Ref: {selected.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex flex-col gap-[14px]">
                <DetailRow icon={<Stethoscope size={16} />} label="Patient" value={selected.patient_name} />
                {selected.doctor_name && <DetailRow icon={<Stethoscope size={16} />} label="Doctor" value={selected.doctor_name} />}
                {selected.department_name && <DetailRow icon={<Building2 size={16} />} label="Department" value={selected.department_name} />}
                {selected.branch_name && <DetailRow icon={<MapPin size={16} />} label="Branch" value={selected.branch_name} />}
                {selected.preferred_date && <DetailRow icon={<CalendarDays size={16} />} label="Date" value={new Date(selected.preferred_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />}
                {selected.preferred_time && <DetailRow icon={<Clock size={16} />} label="Time" value={selected.preferred_time} />}
                {selected.patient_phone && <DetailRow icon={<Phone size={16} />} label="Phone" value={selected.patient_phone} />}
                {selected.patient_email && <DetailRow icon={<Mail size={16} />} label="Email" value={selected.patient_email} />}
              </div>
              {selected.message && (
                <div className="bg-[#fbf7ee] rounded-[12px] p-[16px]">
                  <p className="font-dm-sans text-[12px] text-[#b89148] mb-1">Message</p>
                  <p className="font-dm-sans text-[14px] text-[#594522]">{selected.message}</p>
                </div>
              )}
              <p className="font-dm-sans text-[12px] text-[#9a8a6a] text-center pt-3 border-t border-[#f0ebe0]">
                Booked on {new Date(selected.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  )
}
