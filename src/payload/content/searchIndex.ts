import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  Field,
  Payload,
  Where,
} from 'payload'
import type { LocaleCode } from '../constants'

type RichTextNode = {
  children?: RichTextNode[]
  text?: string
  [key: string]: unknown
}

type SearchableDoc = {
  id: number | string
  title?: string | null
  slug?: string | null
  excerpt?: string | null
  body?: { root?: RichTextNode } | null
  thumbnail?: number | { id?: number | string } | null
  status?: string | null
  publishedAt?: string | null
  [key: string]: unknown
}

export const CONTENT_SEARCH_INDEX_SLUG = 'content-search-index'

export type SearchContentType =
  | 'announcement'
  | 'health-tip'
  | 'career'
  | 'doctor-talk'
  | 'insurance-update'

export type SearchCollectionSlug =
  | 'announcements'
  | 'health-tips'
  | 'careers'
  | 'doctor-talks'
  | 'insurance-updates'

type SearchIndexConfig = {
  collectionSlug: SearchCollectionSlug
  contentType: SearchContentType
  canonicalBasePath: string
  getMetadata?: (doc: SearchableDoc) => Record<string, unknown>
}

type SearchIndexRow = {
  sourceCollection: SearchCollectionSlug
  sourceId: string
  contentType: SearchContentType
  locale: LocaleCode
  title: string
  slug: string
  canonicalPath: string
  excerpt: string | null | undefined
  bodyText: string
  thumbnail: number | null | undefined
  status: string | null | undefined
  publishedAt: string | null | undefined
  metadata: Record<string, unknown>
}

function flattenRichText(node: RichTextNode | undefined): string {
  if (!node) return ''

  const parts: string[] = []

  if (typeof node.text === 'string' && node.text.trim()) {
    parts.push(node.text.trim())
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const text = flattenRichText(child)
      if (text) parts.push(text)
    }
  }

  return parts.join(' ').trim()
}

function normalizeMediaId(value: SearchableDoc['thumbnail']): number | null | undefined {
  if (typeof value === 'number' || value === null || value === undefined) {
    return value
  }

  if (typeof value === 'object' && value !== null && typeof value.id === 'number') {
    return value.id
  }

  return undefined
}

async function deleteExistingIndexRows(payload: Payload, collectionSlug: string, sourceId: string) {
  const existing = await payload.find({
    collection: CONTENT_SEARCH_INDEX_SLUG,
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { sourceCollection: { equals: collectionSlug } },
        { sourceId: { equals: sourceId } },
      ],
    } as Where,
  })

  await Promise.all(
    existing.docs.map((row) =>
      payload.delete({
        collection: CONTENT_SEARCH_INDEX_SLUG,
        id: row.id,
        overrideAccess: true,
      })
    )
  )
}

async function buildIndexRows(payload: Payload, config: SearchIndexConfig, docId: string): Promise<SearchIndexRow[]> {
  const locales = typeof payload.config.localization === 'object'
    ? payload.config.localization.locales
    : []

  const localizedDocs = await Promise.all(
    locales.map(async (localeConfig) => {
      const locale = (typeof localeConfig === 'string' ? localeConfig : localeConfig.code) as LocaleCode
      const localizedDoc = (await payload.findByID({
        collection: config.collectionSlug,
        id: docId,
        depth: 0,
        draft: true,
        locale,
        overrideAccess: true,
      })) as unknown as SearchableDoc

      return { locale, localizedDoc }
    })
  )

  return localizedDocs.flatMap(({ locale, localizedDoc }) => {
    if (!localizedDoc.slug || !localizedDoc.title) {
      return []
    }

    return [{
      sourceCollection: config.collectionSlug,
      sourceId: String(localizedDoc.id),
      contentType: config.contentType,
      locale,
      title: localizedDoc.title,
      slug: localizedDoc.slug,
      canonicalPath: `${config.canonicalBasePath}/${localizedDoc.slug}`,
      excerpt: localizedDoc.excerpt,
      bodyText: flattenRichText(localizedDoc.body?.root),
      thumbnail: normalizeMediaId(localizedDoc.thumbnail),
      status: localizedDoc.status,
      publishedAt: localizedDoc.publishedAt,
      metadata: config.getMetadata?.(localizedDoc) ?? {},
    }]
  })
}

async function syncIndexRows(payload: Payload, config: SearchIndexConfig, docId: string) {
  const rows = await buildIndexRows(payload, config, docId)

  await deleteExistingIndexRows(payload, config.collectionSlug, docId)

  await Promise.all(
    rows.map((row) => payload.create({
      collection: CONTENT_SEARCH_INDEX_SLUG,
      overrideAccess: true,
      data: row,
    }))
  )
}

export function createSearchIndexHooks(config: SearchIndexConfig): {
  onChange: CollectionAfterChangeHook
  onDelete: CollectionAfterDeleteHook
} {
  const onChange: CollectionAfterChangeHook = async ({ doc, req }) => {
    await syncIndexRows(req.payload, config, String(doc.id))
  }

  const onDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    await deleteExistingIndexRows(req.payload, config.collectionSlug, String(doc.id))
  }

  return { onChange, onDelete }
}

export function baseContentFields(): Field[] {
  return [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'author',
      type: 'text',
    },
  ]
}
