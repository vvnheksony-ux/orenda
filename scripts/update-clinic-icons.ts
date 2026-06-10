import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

// Figma icons: obstetric2 (cute faces) for women/children, medical (3D) for others, spine for orthopedics
const ICON_FILES = [
  { file: 'figma-icon-obstetric2.png', name: 'icon-clinic-obstetric' },  // kids faces — obstetric/gynecology/pediatric
  { file: 'figma-icon-medical.png',    name: 'icon-clinic-medical' },    // 3D medical — neurology/imaging/cardiology
  { file: 'figma-icon-spine.png',      name: 'icon-clinic-spine' },      // spine — orthopedics
]

// Map: slug → icon file name
const SLUG_TO_ICON: Record<string, string> = {
  obstetric:   'figma-icon-obstetric2.png',
  gynecology:  'figma-icon-obstetric2.png',
  pediatric:   'figma-icon-obstetric2.png',
  neurology:   'figma-icon-medical.png',
  imaging:     'figma-icon-medical.png',
  cardiology:  'figma-icon-medical.png',
  orthopedics: 'figma-icon-spine.png',
}

async function main() {
  const payload = await getPayload({ config })
  const db = new Client({ connectionString: process.env.DATABASE_URL! })
  await db.connect()

  // Upload icons, get media IDs
  const mediaMap: Record<string, number> = {}
  for (const icon of ICON_FILES) {
    const imgPath = path.resolve(`public/images/${icon.file}`)
    const fileBuffer = fs.readFileSync(imgPath)
    console.log(`Uploading ${icon.file}...`)
    const media = await payload.create({
      collection: 'media',
      data: { alt: icon.name },
      file: { data: fileBuffer, mimetype: 'image/png', name: `${icon.name}.png`, size: fileBuffer.length },
    })
    mediaMap[icon.file] = media.id as number
    console.log(`  → media ID ${media.id}`)
  }

  // Update each clinic department with correct icon
  for (const [slug, iconFile] of Object.entries(SLUG_TO_ICON)) {
    const mediaId = mediaMap[iconFile]
    const result = await db.query(
      `UPDATE payload.departments SET icon_id = $1 WHERE slug = $2`,
      [mediaId, slug]
    ) as { rowCount?: number | null }
    const rowCount = result.rowCount ?? 0
    console.log(`${slug} → icon ${mediaId} (${rowCount} row updated)`)
  }

  await db.end()
  console.log('Done!')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
