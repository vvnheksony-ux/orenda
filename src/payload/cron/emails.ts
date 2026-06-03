import type { Payload } from 'payload'

export const sendWeeklyReport = async (payload: Payload) => {
  payload.logger.info('Generating weekly KPI report email...')
  
  // Fetch operational settings for recipients
  const settings = await payload.findGlobal({
    slug: 'operationalSettings',
  })

  const recipients = (settings.analyticsReportRecipients as Array<{ email: string }>)?.map(r => r.email)
  if (!recipients || recipients.length === 0) {
    payload.logger.warn('No analytics report recipients configured. Skipping email.')
    return
  }

  // Fetch last week's snapshots
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  
  const snapshots = await payload.find({
    collection: 'kpiSnapshots',
    where: {
      and: [
        { granularity: { equals: 'week' } },
        { date: { greater_than_equal: lastWeek.toISOString() } }
      ]
    },
    limit: 100
  })

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fbf7ee;">
      <h1 style="color: #4A3B2C;">Orienda Weekly KPI Report</h1>
      <p style="color: #A07A44;">Report for the week of ${lastWeek.toLocaleDateString()}</p>
      
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; margin-top: 20px;">
        <thead>
          <tr style="background: #C7A779; color: white; text-align: left;">
            <th style="padding: 12px;">Metric</th>
            <th style="padding: 12px; text-align: right;">Value</th>
          </tr>
        </thead>
        <tbody>
          ${(snapshots.docs as unknown as Array<{ metric: string; value: string | number }>).map((s) => `
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 12px; color: #4A3B2C;">${s.metric}</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #4A3B2C;">${s.value}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <p style="margin-top: 30px; text-align: center;">
        <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL}/admin/analytics" style="background: #C7A779; color: white; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold;">View Full Dashboard</a>
      </p>
    </div>
  `

  for (const email of recipients) {
    try {
      await payload.sendEmail({
        to: email,
        subject: `Orienda Weekly KPI Report - ${lastWeek.toLocaleDateString()}`,
        html,
      })
    } catch (err) {
      payload.logger.error({ err, email }, 'Failed to send weekly report email')
    }
  }
}
