import type { Payload } from 'payload'

export const cleanupData = async (payload: Payload) => {
  const now = new Date()

  // 12 months for analyticsEvents
  const eventsCutoff = new Date()
  eventsCutoff.setMonth(now.getMonth() - 12)
  
  payload.logger.info(`Cleaning up analyticsEvents older than ${eventsCutoff.toISOString()}...`)
  const deletedEvents = await payload.delete({
    collection: 'analyticsEvents',
    where: {
      timestamp: { less_than: eventsCutoff.toISOString() },
    },
  })
  payload.logger.info(`Deleted ${deletedEvents.errors.length === 0 ? 'unknown' : 'many'} old analytics events`)

  // 24 months for auditLogs
  const auditCutoff = new Date()
  auditCutoff.setMonth(now.getMonth() - 24)
  
  payload.logger.info(`Cleaning up auditLogs older than ${auditCutoff.toISOString()}...`)
  const deletedAudit = await payload.delete({
    collection: 'auditLogs',
    where: {
      timestamp: { less_than: auditCutoff.toISOString() },
    },
  })
  payload.logger.info(`Deleted old audit logs`)
}
