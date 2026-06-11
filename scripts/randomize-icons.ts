import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

async function main() {
  const payload = await getPayload({ config })

  // Upload the main 3D fetus icon (imgImage122 from clinic section)
  const obsFile = path.resolve('public/images/figma-icon-obstetric.png')
  const obsBuffer = fs.readFileSync(obsFile)
  console.log('Uploading 3D fetus icon...')
  const obs3d = await payload.create({
    collection: 'media',
    data: { alt: 'Clinic icon 3D obstetric' },
    file: { data: obsBuffer, mimetype: 'image/png', name: 'clinic-icon-3d-obstetric.png', size: obsBuffer.length },
  })
  console.log('→ media', obs3d.id)

  // 3 icons to rotate across 7 departments:
  // obs3d.id  = 3D fetus (imgImage122)
  // 113       = 3D medical device (imgImage126)
  // 114       = spine illustration
  const ICON_POOL = [obs3d.id, 113, obs3d.id, 113, obs3d.id, 114, 113] as number[]

  const SLUGS = ['obstetric','gynecology','pediatric','neurology','imaging','orthopedics','cardiology']

  for (let i = 0; i < SLUGS.length; i++) {
    const slug = SLUGS[i]
    const iconId = ICON_POOL[i]

    const found = await payload.find({
      collection: 'departments',
      where: { slug: { equals: slug } },
      limit: 1,
    } as any)

    if (!found.docs.length) { console.log(`not found: ${slug}`); continue }

    await payload.update({
      collection: 'departments',
      id: found.docs[0].id,
      data: { icon: iconId } as any,
    })
    console.log(`${slug} → icon ${iconId}`)
  }

  console.log('Done!')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
