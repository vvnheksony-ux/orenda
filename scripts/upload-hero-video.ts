import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

// Uploads the existing default hero video (public/videos/hero.mp4) into Payload
// Media and sets it as the Hero global's background video — so the homepage hero
// plays the admin-managed video instead of the hardcoded fallback.
async function main() {
  const payload = await getPayload({ config })

  const filePath = path.resolve('public/videos/hero.mp4')
  const buf = fs.readFileSync(filePath)
  console.log(`Uploading hero.mp4 (${(buf.length / 1048576).toFixed(1)} MB) to Payload Media...`)

  const media = await payload.create({
    collection: 'media',
    data: { alt: 'Hero background video' },
    file: { data: buf, mimetype: 'video/mp4', name: 'hero.mp4', size: buf.length },
  })
  console.log(`  → media ID ${media.id} | url: ${(media as any).url ?? '(n/a)'}`)

  await payload.updateGlobal({
    slug: 'hero',
    data: { backgroundType: 'video', backgroundVideo: media.id } as any,
  })
  console.log(`  ✓ Hero global backgroundVideo set to media ${media.id}`)

  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
