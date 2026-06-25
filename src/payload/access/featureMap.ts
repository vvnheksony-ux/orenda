/**
 * Maps Payload collection slugs → RBAC feature codes.
 * Used by access functions and navigation filtering.
 */
export const collectionFeatureMap: Record<string, string> = {
  users: 'users',
  media: 'media',
  pages: 'pages',
  doctors: 'doctors',
  departments: 'departments',
  branches: 'branches',
  'centers-of-excellence': 'centers-of-excellence',
  'doctor-schedules': 'doctor-schedules',
  services: 'services',
  'service-packages': 'service-packages',
  news: 'news',
  announcements: 'announcements',
  'health-tips': 'health-tips',
  careers: 'careers',
  'doctor-talks': 'doctor-talks',
  'insurance-updates': 'insurance-updates',
  'content-search-index': 'content-search-index',
  promotions: 'promotions',
  faqs: 'faqs',
  tourScenes: 'tourScenes',
  inquiries: 'inquiries',
  analyticsEvents: 'analyticsEvents',
  kpiSnapshots: 'kpiSnapshots',
  gaReports: 'gaReports',
  auditLogs: 'auditLogs',
  content: 'content',
  navigation: 'navigation',
  socialLinks: 'socialLinks',
  siteSettings: 'siteSettings',
  operationalSettings: 'operationalSettings',
}

/**
 * Maps admin panel nav item keys → RBAC feature codes.
 * Items not in this map are always visible (or super-admin gated).
 */
export const navFeatureMap: Record<string, string> = {
  appointments: 'appointments',
  'promotion-purchases': 'purchases',
  branches: 'branches',
  clinics: 'departments',
  doctors: 'doctors',
  pages: 'pages',
  promotions: 'promotions',
  news: 'news',
  announcements: 'announcements',
  'health-tips': 'health-tips',
  'doctor-talks': 'doctor-talks',
  career: 'careers',
  faqs: 'faqs',
  'room-tours': 'tourScenes',
  insurance: 'insurance-updates',
  users: 'users',
  'audit-logs': 'auditLogs',
}

/**
 * Supabase operations tables → RBAC feature codes.
 */
export const operationsTableFeatureMap: Record<string, string> = {
  appointments: 'appointments',
  purchases: 'purchases',
  inquiries: 'inquiries',
  feedback: 'feedback',
  patients: 'patients',
  profiles: 'profiles',
  testimonials: 'testimonials',
}
