import { Client } from 'pg'
const db = new Client({ connectionString: process.env.DATABASE_URL! })
await db.connect()

// Get latest version IDs per package
const { rows: latestVers } = await db.query(`
  SELECT DISTINCT ON (parent_id) id AS version_id, parent_id
  FROM payload._service_packages_v
  WHERE latest = true
  ORDER BY parent_id, id DESC
`)
console.log('Latest version IDs:', latestVers)

// For each latest version, copy rels from live table
for (const ver of latestVers) {
  const { rows: liveRels } = await db.query(
    `SELECT * FROM payload.service_packages_rels WHERE parent_id = $1`,
    [ver.parent_id]
  )
  // Delete existing version rels for this version
  await db.query(`DELETE FROM payload._service_packages_v_rels WHERE parent_id = $1`, [ver.version_id])
  // Insert from live
  for (const rel of liveRels) {
    await db.query(
      `INSERT INTO payload._service_packages_v_rels (parent_id, path, services_id, "order") VALUES ($1, 'services', $2, $3)`,
      [ver.version_id, rel.services_id, rel.order]
    )
  }
  console.log(`  ✓ version ${ver.version_id} (pkg ${ver.parent_id}): copied ${liveRels.length} service rels`)
}

// Final check
const { rows: check } = await db.query(`
  SELECT sp.id, sp.department_id, sp._status,
         COUNT(spr.id) as svc_count
  FROM payload.service_packages sp
  LEFT JOIN payload.service_packages_rels spr ON spr.parent_id = sp.id
  GROUP BY sp.id, sp.department_id, sp._status
  ORDER BY sp.id
`)
console.log('\nFinal state:', JSON.stringify(check))

await db.end(); process.exit(0)
