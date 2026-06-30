import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'

export const runtime = 'nodejs'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
type Day = (typeof DAYS)[number]

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function parseDate(dateStr: string | null): { day: Day; time: string } {
  const now = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date()
  const day = DAYS[now.getDay()]
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  return { day, time }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale') || 'en'
  const departmentId = searchParams.get('department')
  const dateStr = searchParams.get('date')

  try {
    const { day, time } = parseDate(dateStr)

    const pool = getRawPool()
    const params: any[] = [locale, day, time, time]
    let deptFilter = ''
    if (departmentId) {
      params.push(Number(departmentId))
      deptFilter = `AND ds.department_id = $${params.length}`
    }

    const { rows } = await pool.query(
      `
      SELECT
        ds.id AS schedule_id,
        ds.start_time,
        ds.end_time,
        ds.appointment_duration_minutes,
        COALESCE(dsl.room, en_dsl.room) AS room,
        doc.id AS doc_id,
        COALESCE(dl.name, en_dl.name)              AS doc_name,
        COALESCE(dl.specialty, en_dl.specialty)    AS doc_specialty,
        m.filename AS photo_filename, m.prefix AS photo_prefix,
        dept.id AS dept_id,
        COALESCE(dept_l.name, en_dept_l.name)      AS dept_name
      FROM payload.doctor_schedules ds
      LEFT JOIN payload.doctor_schedules_locales dsl
        ON dsl._parent_id = ds.id AND dsl._locale = $1
      LEFT JOIN payload.doctor_schedules_locales en_dsl
        ON en_dsl._parent_id = ds.id AND en_dsl._locale = 'en'
      LEFT JOIN payload.doctors doc ON doc.id = ds.doctor_id
      LEFT JOIN payload.doctors_locales dl
        ON dl._parent_id = doc.id AND dl._locale = $1
      LEFT JOIN payload.doctors_locales en_dl
        ON en_dl._parent_id = doc.id AND en_dl._locale = 'en'
      LEFT JOIN payload.media m ON m.id = doc.photo_id
      LEFT JOIN payload.departments dept ON dept.id = ds.department_id
      LEFT JOIN payload.departments_locales dept_l
        ON dept_l._parent_id = dept.id AND dept_l._locale = $1
      LEFT JOIN payload.departments_locales en_dept_l
        ON en_dept_l._parent_id = dept.id AND en_dept_l._locale = 'en'
      WHERE ds.active = true
        AND ds._status = 'published'
        AND doc._status = 'published'
        AND ds.day_of_week = $2
        AND ds.start_time <= $3
        AND ds.end_time   >  $4
        ${deptFilter}
      ORDER BY dept_l.name, dl.name
      LIMIT 200
    `,
      params,
    )

    const items = rows.map((row: any) => ({
      scheduleId: String(row.schedule_id),
      startTime: row.start_time ?? '',
      endTime: row.end_time ?? '',
      appointmentDurationMinutes: row.appointment_duration_minutes ?? 30,
      room: row.room ?? '',
      doctor: {
        id: String(row.doc_id),
        name: row.doc_name ?? '',
        specialty: row.doc_specialty ?? '',
        photo: mediaStorageUrl(row.photo_filename, row.photo_prefix),
      },
      department: {
        id: String(row.dept_id),
        name: row.dept_name ?? '',
      },
    }))

    return NextResponse.json(
      {
        day,
        time,
        date: dateStr || new Date().toISOString().slice(0, 10),
        count: items.length,
        doctors: items,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } },
    )
  } catch (err: any) {
    console.error('doctors/available:', err.message)
    return NextResponse.json({ day: null, time: null, count: 0, doctors: [] }, { status: 200 })
  }
}
