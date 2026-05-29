import type { PayloadRequest, Where } from 'payload'
import {
  ANALYTICS_EVENTS,
  KPI_METRICS,
  LOCALES,
  type AnalyticsEventValue,
  type KpiMetricValue,
  type LocaleCode,
} from '../constants'
import type { AnalyticsEventBody, InquiryFormBody } from '../types'

export class RequestValidationError extends Error {
  status = 400

  constructor(message: string) {
    super(message)
    this.name = 'RequestValidationError'
  }
}

type ParsedKpiQuery = {
  from?: string
  to?: string
  metric?: KpiMetricValue
}

type ParsedKpiExportQuery = ParsedKpiQuery & {
  metrics?: KpiMetricValue[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown, label: string, required = true): string | undefined {
  if (value === undefined || value === null) {
    if (required) throw new RequestValidationError(`${label} is required`)
    return undefined
  }
  if (typeof value !== 'string') {
    throw new RequestValidationError(`${label} must be a string`)
  }
  const trimmed = value.trim()
  if (!trimmed) {
    if (required) throw new RequestValidationError(`${label} is required`)
    return undefined
  }
  return trimmed
}

function readOptionalString(value: unknown, label: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') {
    throw new RequestValidationError(`${label} must be a string`)
  }
  const trimmed = value.trim()
  return trimmed || undefined
}

function readEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
): T {
  const text = readString(value, label)
  if (!text || !allowed.includes(text as T)) {
    throw new RequestValidationError(`${label} must be one of: ${allowed.join(', ')}`)
  }
  return text as T
}

function readLocale(value: unknown): LocaleCode {
  return readEnumValue(value, Object.values(LOCALES), 'locale')
}

function readAnalyticsEvent(value: unknown): AnalyticsEventValue {
  return readEnumValue(value, Object.values(ANALYTICS_EVENTS), 'event')
}

function parseDateParam(value: unknown, label: string): string | undefined {
  const text = readOptionalString(value, label)
  if (!text) return undefined
  const timestamp = Date.parse(text)
  if (Number.isNaN(timestamp)) {
    throw new RequestValidationError(`${label} must be a valid date`)
  }
  return new Date(timestamp).toISOString()
}

function parseMetricList(value: unknown): KpiMetricValue[] | undefined {
  const text = readOptionalString(value, 'metrics')
  if (!text) return undefined
  const metrics = text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (metrics.length === 0) {
    throw new RequestValidationError('metrics must not be empty')
  }
  const allowed = Object.values(KPI_METRICS)
  for (const metric of metrics) {
    if (!allowed.includes(metric as KpiMetricValue)) {
      throw new RequestValidationError(`metrics must be one of: ${allowed.join(', ')}`)
    }
  }
  return [...new Set(metrics)] as KpiMetricValue[]
}

export async function readJsonBody(req: PayloadRequest): Promise<unknown> {
  const request = req as unknown as Request
  if (typeof request.json !== 'function') return {}
  return request.json()
}

export function parseInquiryFormBody(body: unknown): InquiryFormBody {
  if (!isRecord(body)) {
    throw new RequestValidationError('Invalid request body')
  }

  return {
    name: readString(body.name, 'name')!,
    phone: readOptionalString(body.phone, 'phone'),
    email: readString(body.email, 'email')!,
    message: readString(body.message, 'message')!,
  }
}

export function parseAnalyticsEventBody(body: unknown): AnalyticsEventBody {
  if (!isRecord(body)) {
    throw new RequestValidationError('Invalid request body')
  }

  const scene = body.scene
  if (scene !== undefined && scene !== null && (typeof scene !== 'number' || !Number.isInteger(scene) || scene < 1 || scene > 15)) {
    throw new RequestValidationError('scene must be an integer between 1 and 15')
  }

  return {
    event: readAnalyticsEvent(body.event),
    locale: readLocale(body.locale),
    slug: readOptionalString(body.slug, 'slug'),
    scene: scene as number | undefined,
    sessionId: readOptionalString(body.sessionId, 'sessionId'),
    ipHash: readOptionalString(body.ipHash, 'ipHash'),
    referrer: readOptionalString(body.referrer, 'referrer'),
    userAgent: readOptionalString(body.userAgent, 'userAgent'),
  }
}

export function parseKpiQuery(searchParams: URLSearchParams): ParsedKpiQuery {
  const from = parseDateParam(searchParams.get('from'), 'from')
  const to = parseDateParam(searchParams.get('to'), 'to')
  if (from && to && Date.parse(from) > Date.parse(to)) {
    throw new RequestValidationError('from must be before to')
  }

  const metric = readOptionalString(searchParams.get('metric'), 'metric')
  if (metric) {
    const allowed = Object.values(KPI_METRICS)
    if (!allowed.includes(metric as KpiMetricValue)) {
      throw new RequestValidationError(`metric must be one of: ${allowed.join(', ')}`)
    }
  }

  return { from, to, metric: metric as KpiMetricValue | undefined }
}

export function parseKpiExportQuery(searchParams: URLSearchParams): ParsedKpiExportQuery {
  const base = parseKpiQuery(searchParams)
  const metrics = parseMetricList(searchParams.get('metrics'))
  return { ...base, metrics }
}

export function buildKpiWhere(query: ParsedKpiQuery | ParsedKpiExportQuery): Where {
  const where: Record<string, unknown> = {}
  const dateWhere: Record<string, string> = {}

  if (query.from) dateWhere.greater_than_equal = query.from
  if (query.to) dateWhere.less_than_equal = query.to
  if (Object.keys(dateWhere).length > 0) {
    where.date = dateWhere
  }

  if ('metric' in query && query.metric) {
    where.metric = { equals: query.metric }
  }

  if ('metrics' in query && query.metrics?.length) {
    where.metric = { in: query.metrics }
  }

  return where as Where
}

export function serializeKpiCsv(docs: Array<Record<string, unknown>>): string {
  const escapeCell = (value: unknown): string => {
    const text = value === undefined || value === null ? '' : String(value)
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  const header = ['date', 'metric', 'value', 'locale', 'granularity'].join(',')
  const rows = docs.map((doc) =>
    [doc.date, doc.metric, doc.value, doc.locale, doc.granularity].map(escapeCell).join(',')
  )

  return [header, ...rows].join('\n')
}
