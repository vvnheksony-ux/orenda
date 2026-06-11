import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

async function main() {
  const payload = await getPayload({ config })

  const imgPath = path.resolve("C:/Users/USer/Downloads/6Rooms_from_branch1/6Rooms_from_branch1/King's Room/KingRoom-LivingRoom.JPG")
  const fileBuffer = fs.readFileSync(imgPath)
  const filename = 'KingRoom-LivingRoom.JPG'

  // Upload media
  const media = await payload.create({
    collection: 'media',
    data: { alt: "King's Suite Living Room" },
    file: {
      data: fileBuffer,
      mimetype: 'image/jpeg',
      name: filename,
      size: fileBuffer.length,
    },
  })
  console.log('Media created:', media.id, media.url)

  // Create tour scene 7
  const scene = await payload.create({
    collection: 'tourScenes',
    data: {
      sceneNumber: 7,
      title: "King's Suite – Living Room",
      description: "The living room of our exclusive King's Suite offers a spacious and elegantly appointed area for relaxation. Featuring premium furnishings and a warm, refined atmosphere, this space ensures absolute comfort for patients and accompanying guests throughout their stay.",
      thumbnailImage: media.id,
      _status: 'published',
    } as any,
  })
  console.log('Tour scene created:', scene.id)
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
