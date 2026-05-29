export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export type ContentStatus = (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS]

export const CONTENT_STATUS_OPTIONS = [
  { label: 'Draft', value: CONTENT_STATUS.DRAFT },
  { label: 'Published', value: CONTENT_STATUS.PUBLISHED },
  { label: 'Archived', value: CONTENT_STATUS.ARCHIVED },
] as const

export const LOCALES = {
  EN: 'en',
  KM: 'km',
  ZH: 'zh',
} as const

export type LocaleCode = (typeof LOCALES)[keyof typeof LOCALES]

export const LOCALE_OPTIONS = [
  { label: 'English', value: LOCALES.EN },
  { label: 'Khmer', value: LOCALES.KM },
  { label: 'Chinese', value: LOCALES.ZH },
] as const

export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  TOUR_VIEW: 'tour_view',
  DOCTOR_CLICK: 'doctor_click',
  INQUIRY_SUBMIT: 'inquiry_submit',
  CALL_CLICK: 'call_click',
  MAP_INTERACTION: 'map_interaction',
} as const

export type AnalyticsEventValue = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

export const ANALYTICS_EVENT_OPTIONS = [
  { label: 'Page View', value: ANALYTICS_EVENTS.PAGE_VIEW },
  { label: 'Tour View', value: ANALYTICS_EVENTS.TOUR_VIEW },
  { label: 'Doctor Click', value: ANALYTICS_EVENTS.DOCTOR_CLICK },
  { label: 'Inquiry Submit', value: ANALYTICS_EVENTS.INQUIRY_SUBMIT },
  { label: 'Call Click', value: ANALYTICS_EVENTS.CALL_CLICK },
  { label: 'Map Interaction', value: ANALYTICS_EVENTS.MAP_INTERACTION },
] as const

export const KPI_METRICS = {
  CALLS: 'calls',
  INQUIRIES: 'inquiries',
  TOUR_VIEWS: 'tour_views',
  DOCTOR_CLICKS: 'doctor_clicks',
  MAP_INTERACTIONS: 'map_interactions',
} as const

export type KpiMetricValue = (typeof KPI_METRICS)[keyof typeof KPI_METRICS]

export const KPI_METRIC_OPTIONS = [
  { label: 'Total Calls', value: KPI_METRICS.CALLS },
  { label: 'Inquiries', value: KPI_METRICS.INQUIRIES },
  { label: 'Tour Views', value: KPI_METRICS.TOUR_VIEWS },
  { label: 'Doctor Clicks', value: KPI_METRICS.DOCTOR_CLICKS },
  { label: 'Map Interactions', value: KPI_METRICS.MAP_INTERACTIONS },
] as const
