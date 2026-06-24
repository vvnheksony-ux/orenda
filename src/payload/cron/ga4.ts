import type { Payload } from 'payload'

export const fetchGaReports = async (payload: Payload) => {
  const propertyId = process.env.GA4_PROPERTY_ID
  const credentialsJson = process.env.GA4_SERVICE_ACCOUNT_KEY

  if (!propertyId || !credentialsJson) {
    payload.logger.warn('GA4_PROPERTY_ID or GA4_SERVICE_ACCOUNT_KEY missing. Skipping GA4 fetch.')
    return
  }

  try {
    const importModule = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<{
      BetaAnalyticsDataClient: new (options: { credentials: unknown }) => {
        runReport: (params: {
          property: string
          dateRanges: Array<{ startDate: string; endDate: string }>
          dimensions: Array<{ name: string }>
          metrics: Array<{ name: string }>
        }) => Promise<[Record<string, unknown>]>
      }
    }>
    const { BetaAnalyticsDataClient } = await importModule('@google-analytics/data')
    const credentials = JSON.parse(credentialsJson)
    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials })

    const reportTypes = ['overview', 'top_pages', 'devices', 'geo'] as const

    // Resolve the GA4 relative range ("30daysAgo".."today") to real dates for storage.
    const rangeEnd = new Date().toISOString()
    const rangeStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    for (const type of reportTypes) {
      payload.logger.info(`Fetching GA4 ${type} report...`)
      
      let dimensions: Array<{ name: string }> = []
      let metrics: Array<{ name: string }> = []

      if (type === 'overview') {
        metrics = [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'bounceRate' }, { name: 'averageSessionDuration' }]
        dimensions = [{ name: 'date' }]
      } else if (type === 'top_pages') {
        metrics = [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }]
        dimensions = [{ name: 'pagePath' }, { name: 'pageTitle' }]
      } else if (type === 'devices') {
        metrics = [{ name: 'sessions' }]
        dimensions = [{ name: 'deviceCategory' }]
      } else if (type === 'geo') {
        metrics = [{ name: 'sessions' }]
        dimensions = [{ name: 'country' }, { name: 'city' }]
      }

      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions,
        metrics,
      })

      // Store in gaReports collection
      await payload.create({
        collection: 'gaReports',
        data: {
          reportType: type,
          dateRange: { start: rangeStart, end: rangeEnd },
          data: response as Record<string, unknown>,
          fetchedAt: new Date().toISOString(),
        },
      })
    }
    
    payload.logger.info('GA4 reports successfully fetched and cached.')
  } catch (err) {
    payload.logger.error({ err }, 'Failed to fetch GA4 reports')
  }
}
