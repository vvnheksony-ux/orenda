import { Client } from 'pg'
const db = new Client({ connectionString: process.env.DATABASE_URL! })
await db.connect()
for (const tbl of ['departments_locales', 'doctors_locales', 'faqs_locales', 'services_locales', 'service_packages_locales']) {
  const { rows } = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='payload' AND table_name='${tbl}' ORDER BY ordinal_position`)
  console.log(`\n${tbl}:`, rows.map((r: any) => r.column_name).join(', '))
}
await db.end(); process.exit(0)
