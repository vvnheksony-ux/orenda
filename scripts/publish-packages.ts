import { Client } from 'pg'
const db = new Client({ connectionString: process.env.DATABASE_URL! })
await db.connect()

// Check versions table structure
const { rows: vcols } = await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema='payload' AND table_name='_service_packages_v' ORDER BY ordinal_position")
console.log('VERSION COLS:', vcols.map((r:any) => r.column_name).join(', '))

const { rows: vrows } = await db.query('SELECT id, version_department_id, version__status FROM payload._service_packages_v ORDER BY id')
console.log('VERSIONS:', JSON.stringify(vrows))

// Publish the main records
await db.query("UPDATE payload.service_packages SET _status='published', updated_at=NOW() WHERE id IN (1,2,3)")
console.log('Published service_packages _status')

await db.end(); process.exit(0)
