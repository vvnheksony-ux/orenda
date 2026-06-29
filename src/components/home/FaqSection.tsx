import { headers } from 'next/headers'
import FaqAccordion from './FaqAccordion'

type FaqItem = { q: string; a: string }

// Fetch FAQs on the server so the section renders with data already in place
// (no client-side "empty then pop-in" waterfall). Cached for 5 min via the
// raw-pool /api/faqs route (the working DB path).
async function getFaqs(locale: string): Promise<FaqItem[]> {
  try {
    const h = await headers()
    const proto = h.get('x-forwarded-proto') ?? 'https'
    const host = h.get('x-forwarded-host') ?? h.get('host')
    const base = host
      ? `${proto}://${host}`
      : process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const res = await fetch(`${base}/api/faqs?locale=${locale}&limit=5`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data.slice(0, 5).map((d: any) => ({ q: d.question, a: d.answer })) : []
  } catch {
    return []
  }
}

export default async function FaqSection({ locale }: { locale: string }) {
  const items = await getFaqs(locale)
  return <FaqAccordion items={items} />
}
