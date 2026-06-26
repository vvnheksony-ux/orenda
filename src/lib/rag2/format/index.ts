import { getRawPool } from '@/lib/db'
import { fetchDoctor, formatDoctor } from './format-doctor'
import { fetchDepartment, formatDepartment } from './format-department'
import { fetchBranch, formatBranch } from './format-branch'
import { fetchServicePackage, formatServicePackage } from './format-service-package'
import { fetchNews, formatNews } from './format-news'
import { fetchHealthTip, formatHealthTip } from './format-health-tip'
import { fetchCareer, formatCareer } from './format-career'
import { fetchDoctorTalk, formatDoctorTalk } from './format-doctor-talk'
import { fetchPromotion, formatPromotion } from './format-promotion'
import { fetchFaq, formatFaq } from './format-faq'

export interface CollectionConfig {
  sourceCollection: string
  fetchRow: (docId: number, locale: string) => Promise<any | null>
  formatText: (row: any) => string
}

// Keys = webhook collection name sent by Payload's createWebhookHooks()
const REGISTRY: Record<string, CollectionConfig> = {
  doctors: {
    sourceCollection: 'doctors',
    fetchRow: (id, locale) => fetchDoctor(getRawPool(), id, locale),
    formatText: formatDoctor,
  },
  departments: {
    sourceCollection: 'departments',
    fetchRow: (id, locale) => fetchDepartment(getRawPool(), id, locale),
    formatText: formatDepartment,
  },
  branches: {
    sourceCollection: 'branches',
    fetchRow: (id, locale) => fetchBranch(getRawPool(), id, locale),
    formatText: formatBranch,
  },
  servicePackages: {
    sourceCollection: 'service_packages',
    fetchRow: (id, locale) => fetchServicePackage(getRawPool(), id, locale),
    formatText: formatServicePackage,
  },
  news: {
    sourceCollection: 'news',
    fetchRow: (id, locale) => fetchNews(getRawPool(), id, locale),
    formatText: formatNews,
  },
  'health-tips': {
    sourceCollection: 'health_tips',
    fetchRow: (id, locale) => fetchHealthTip(getRawPool(), id, locale),
    formatText: formatHealthTip,
  },
  careers: {
    sourceCollection: 'careers',
    fetchRow: (id, locale) => fetchCareer(getRawPool(), id, locale),
    formatText: formatCareer,
  },
  'doctor-talks': {
    sourceCollection: 'doctor_talks',
    fetchRow: (id, locale) => fetchDoctorTalk(getRawPool(), id, locale),
    formatText: formatDoctorTalk,
  },
  promotions: {
    sourceCollection: 'promotions',
    fetchRow: (id, locale) => fetchPromotion(getRawPool(), id, locale),
    formatText: formatPromotion,
  },
  faqs: {
    sourceCollection: 'faqs',
    fetchRow: (id, locale) => fetchFaq(getRawPool(), id, locale),
    formatText: formatFaq,
  },
}

export function getCollectionConfig(webhookCollection: string): CollectionConfig | null {
  return REGISTRY[webhookCollection] ?? null
}
