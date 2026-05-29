import type { Payload } from 'payload'
import { Cron } from 'croner'
import { aggregateKpis } from './kpi'
import { cleanupData } from './retention'
import { fetchGaReports } from './ga4'
import { checkOrphanMedia } from './media'
import { sendWeeklyReport } from './emails'

export const initCronJobs = (payload: Payload) => {
  payload.logger.info('Initializing cron jobs...')

  // Daily KPI aggregation at 02:00
  new Cron('0 2 * * *', async () => {
    payload.logger.info('Running daily KPI aggregation...')
    try {
      await aggregateKpis(payload, 'day')
      payload.logger.info('Daily KPI aggregation completed successfully')
    } catch (err) {
      payload.logger.error({ err }, 'Daily KPI aggregation failed')
    }
  })

  // Weekly KPI rollup at 03:00 on Mondays
  new Cron('0 3 * * 1', async () => {
    payload.logger.info('Running weekly KPI aggregation...')
    try {
      await aggregateKpis(payload, 'week')
      payload.logger.info('Weekly KPI aggregation completed successfully')
    } catch (err) {
      payload.logger.error({ err }, 'Weekly KPI aggregation failed')
    }
  })

  // Weekly email report at 08:00 on Mondays
  new Cron('0 8 * * 1', async () => {
    payload.logger.info('Running weekly email report...')
    try {
      await sendWeeklyReport(payload)
      payload.logger.info('Weekly email report sent successfully')
    } catch (err) {
      payload.logger.error({ err }, 'Weekly email report failed')
    }
  })

  // Monthly KPI rollup at 04:00 on 1st of month
  new Cron('0 4 1 * *', async () => {
    payload.logger.info('Running monthly KPI aggregation...')
    try {
      await aggregateKpis(payload, 'month')
      payload.logger.info('Monthly KPI aggregation completed successfully')
    } catch (err) {
      payload.logger.error({ err }, 'Monthly KPI aggregation failed')
    }
  })

  // GA4 report fetch at 05:00 daily
  new Cron('0 5 * * *', async () => {
    payload.logger.info('Running GA4 report fetch...')
    try {
      await fetchGaReports(payload)
      payload.logger.info('GA4 report fetch completed successfully')
    } catch (err) {
      payload.logger.error({ err }, 'GA4 report fetch failed')
    }
  })

  // Data retention cleanup at 01:00 on 1st of month
  new Cron('0 1 1 * *', async () => {
    payload.logger.info('Running data retention cleanup...')
    try {
      await cleanupData(payload)
      payload.logger.info('Data retention cleanup completed successfully')
    } catch (err) {
      payload.logger.error({ err }, 'Data retention cleanup failed')
    }
  })

  // Orphan media check at 06:00 on Sundays
  new Cron('0 6 * * 0', async () => {
    payload.logger.info('Running orphan media check...')
    try {
      await checkOrphanMedia(payload)
      payload.logger.info('Orphan media check completed successfully')
    } catch (err) {
      payload.logger.error({ err }, 'Orphan media check failed')
    }
  })
}
