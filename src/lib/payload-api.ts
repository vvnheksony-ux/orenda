/**
 * Shared fetch helper for Payload REST API.
 * NOTE: Do NOT add where[status] filters — Payload's publishedOnly access
 * control automatically filters to published-only for unauthenticated requests.
 * Adding bracket params causes Node.js fetch to encode [] as %5B%5D which breaks Payload's parser.
 */

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function payloadFetch(path: string): Promise<any> {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Payload API ${path} returned ${res.status}`)
  return res.json()
}

/** Extract URL from a Payload media field */
export function mediaUrl(field: any): string | null {
  if (!field) return null
  if (typeof field === 'object' && field.url) return field.url
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
