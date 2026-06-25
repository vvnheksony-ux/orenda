import { NextResponse } from 'next/server'
import { getRawPool, mediaStorageUrl } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale   = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const doctorId = searchParams.get('doctor')
  const deptId   = searchParams.get('department')

  try {
    const pool = getRawPool()
    const params: any[] = [locale]
    const conditions: string[] = ['ds.active = true', "ds._status = 'published'"]

    if (doctorId) {
      params.push(Number(doctorId))
      conditions.push(`ds.doctor_id = $${params.length}`)
    }
    if (deptId) {
      params.push(Number(deptId))
      conditions.push(`ds.department_id = $${params.length}`)
    }

    const { rows } = await pool.query(`
      SELECT
        ds.id, ds.day_of_week, ds.start_time, ds.end_time,
        ds.appointment_duration_minutes, ds."order",
        COALESCE(dsl.room, en_dsl.room) AS room,
        doc.id   AS doc_id,
        COALESCE(dl.name, en_dl.name)         AS doc_name,
        COALESCE(dl.specialty, en_dl.specialty) AS doc_specialty,
        m.filename AS doc_photo_filename, m.prefix AS doc_photo_prefix,
        dept.id AS dept_id,
        COALESCE(dept_l.name, en_dept_l.name) AS dept_name
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
      WHERE ${conditions.join(' AND ')}
      ORDER BY ds.day_of_week
      LIMIT 100
    `, params)

    const schedules = rows.map((row: any) => ({
      id:                         String(row.id),
      dayOfWeek:                  row.day_of_week ?? '',
      startTime:                  row.start_time ?? '',
      endTime:                    row.end_time ?? '',
      room:                       row.room ?? '',
      appointmentDurationMinutes: row.appointment_duration_minutes ?? 30,
      doctor: row.doc_id
        ? { id: String(row.doc_id), name: row.doc_name ?? '', specialty: row.doc_specialty ?? '', photo: mediaStorageUrl(row.doc_photo_filename, row.doc_photo_prefix) }
        : null,
      department: row.dept_id
        ? { id: String(row.dept_id), name: row.dept_name ?? '' }
        : null,
    }))

    return NextResponse.json({ docs: schedules })
  } catch (err: any) {
    console.error('doctor-schedules:', err.message)
    return NextResponse.json({ docs: [] })
  }
}
