/**
 * Shared fetch helpers for Payload CMS API routes.
 * All routes use getPayloadClient() singleton + overrideAccess: true + status=published filter.
 */

const BASE = ''

async function get<T>(path: string, locale = 'en'): Promise<T | null> {
  try {
    const sep = path.includes('?') ? '&' : '?'
    const res = await fetch(`${BASE}${path}${sep}locale=${locale}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/* ── Collections ── */
export const fetchNews       = (locale = 'en', limit = 20) => get<any>(`/api/news?limit=${limit}`, locale)
export const fetchFaqs       = (locale = 'en') => get<any>('/api/faqs', locale)
export const fetchPromotions = (locale = 'en') => get<any>('/api/promotions', locale)
export const fetchDepartments= (locale = 'en', branch?: string) => get<any>(branch ? `/api/departments?branch=${branch}` : '/api/departments', locale)
export const fetchBranches   = (locale = 'en') => get<any>('/api/branches', locale)
export const fetchServices   = (locale = 'en', dept?: string) => get<any>(dept ? `/api/services?department=${dept}` : '/api/services', locale)
export const fetchDoctors    = (locale = 'en') => get<any>(`/api/doctors`, locale)
export const fetchTourScenes = (locale = 'en') => get<any>('/api/tour-scenes', locale)

/* ── Globals ── */
export const fetchSiteSettings     = (locale = 'en') => get<any>('/api/globals?type=siteSettings', locale)
export const fetchNavigation       = (locale = 'en') => get<any>('/api/globals?type=navigation', locale)
export const fetchSocialLinks      = (locale = 'en') => get<any>('/api/globals?type=socialLinks', locale)

/* ── Richtext → plain text ── */
export function lexicalToText(richtext: any): string {
  if (!richtext?.root?.children) return ''
  function extract(nodes: any[]): string {
    return nodes.flatMap(n => {
      if (n.type === 'text') return [n.text ?? '']
      if (n.children) return [extract(n.children)]
      return []
    }).join(' ').trim()
  }
  return extract(richtext.root.children)
}

/* ── Media URL helper ── */
export function mediaUrl(field: any): string | null {
  if (!field) return null
  if (typeof field === 'string') return field
  if (typeof field === 'object') return field.url ?? null
  return null
}
