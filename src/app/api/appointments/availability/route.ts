import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// A doctor's availability for a date: the booked time slots (to lock taken times)
// AND whether the doctor is full (>= 3 bookings that day → lock the whole doctor).
// Backed by the Supabase RPC `get_doctor_availability`. No patient data.
// (SQL: src/db/rpc/get_doctor_availability.sql)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const doctor = searchParams.get('doctor')
  const date = searchParams.get('date')

  if (!doctor || !date || !Number.isInteger(Number(doctor))) {
    return NextResponse.json({ booked: [], count: 0, full: false })
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
    return NextResponse.json({
      booked,
      count: row?.booked_count ?? 0,
      full: Boolean(row?.is_full),
    })
  } catch (e) {
    console.error('availability check failed:', (e as Error).message)
    // Fail open — never block the form if the check itself errors.
    return NextResponse.json({ booked: [], count: 0, full: false })
  }
}
