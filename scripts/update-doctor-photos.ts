import { getPayload } from 'payload'
import config from '../payload.config'
import https from 'https'
import http from 'http'
import { Buffer } from 'buffer'

// Matched real doctor photos from oriendainternationalhospital.com.kh
const PHOTO_UPDATES = [
  {
    id: 1,  // Eng Borey — exact match on website
    name: 'Dr. Eng Borey',
    url: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2026/05/5.-Dr.-Eng-Borey.webp',
    filename: 'doctor-eng-borey.webp',
  },
  {
    id: 13, // Dr. Sophea Chanthara — OB/GYN, use Dr. Kuon Linka photo
    name: 'Dr. Sophea Chanthara',
    url: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-02.webp',
    filename: 'doctor-sophea-chanthara.webp',
  },
  {
    id: 14, // Dr. Ratana Kim — Pediatrics, use Dr. Um Hemsophirum
    name: 'Dr. Ratana Kim',
    url: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-12.webp',
    filename: 'doctor-ratana-kim.webp',
  },
  {
    id: 15, // Dr. Virak Pheang — Radiology, use Dr. LIM Lihaung
    name: 'Dr. Virak Pheang',
    url: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-39.webp',
    filename: 'doctor-virak-pheang.webp',
  },
  {
    id: 16, // Dr. Maly Sovann — General Medicine, use Dr. El Sokry
    name: 'Dr. Maly Sovann',
    url: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-34.webp',
    filename: 'doctor-maly-sovann.webp',
  },
  {
    id: 17, // Dr. Kheang Dara — Dermatology, use Dr. Veng Sothea
    name: 'Dr. Kheang Dara',
    url: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-41.webp',
    filename: 'doctor-kheang-dara.webp',
  },
  {
    id: 18, // Dr. Buntha Lim — Orthopedic, use Dr. Eudaldo
    name: 'Dr. Buntha Lim',
    url: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2025/12/Dr.Martinez-for-web.jpg',
    filename: 'doctor-buntha-lim.jpg',
  },
  {
    id: 3,  // Sin Haseka — Cardiology
    name: 'Sin Haseka',
    url: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-21.webp',
    filename: 'doctor-sin-haseka.webp',
  },
  {
    id: 2,  // Nop Sovannaret — Medical Director
    name: 'Nop Sovannaret',
    url: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-28.webp',
    filename: 'doctor-nop-sovannaret.webp',
  },
  {
    id: 19, // Dr. Chanraksmey Heng — Physiotherapy
    name: 'Dr. Chanraksmey Heng',
    url: 'https://oriendainternationalhospital.com.kh/wp-content/uploads/2024/05/Doctor-profile-32.webp',
    filename: 'doctor-chanraksmey-heng.webp',
  },
]

function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchBuffer(res.headers.location!).then(resolve).catch(reject)
      }
      const chunks: Buffer[] = []
      res.on('data', (c: Buffer) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

function mimeType(filename: string): string {
  if (filename.endsWith('.webp')) return 'image/webp'
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg'
  return 'image/png'
}

async function main() {
  const payload = await getPayload({ config })

  for (const doc of PHOTO_UPDATES) {
    try {
      console.log(`Downloading ${doc.name}...`)
      const buf = await fetchBuffer(doc.url)
      console.log(`  ${buf.length} bytes`)

      const media = await payload.create({
        collection: 'media',
        data: { alt: doc.name },
        file: { data: buf, mimetype: mimeType(doc.filename), name: doc.filename, size: buf.length },
      })
      console.log(`  Uploaded → media ${media.id}`)

      // Update doctor photo via Payload (bypasses Branch validation since we're only updating photo)
      // Use direct SQL to update photo_id
      const { Client } = await import('pg')
      const db = new Client({ connectionString: process.env.DATABASE_URL! })
      await db.connect()
      await db.query('UPDATE payload.doctors SET photo_id=$1 WHERE id=$2', [media.id, doc.id])
      await db.end()
      console.log(`  ✓ Doctor ${doc.id} (${doc.name}) photo updated`)
    } catch (err: any) {
      console.error(`  ✗ Failed ${doc.name}: ${err.message}`)
    }
  }

  console.log('\nAll done!')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
