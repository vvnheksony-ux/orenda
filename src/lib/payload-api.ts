/**
 * Shared fetch helper for Payload REST API.
 * NOTE: Do NOT add where[status] filters — Payload's publishedOnly access
 * control automatically filters to published-only for unauthenticated requests.
 * Adding bracket params causes Node.js fetch to encode [] as %5B%5D which breaks Payload's parser.
 */

const BASE = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export async function payloadFetch(path: string): Promise<any> {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Payload API ${path} returned ${res.status}`)
  return res.json()
}

const SUPABASE_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const STORAGE_BUCKET = 'orienda-media'

/** Extract URL from a Payload media field — resolves to direct Supabase Storage URL */
export function mediaUrl(field: any): string | null {
  if (!field) return null
  if (typeof field === 'object') {
    if (field.filename) {
      const prefix = field.prefix ? `${field.prefix}/` : ''
      return `${SUPABASE_BASE}/storage/v1/object/public/${STORAGE_BUCKET}/${prefix}${field.filename}`
    }
    if (field.url) return field.url
  }
  return null
}

/** Extract plain text from Payload Lexical richtext */
export function lexicalToText(rt: any): string {
  if (!rt?.root?.children) return ''
  function walk(nodes: any[]): string {
    return nodes.flatMap(n => {
      if (n.type === 'text') return [n.text ?? '']
      if (n.children) return [walk(n.children)]
      return []
    }).join(' ').replace(/\s+/g, ' ').trim()
  }
  return walk(rt.root.children)
}
