import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const locale   = (searchParams.get('locale') || 'en') as 'en' | 'km' | 'zh'
  const doctorId = searchParams.get('doctor')
  const deptId   = searchParams.get('department')

  try {
    const payload = await getPayloadClient()
    const where: any = { active: { equals: true } }
    if (doctorId) where['doctor']     = { equals: Number(doctorId) }
    if (deptId)   where['department'] = { equals: Number(deptId) }

    const { docs } = await payload.find({
      collection: 'doctor-schedules',
      overrideAccess: true,
      locale, fallbackLocale: 'en',
      depth: 1,
      sort: 'dayOfWeek',
      limit: 100,
      where,
    } as any)

    const schedules = docs.map((doc: any) => ({
      id:                         String(doc.id),
      dayOfWeek:                  doc.dayOfWeek ?? '',
      startTime:                  doc.startTime ?? '',
      endTime:                    doc.endTime ?? '',
      room:                       doc.room ?? '',
      appointmentDurationMinutes: doc.appointmentDurationMinutes ?? 30,
      doctor: typeof doc.doctor === 'object' && doc.doctor
        ? { id: String(doc.doctor.id), name: doc.doctor.name ?? '', specialty: doc.doctor.specialty ?? '', photo: doc.doctor.photo?.url ?? null }
        : null,
      department: typeof doc.department === 'object' && doc.department
        ? { id: String(doc.department.id), name: doc.department.name ?? '' }
        : null,
    }))

    return NextResponse.json({ docs: schedules })
  } catch (err: any) {
    console.error('doctor-schedules:', err.message)
    return NextResponse.json({ docs: [] })
  }
}
