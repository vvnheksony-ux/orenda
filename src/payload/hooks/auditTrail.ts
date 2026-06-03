import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { CONTENT_STATUS } from '../constants'

export function createAuditHooks(collectionSlug: string) {
  const onChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
    try {
      const user = req.user as { id: string; email: string; role?: string } | null
      if (!user) return // Don't log if no user (e.g. initial seeding or automated scripts)

      let action: 'created' | 'updated' | 'published' | 'archived' = operation === 'create' ? 'created' : 'updated'
      
      const docRecord = doc as Record<string, unknown>
      const prevDoc = previousDoc as Record<string, unknown> | undefined

      if (operation === 'update' && prevDoc) {
        if (prevDoc.status !== CONTENT_STATUS.PUBLISHED && docRecord.status === CONTENT_STATUS.PUBLISHED) {
          action = 'published'
        } else if (prevDoc.status !== CONTENT_STATUS.ARCHIVED && docRecord.status === CONTENT_STATUS.ARCHIVED) {
          action = 'archived'
        }
      }

      const documentTitle = (docRecord.title || docRecord.name || docRecord.question || docRecord.email || docRecord.id) as string

      await req.payload.create({
        collection: 'auditLogs',
        data: {
          action,
          collectionSlug,
          documentId: String(docRecord.id),
          documentTitle: String(documentTitle),
          userId: user.id,
          userName: user.email,
          userRole: (user.role as string) || undefined,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (err) {
      req.payload.logger.error({ err }, `Failed to create audit log for ${collectionSlug}`)
    }
  }

  const onDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    try {
      const user = req.user as { id: string; email: string; role?: string } | null
      if (!user) return

      const docRecord = doc as Record<string, unknown>
      const documentTitle = (docRecord.title || docRecord.name || docRecord.question || docRecord.email || docRecord.id) as string

      await req.payload.create({
        collection: 'auditLogs',
        data: {
          action: 'deleted',
          collectionSlug,
          documentId: String(docRecord.id),
          documentTitle: String(documentTitle),
          userId: user.id,
          userName: user.email,
          userRole: (user.role as string) || undefined,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (err) {
      req.payload.logger.error({ err }, `Failed to create delete audit log for ${collectionSlug}`)
    }
  }

  return { onChange, onDelete }
}
