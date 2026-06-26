import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

async function getPayloadAdmin(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const role = user && typeof user === 'object' && 'role' in user ? user.role : null
  if (role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return { payload }
}

export async function GET(req: NextRequest) {
  const auth = await getPayloadAdmin(req)
  if (auth instanceof NextResponse) return auth

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require('xlsx')

  const headers = [
    'Service Name (EN)',
    'Service Name (KM)',
    'Khmer Price',
    'Foreign Price',
    'Emergency Khmer Price',
    'Emergency Foreign Price',
    'Department',
  ]

  const example = [
    'Consultation ER (less than 20 min)',
    'ការពិគ្រោះ (តិចជាង ២០ នាទី)',
    15,
    15,
    15,
    15,
    'Emergency',
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, example])

  // Style header row width
  ws['!cols'] = [
    { wch: 45 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 22 }, { wch: 22 }, { wch: 20 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Price List')

  const buffer: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="price-list-template.xlsx"',
    },
  })
}
