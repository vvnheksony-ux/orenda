'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, Clock, Building2 } from 'lucide-react'
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
  department_id?: string
  message?: string
  source?: string
  created_at: string
}

function StatusBadge({ date }: { date?: string }) {
  if (!date) return <span className="px-3 py-1 rounded-full bg-[#f0ebe0] text-[#594522] text-[12px] font-dm-sans">Pending</span>
  const d = new Date(date)
  const now = new Date()
  const upcoming = d >= now
  return (
    <span className={`px-3 py-1 rounded-full text-[12px] font-dm-sans ${upcoming ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#f0ebe0] text-[#594522]'}`}>
      {upcoming ? 'Upcoming' : 'Completed'}
    </span>
  )
}

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => setAppointments(d.docs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading])

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
                  className="bg-white rounded-[16px] p-[24px] sm:p-[32px] flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]"
                  style={{ boxShadow: '0px 4px 16px rgba(184,145,72,0.10)' }}
                >
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex items-center gap-[12px] flex-wrap">
                      <p className="font-cormorant font-bold text-[22px] text-[#3b2d17]">{appt.patient_name}</p>
                      <StatusBadge date={appt.preferred_date} />
                    </div>
                    <div className="flex flex-wrap gap-[16px]">
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
                      {appt.department_id && (
                        <div className="flex items-center gap-[6px] text-[#594522]">
                          <Building2 size={15} />
                          <span className="font-dm-sans text-[14px]">{appt.department_id}</span>
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
    </SiteLayout>
  )
}
