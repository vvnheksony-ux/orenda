import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

const ICONS: { slug: string; file: string; name: string }[] = [
  { slug: 'obstetric',   file: 'dept-obstetric.png',   name: 'Obstetric Icon'   },
  { slug: 'gynecology',  file: 'dept-gynecology.png',  name: 'Gynecology Icon'  },
  { slug: 'pediatric',   file: 'dept-pediatric.png',   name: 'Pediatric Icon'   },
  { slug: 'imaging',     file: 'dept-imaging.png',     name: 'Imaging Icon'     },
  { slug: 'orthopedics', file: 'dept-orthopedics.png', name: 'Orthopedics Icon' },
  { slug: 'neurology',   file: 'dept-neurology.png',   name: 'Neurology Icon'   },
  { slug: 'cardiology',  file: 'dept-cardiology.png',  name: 'Cardiology Icon'  },
]

async function main() {
  const payload = await getPayload({ config })

  for (const item of ICONS) {
    const imgPath = path.resolve(`public/images/${item.file}`)
    const fileBuffer = fs.readFileSync(imgPath)

    // Upload media
    console.log(`Uploading ${item.file}...`)
    const media = await payload.create({
      collection: 'media',
      data: { alt: item.name },
      file: {
        data: fileBuffer,
        mimetype: 'image/png',
        name: item.file,
        size: fileBuffer.length,
      },
    })
    console.log(`  → media ID ${media.id}`)

    // Find department by slug
    const found = await payload.find({
      collection: 'departments',
      where: { slug: { equals: item.slug } },
      limit: 1,
    } as any)

    if (!found.docs.length) { console.log(`  ⚠ dept not found: ${item.slug}`); continue }

    // Update via Payload (proper relation tracking)
    await payload.update({
      collection: 'departments',
      id: found.docs[0].id,
      data: { icon: media.id } as any,
    })
    console.log(`  ✓ ${item.slug} → icon ${media.id}`)
  }

  console.log('\nDone!')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
