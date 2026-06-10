import { getPayloadClient } from '../src/lib/payload'

const PROMOTIONS: { id: string; title: string }[] = [
  { id: '1', title: '手术套餐优惠25%' },
  { id: '2', title: '免费眼部检查' },
  { id: '3', title: '牙齿清洁套餐' },
  { id: '4', title: '产妇护理套餐' },
  { id: '5', title: '全面健康检查' },
]

const PACKAGES: { id: string; title: string }[] = [
  { id: '1', title: '女性健康套餐' },
  { id: '2', title: '心脏健康筛查' },
  { id: '3', title: '年度健康检查' },
]

async function main() {
  const payload = await getPayloadClient()

  console.log('Seeding ZH translations for promotions...')
  for (const p of PROMOTIONS) {
    await (payload.update as any)({
      collection: 'promotions',
      id: p.id,
      locale: 'zh',
      data: { title: p.title },
    })
    console.log(`  ✓ promo ${p.id}: ${p.title}`)
  }

  console.log('Seeding ZH translations for service-packages...')
  for (const p of PACKAGES) {
    await (payload.update as any)({
      collection: 'service-packages',
      id: p.id,
      locale: 'zh',
      data: { title: p.title },
    })
    console.log(`  ✓ package ${p.id}: ${p.title}`)
  }

  console.log('Done.')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
