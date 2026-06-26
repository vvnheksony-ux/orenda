import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'
import type { WebhookTarget, WebhookDocument } from '../types'
import { CONTENT_STATUS } from '../constants'
import crypto from 'crypto'

type WebhookEvent = 'published' | 'deleted'

function isWebhookTarget(value: unknown): value is WebhookTarget {
  return typeof value === 'object' && value !== null && 'url' in value && typeof (value as { url?: unknown }).url === 'string'
}

async function getWebhookTargets(payload: Payload): Promise<string[]> {
  try {
    const settings = await payload.findGlobal({
      slug: 'operationalSettings',
      depth: 0,
    })
    const targets = (settings as { webhookTargets?: unknown }).webhookTargets
    if (!Array.isArray(targets)) return []
    return targets.filter(isWebhookTarget).map((target) => target.url).filter(Boolean)
  } catch (error) {
    console.error('Failed to load webhook targets', error)
    return []
  }
}

function signBody(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex')
}

async function fireWebhooks(
  payload: Payload,
  event: WebhookEvent,
  collection: string,
  doc: WebhookDocument,
) {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) return

  const targets = await getWebhookTargets(payload)
  const envTarget = process.env.RAG2_INGEST_URL
  if (envTarget && !targets.includes(envTarget)) targets.push(envTarget)
  if (targets.length === 0) return

  const webhookPayload = {
    event,
    collection,
    docId: doc.id,
    locale: doc.locale || undefined,
    slug: doc.slug || undefined,
    timestamp: new Date().toISOString(),
  }

  const body = JSON.stringify(webhookPayload)
  const signature = signBody(body, secret)

  const results = await Promise.allSettled(
    targets.map(async (url) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payload-Signature': signature,
        },
        body,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
    }),
  )

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason)
      console.error(`Webhook failed for ${targets[index]}: ${reason}`)
    }
  })
}

export function createWebhookHooks(collectionSlug: string) {
  const onChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
    const docRecord = doc as WebhookDocument
    const prevDoc = previousDoc as WebhookDocument | undefined

    const shouldFirePublished =
      (operation === 'create' && docRecord.status === CONTENT_STATUS.PUBLISHED) ||
      (operation === 'update' && prevDoc?.status !== CONTENT_STATUS.PUBLISHED && docRecord.status === CONTENT_STATUS.PUBLISHED)

    if (shouldFirePublished) {
      void fireWebhooks(req.payload, 'published', collectionSlug, docRecord)
    }
  }

  const onDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    const docRecord = doc as WebhookDocument
    void fireWebhooks(req.payload, 'deleted', collectionSlug, docRecord)
  }

  return { onChange, onDelete }
}
