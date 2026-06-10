import { getPayload } from 'payload'
import config from '../payload.config'

// media IDs we already uploaded
const SLUG_TO_MEDIA: Record<string, number> = {
  obstetric:   112,
  gynecology:  112,
  pediatric:   112,
  neurology:   113,
  imaging:     113,
  cardiology:  113,
  orthopedics: 114,
}

async function main() {
  const payload = await getPayload({ config })

  for (const [slug, mediaId] of Object.entries(SLUG_TO_MEDIA)) {
    const found = await payload.find({
      collection: 'departments',
      where: { slug: { equals: slug } },
      limit: 1,
    } as any)

    if (!found.docs.length) { console.log(`Not found: ${slug}`); continue }
    const id = found.docs[0].id

    await payload.update({
      collection: 'departments',
      id,
      data: { icon: mediaId } as any,
    })
    console.log(`Updated ${slug} (id=${id}) → icon ${mediaId}`)
  }

  console.log('Done!')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
