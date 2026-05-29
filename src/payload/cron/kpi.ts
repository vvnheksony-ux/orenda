import type { Payload } from 'payload'
import { ANALYTICS_EVENTS, KPI_METRICS, LOCALES } from '../constants'

export const aggregateKpis = async (payload: Payload, granularity: 'day' | 'week' | 'month') => {
  const now = new Date()
  let startDate = new Date()
  let endDate = new Date()

  if (granularity === 'day') {
    // Yesterday
    startDate.setDate(now.getDate() - 1)
    startDate.setHours(0, 0, 0, 0)
    endDate.setDate(now.getDate() - 1)
    endDate.setHours(23, 59, 59, 999)
  } else if (granularity === 'week') {
    // Last week (Monday to Sunday)
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    startDate.setDate(diff - 7)
    startDate.setHours(0, 0, 0, 0)
    endDate.setDate(diff - 1)
    endDate.setHours(23, 59, 59, 999)
  } else if (granularity === 'month') {
    // Last calendar month
    startDate.setMonth(now.getMonth() - 1, 1)
    startDate.setHours(0, 0, 0, 0)
    endDate.setMonth(now.getMonth(), 0)
    endDate.setHours(23, 59, 59, 999)
  }

  const dateStr = startDate.toISOString()
  payload.logger.info(`Aggregating KPIs for ${granularity} starting ${dateStr}`)

  // Helper to fetch events
  const fetchEvents = async (event: string) => {
    const result = await payload.find({
      collection: 'analyticsEvents',
      where: {
        and: [
          { event: { equals: event } },
          { timestamp: { greater_than_equal: startDate.toISOString() } },
          { timestamp: { less_than_equal: endDate.toISOString() } },
        ],
      },
      limit: 10000,
    })
    return result.docs
  }

  // 1. Call Clicks
  const callClicks = await fetchEvents(ANALYTICS_EVENTS.CALL_CLICK)
  await createSnapshot(payload, startDate, KPI_METRICS.CALLS, callClicks.length, granularity)

  // 2. Inquiries
  const inquiries = await payload.find({
    collection: 'inquiries',
    where: {
      and: [
        { createdAt: { greater_than_equal: startDate.toISOString() } },
        { createdAt: { less_than_equal: endDate.toISOString() } },
      ],
    },
    limit: 1000,
  })
  await createSnapshot(payload, startDate, KPI_METRICS.INQUIRIES, inquiries.totalDocs, granularity)

  // 3. Tour Sessions & Views
  const tourViews = await fetchEvents(ANALYTICS_EVENTS.TOUR_SCENE_VIEW)
  const tourSessions = new Set(tourViews.map((d: any) => d.sessionId)).size
  await createSnapshot(payload, startDate, KPI_METRICS.TOUR_SESSIONS, tourSessions, granularity)
  await createSnapshot(payload, startDate, KPI_METRICS.TOUR_SCENE_VIEWS, tourViews.length, granularity)

  // 4. Page Views
  const pageViews = await fetchEvents(ANALYTICS_EVENTS.PAGE_VIEW)
  await createSnapshot(payload, startDate, KPI_METRICS.PAGE_VIEWS, pageViews.length, granularity)

  // 5. Doctor Views (Breakdown by slug)
  const doctorViews = await fetchEvents(ANALYTICS_EVENTS.DOCTOR_VIEW)
  const doctorBreakdown: Record<string, number> = {}
  doctorViews.forEach((d: any) => {
    if (d.slug) doctorBreakdown[d.slug] = (doctorBreakdown[d.slug] || 0) + 1
  })
  await createSnapshot(payload, startDate, KPI_METRICS.DOCTOR_VIEWS, doctorViews.length, granularity, undefined, doctorBreakdown)

  // 6. Department Views (Breakdown by slug)
  const deptViews = await fetchEvents(ANALYTICS_EVENTS.DEPARTMENT_VIEW)
  const deptBreakdown: Record<string, number> = {}
  deptViews.forEach((d: any) => {
    if (d.slug) deptBreakdown[d.slug] = (deptBreakdown[d.slug] || 0) + 1
  })
  await createSnapshot(payload, startDate, KPI_METRICS.DEPARTMENT_VIEWS, deptViews.length, granularity, undefined, deptBreakdown)

  // 7. Language Split
  for (const locale of Object.values(LOCALES)) {
    const localeEvents = await payload.find({
      collection: 'analyticsEvents',
      where: {
        and: [
          { locale: { equals: locale } },
          { timestamp: { greater_than_equal: startDate.toISOString() } },
          { timestamp: { less_than_equal: endDate.toISOString() } },
        ],
      },
      limit: 0,
    })
    await createSnapshot(payload, startDate, KPI_METRICS.LANGUAGE_SPLIT, localeEvents.totalDocs, granularity, locale)
  }
}

async function createSnapshot(
  payload: Payload,
  date: Date,
  metric: string,
  value: number,
  granularity: string,
  locale?: string,
  breakdown?: any
) {
  await payload.create({
    collection: 'kpiSnapshots',
    data: {
      date: date.toISOString(),
      metric,
      value,
      granularity,
      locale,
      breakdown,
    },
  })
}
