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
  CALL_CLICK: 'call_click',
  INQUIRY_SUBMIT: 'inquiry_submit',
  LANGUAGE_SWITCH: 'language_switch',
  TOUR_SCENE_VIEW: 'tour_scene_view',
  DOCTOR_VIEW: 'doctor_view',
  DEPARTMENT_VIEW: 'department_view',
} as const

export type AnalyticsEventValue = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

export const ANALYTICS_EVENT_OPTIONS = [
  { label: 'Page View', value: ANALYTICS_EVENTS.PAGE_VIEW },
  { label: 'Call Click', value: ANALYTICS_EVENTS.CALL_CLICK },
  { label: 'Inquiry Submit', value: ANALYTICS_EVENTS.INQUIRY_SUBMIT },
  { label: 'Language Switch', value: ANALYTICS_EVENTS.LANGUAGE_SWITCH },
  { label: 'Tour Scene View', value: ANALYTICS_EVENTS.TOUR_SCENE_VIEW },
  { label: 'Doctor View', value: ANALYTICS_EVENTS.DOCTOR_VIEW },
  { label: 'Department View', value: ANALYTICS_EVENTS.DEPARTMENT_VIEW },
] as const

export const KPI_METRICS = {
  CALLS: 'calls',
  INQUIRIES: 'inquiries',
  TOUR_SESSIONS: 'tour_sessions',
  TOUR_SCENE_VIEWS: 'tour_scene_views',
  DOCTOR_VIEWS: 'doctor_views',
  DEPARTMENT_VIEWS: 'department_views',
  PAGE_VIEWS: 'page_views',
  LANGUAGE_SPLIT: 'language_split',
} as const

export type KpiMetricValue = (typeof KPI_METRICS)[keyof typeof KPI_METRICS]

export const KPI_METRIC_OPTIONS = [
  { label: 'Total Calls', value: KPI_METRICS.CALLS },
  { label: 'Inquiries', value: KPI_METRICS.INQUIRIES },
  { label: 'Tour Sessions', value: KPI_METRICS.TOUR_SESSIONS },
  { label: 'Tour Scene Views', value: KPI_METRICS.TOUR_SCENE_VIEWS },
  { label: 'Doctor Views', value: KPI_METRICS.DOCTOR_VIEWS },
  { label: 'Department Views', value: KPI_METRICS.DEPARTMENT_VIEWS },
  { label: 'Page Views', value: KPI_METRICS.PAGE_VIEWS },
  { label: 'Language Split', value: KPI_METRICS.LANGUAGE_SPLIT },
] as const
