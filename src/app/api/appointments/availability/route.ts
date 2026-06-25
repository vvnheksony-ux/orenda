import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// Max confirmed appointments per doctor per day. When reached, the doctor is
// "full" and every slot is locked. Enforced here in JS off the RPC's count, so
// no DB change is needed (the RPC's own is_full stays false).
const DAILY_LIMIT = 3

// Canonical bookable periods — MIRRORS TIME_PERIODS in BookAppointmentModal.tsx
// and the period table in get_doctor_availability.sql. Keep all three in sync.
// `time` is the value stored as appointments.preferred_time; start/end are the
// 24h window ("slot start / slot end").
const PERIODS = [
  { id: 'early-morning',  time: '07:00 AM', start: '07:00', end: '09:00' },
  { id: 'morning',        time: '09:00 AM', start: '09:00', end: '11:00' },
  { id: 'late-morning',   time: '11:00 AM', start: '11:00', end: '13:00' },
  { id: 'afternoon',      time: '01:00 PM', start: '13:00', end: '15:00' },
  { id: 'late-afternoon', time: '03:00 PM', start: '15:00', end: '17:00' },
  { id: 'evening',        time: '05:00 PM', start: '17:00', end: '20:00' },
] as const

type Slot = {
  id: string
  time: string
  start: string
  end: string
  available: boolean
  reason: 'booked' | 'full' | null
}

// Decide availability per slot. Priority: full (whole doctor) → booked. The
// "past time" rule is intentionally left to the client, which knows "now".
function buildSlots(booked: string[], full: boolean): Slot[] {
  return PERIODS.map((p) => {
    const isBooked = booked.includes(p.time)
    return {
      id: p.id,
      time: p.time,
      start: p.start,
      end: p.end,
      available: !full && !isBooked,
      reason: full ? 'full' : isBooked ? 'booked' : null,
    }
  })
}

// A doctor's availability for a date: every bookable slot with start/end and an
// `available` boolean (plus a reason). Backed by the Supabase RPC
// `get_doctor_availability`, which returns the booked periods + confirmed count
// from APPROVED appointments only. No patient data.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const doctor = searchParams.get('doctor')
  const date = searchParams.get('date')

  if (!doctor || !date || !Number.isInteger(Number(doctor))) {
    return NextResponse.json({ slots: buildSlots([], false), booked: [], count: 0, full: false })
  }

  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase.rpc('get_doctor_availability', {
      p_doctor: Number(doctor),
      p_date: date,
    })
    if (error) throw error
    const row = Array.isArray(data) ? data[0] : data
    const booked = Array.isArray(row?.booked) ? row.booked.filter(Boolean) : []
    const count = row?.booked_count ?? 0
    const full = count >= DAILY_LIMIT
    // `booked` and `full` are kept for backward compatibility alongside `slots`.
    return NextResponse.json({ slots: buildSlots(booked, full), booked, count, full })
  } catch (e) {
    console.error('availability check failed:', (e as Error).message)
    // Fail open — never block the form if the check itself errors.
    return NextResponse.json({ slots: buildSlots([], false), booked: [], count: 0, full: false })
  }
}
