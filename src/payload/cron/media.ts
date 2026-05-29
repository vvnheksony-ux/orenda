import type { Payload } from 'payload'

export const checkOrphanMedia = async (payload: Payload) => {
  payload.logger.info('Starting orphan media check...')
  
  // Get all media IDs
  const allMedia = await payload.find({
    collection: 'media',
    limit: 10000,
    depth: 0,
  })
  
  const mediaIds = new Set(allMedia.docs.map(m => m.id))
  const usedMediaIds = new Set<string | number>()

  // Collections to check for media references
  const collectionsToCheck = [
    { slug: 'doctors', fields: ['photo'] },
    { slug: 'departments', fields: ['icon'] },
    { slug: 'services', fields: ['icon'] },
    { slug: 'news', fields: ['thumbnail'] },
    { slug: 'promotions', fields: ['image'] },
    { slug: 'tourScenes', fields: ['thumbnailImage'] },
  ]

  for (const col of collectionsToCheck) {
    const docs = await payload.find({
      collection: col.slug as any,
      limit: 10000,
      depth: 0,
    })
    
    docs.docs.forEach((doc: any) => {
      col.fields.forEach(field => {
        if (doc[field]) {
          usedMediaIds.add(doc[field])
        }
      })
    })
  }

  // Also check Pages (blocks) - this is more complex, skipping for now in simple version
  
  const orphans = [...mediaIds].filter(id => !usedMediaIds.has(id))
  
  if (orphans.length > 0) {
    payload.logger.warn(`Found ${orphans.length} orphaned media files: ${orphans.join(', ')}`)
  } else {
    payload.logger.info('No orphaned media files found.')
  }
}
