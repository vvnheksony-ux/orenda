import { getPayload } from 'payload'
import config from '../payload.config'

// Figma icons already in Payload
const ICON_POOL = [122, 113, 114, 122, 113, 114, 122, 113, 114, 122, 113, 114, 122]
type DepartmentDoc = {
  id: number | string
  name?: string | null
  slug?: string | null
  icon?: unknown
}

async function main() {
  const payload = await getPayload({ config })

  // Get all departments missing an icon
  const all = await payload.find({
    collection: 'departments',
    limit: 100,
    depth: 0,
  } as any)

  const missing = (all.docs as DepartmentDoc[]).filter((d) => !d.icon)
  console.log(`Departments without icon: ${missing.length}`)

  let iconIdx = 0
  for (const dept of missing) {
    const iconId = ICON_POOL[iconIdx % ICON_POOL.length]
    iconIdx++

    await payload.update({
      collection: 'departments',
      id: dept.id,
      data: { icon: iconId } as any,
    })
    console.log(`${dept.id} ${dept.name || dept.slug || 'Department'} -> icon ${iconId}`)
  }

  console.log('Done!')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
