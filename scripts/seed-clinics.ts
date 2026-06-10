import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'
import pkg from 'pg'
const { Client } = pkg

const CLINICS = [
  { name: 'Obstetric',   slug: 'obstetric',   file: 'specialty-obstetric.png',  order: 1, mediaId: 105 }, // already uploaded
  { name: 'Gynecology',  slug: 'gynecology',  file: 'specialty-gynecology.png', order: 2, mediaId: 0  },
  { name: 'Pediatric',   slug: 'pediatric',   file: 'specialty-pediatric.png',  order: 3, mediaId: 0  },
  { name: 'Neurology',   slug: 'neurology',   file: 'specialty-neuro.png',       order: 4, mediaId: 0  },
  { name: 'Imaging',     slug: 'imaging',     file: 'specialty-imaging.png',     order: 5, mediaId: 0  },
  { name: 'Orthopedics', slug: 'orthopedics', file: 'specialty-neuro-2.png',     order: 6, mediaId: 0  },
  { name: 'Cardiology',  slug: 'cardiology',  file: 'specialty-neuro.png',       order: 7, mediaId: 0  },
]

const BRANCH_ID = 3 // Chamkarmon branch

async function main() {
  const payload = await getPayload({ config })
  const db = new Client({ connectionString: process.env.DATABASE_URL! })
  await db.connect()

  // Upload missing icons
  for (const clinic of CLINICS) {
    if (clinic.mediaId > 0) { console.log(`Skip upload ${clinic.name} (media ${clinic.mediaId})`); continue }
    const imgPath = path.resolve(`public/images/${clinic.file}`)
    const fileBuffer = fs.readFileSync(imgPath)
    console.log(`Uploading ${clinic.file}...`)
    const media = await payload.create({
      collection: 'media',
      data: { alt: `${clinic.name} icon` },
      file: { data: fileBuffer, mimetype: 'image/png', name: `icon-${clinic.slug}.png`, size: fileBuffer.length },
    })
    clinic.mediaId = media.id as number
    console.log(`  → media ID ${clinic.mediaId}`)
  }

  // Upsert departments via SQL (bypass Branch required validation)
  for (const clinic of CLINICS) {
    // Check if slug already exists
    const { rows } = await db.query(
      `SELECT id FROM payload.departments WHERE slug = $1 LIMIT 1`,
      [clinic.slug]
    )

    if (rows.length > 0) {
      // Update icon + order
      await db.query(
        `UPDATE payload.departments SET icon_id=$1, "order"=$2, status='published', _status='published', published_at=NOW() WHERE id=$3`,
        [clinic.mediaId, clinic.order, rows[0].id]
      )
      // Update locale name
      await db.query(
        `UPDATE payload.departments_locales SET name=$1 WHERE _parent_id=$2 AND _locale='en'`,
        [clinic.name, rows[0].id]
      )
      console.log(`Updated: ${clinic.name} (id=${rows[0].id})`)
    } else {
      // Insert department
      const ins = await db.query(
        `INSERT INTO payload.departments (slug, icon_id, status, _status, published_at, branch_id, "order", updated_at, created_at)
         VALUES ($1,$2,'published','published',NOW(),$3,$4,NOW(),NOW()) RETURNING id`,
        [clinic.slug, clinic.mediaId, BRANCH_ID, clinic.order]
      )
      const deptId = ins.rows[0].id
      // Insert locale
      await db.query(
        `INSERT INTO payload.departments_locales (name, _locale, _parent_id) VALUES ($1,'en',$2)`,
        [clinic.name, deptId]
      )
      console.log(`Created: ${clinic.name} (id=${deptId})`)
    }
  }

  await db.end()
  console.log('Done!')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
