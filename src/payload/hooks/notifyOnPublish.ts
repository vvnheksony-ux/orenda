import type { CollectionAfterChangeHook } from 'payload'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { CONTENT_STATUS } from '../constants'

type NotifyConfig = {
  // Notification category stored on the row (e.g. 'news', 'announcement').
  category: string
  // Who receives it — defaults to all patients. The Edge Function maps
  // 'patient' to the existing profiles.user_type value.
  audience?: string
  // Optional prefix for the push title (e.g. '📰 ').
  titlePrefix?: string
  // Builds the in-site path the notification should open when clicked,
  // e.g. (doc) => `/news/${doc.slug}`. Return null for no deep link.
  buildPath?: (doc: ContentDoc) => string | null
}

type ContentDoc = {
  id: string | number
  title?: string
  excerpt?: string | null
  slug?: string | null
  status?: string
}

// notifications.source_id is a uuid, but Payload ids are integers. Derive a
// STABLE uuid (v5-style) from `${collection}:${id}` so the same content item
// always maps to the same source_id — traceable, not random. The real integer
// id is also kept in `data.doc_id` for the app to deep-link.
function sourceIdFor(collectionSlug: string, id: string | number): string {
  const bytes = crypto.createHash('sha1').update(`${collectionSlug}:${id}`).digest().subarray(0, 16)
  const b = Buffer.from(bytes)
  b[6] = (b[6] & 0x0f) | 0x50 // version 5
  b[8] = (b[8] & 0x3f) | 0x80 // RFC 4122 variant
  const h = b.toString('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

// Fires a push when a content item is PUBLISHED, by inserting a row into
// public.notifications. The DB trigger on that table then calls the
// notifications-dispatch Edge Function, which sends via OneSignal.
//
// Note: notifications.source_id is a uuid but Payload doc ids are integers,
// so we generate a uuid for source_id and keep the real reference in `data`.
export function createNotificationHook(
  collectionSlug: string,
  config: NotifyConfig,
): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, operation }) => {
    const record = doc as ContentDoc
    const prev = previousDoc as ContentDoc | undefined

    const justPublished =
      (operation === 'create' && record.status === CONTENT_STATUS.PUBLISHED) ||
      (operation === 'update' &&
        prev?.status !== CONTENT_STATUS.PUBLISHED &&
        record.status === CONTENT_STATUS.PUBLISHED)

    if (!justPublished) return

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      console.warn('notifyOnPublish: missing Supabase URL or service role key — skipping')
      return
    }

    const title = record.title?.trim() || 'Orienda Hospital'
    const body = record.excerpt?.trim() || `New ${config.category} published.`

    // Absolute URL the push opens when clicked (deep-link to the article).
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    const path = config.buildPath?.(record) ?? null
    const url = base && path ? `${base}${path}` : null

    try {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      })
      const { error } = await supabase.from('notifications').insert({
        audience: config.audience ?? 'patient',
        category: config.category,
        feature: collectionSlug,
        source_type: collectionSlug,
        source_id: sourceIdFor(collectionSlug, record.id),
        title: config.titlePrefix ? `${config.titlePrefix}${title}` : title,
        body,
        data: { collection: collectionSlug, doc_id: record.id, slug: record.slug ?? null, url },
      })
      if (error) {
        console.error(`notifyOnPublish (${collectionSlug}) insert failed:`, error.message)
      }
    } catch (err) {
      console.error(`notifyOnPublish (${collectionSlug}) error:`, err)
    }
  }
}
