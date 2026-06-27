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
    'ល.រ',
    'លេខាភាសាខ្មែរ (Khmer Name)',
    'លេខាភាសាអង់គ្លេស (English Name)',
    'ផ្នែកដាតិខ្មែរ (Khmer Price)',
    'ផ្នែកបរទេស (Foreign Price)',
    'ផ្នែកដាតិខ្មែរ សម្រាប់បន្ទាន់ (Emergency KH)',
    'ផ្នែកបរទេស សម្រាប់បន្ទាន់ (Emergency FO)',
  ]

  const examples = [
    [1, 'ការពិគ្រោះជំងឺ (< ២០ នាទី)', 'Consultation ER (less than 20 min)', 15, 15, 15, 15],
    [2, 'ការពិគ្រោះជំងឺ (> ២០ នាទី)', 'Consultation ER (more than 20 min)', 35, 35, 35, 35],
    [3, 'ការថែទាំស្បែក', 'Consultation Dermatology', 25, 25, 25, 25],
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples])
  ws['!cols'] = [
    { wch: 6 }, { wch: 38 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 28 }, { wch: 28 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Price List')

  const buffer: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="price-list-template.xlsx"',
    },
  })
}
