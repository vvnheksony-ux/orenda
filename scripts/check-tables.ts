import { Client } from 'pg'

const db = new Client({ connectionString: process.env.DATABASE_URL! })
await db.connect()

const { rows } = await db.query(`
  SELECT table_schema, table_name
  FROM information_schema.tables
  WHERE table_schema = 'payload'
  AND (table_name LIKE '%department%' OR table_name LIKE '%doctor%' OR table_name LIKE '%faq%' OR table_name LIKE '%service%')
  ORDER BY table_name
`)
console.log(rows.map((r: any) => `${r.table_schema}.${r.table_name}`).join('\n'))

await db.end()
process.exit(0)
