import type { Payload } from 'payload'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

export const fetchGaReports = async (payload: Payload) => {
  const propertyId = process.env.GA4_PROPERTY_ID
  const credentialsJson = process.env.GA4_SERVICE_ACCOUNT_KEY

  if (!propertyId || !credentialsJson) {
    payload.logger.warn('GA4_PROPERTY_ID or GA4_SERVICE_ACCOUNT_KEY missing. Skipping GA4 fetch.')
    return
  }

  try {
    const credentials = JSON.parse(credentialsJson)
    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials })

    const reportTypes = ['overview', 'top_pages', 'devices', 'geo'] as const

    for (const type of reportTypes) {
      payload.logger.info(`Fetching GA4 ${type} report...`)
      
      let dimensions: any[] = []
      let metrics: any[] = []

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
          dateRange: { startDate: '30daysAgo', endDate: 'today' },
          data: response as any,
          fetchedAt: new Date().toISOString(),
        },
      })
    }
    
    payload.logger.info('GA4 reports successfully fetched and cached.')
  } catch (err) {
    payload.logger.error({ err }, 'Failed to fetch GA4 reports')
  }
}
