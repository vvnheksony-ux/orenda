import { MetadataRoute } from 'next'

const BASE = 'https://orienda.com'
const LOCALES = ['en', 'km', 'zh']

const STATIC_ROUTES = [
  '',
  '/about',
  '/doctors',
  '/departments',
  '/news',
  '/contact',
  '/insurance',
  '/360-tour',
  '/emergency',
  '/testimonials',
  '/login',
  '/register',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: `${BASE}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
      })
    }
  }

  return entries
}
