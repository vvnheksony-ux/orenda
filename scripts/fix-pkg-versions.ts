import { Client } from 'pg'
const db = new Client({ connectionString: process.env.DATABASE_URL! })
await db.connect()

// Check which versions are latest for each package
const { rows: latest } = await db.query(`
  SELECT v.id, v.parent_id, v.latest, v.version_department_id, sp.department_id
  FROM payload._service_packages_v v
  JOIN payload.service_packages sp ON sp.id = v.parent_id
  ORDER BY v.parent_id, v.id DESC
`)
console.log('Latest versions:', JSON.stringify(latest))

// Update ALL versions for each package to have correct department_id
await db.query(`
  UPDATE payload._service_packages_v v
  SET version_department_id = sp.department_id,
      version__status = 'published',
      updated_at = NOW()
  FROM payload.service_packages sp
  WHERE v.parent_id = sp.id AND sp.id IN (1, 2, 3)
`)
console.log('Updated version department_ids')

// Check rels versions table
const { rows: relCols } = await db.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema='payload' AND table_name='_service_packages_v_rels'
  ORDER BY ordinal_position
`)
console.log('v_rels cols:', relCols.map((r:any) => r.column_name).join(', '))

// Copy rels from live table to versions
const { rows: liveRels } = await db.query('SELECT * FROM payload.service_packages_rels')
console.log('Live rels:', JSON.stringify(liveRels))

await db.end(); process.exit(0)
