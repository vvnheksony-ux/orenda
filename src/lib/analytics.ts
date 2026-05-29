import { AnalyticsEventValue, LocaleCode } from '../payload/constants'

export interface AnalyticsEventParams {
  event: AnalyticsEventValue
  slug?: string
  locale: LocaleCode
  scene?: number
}

/**
 * Gets or creates a persistent session ID for analytics tracking.
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('orienda_session_id')
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('orienda_session_id', sessionId)
  }
  return sessionId
}

/**
 * Tracks a custom event by sending it to the Payload ingestion API.
 */
export async function trackEvent(params: AnalyticsEventParams) {
  if (typeof window === 'undefined') return

  try {
    const body = {
      ...params,
      sessionId: getSessionId(),
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
    }

    // Use beacon if available for better reliability on page unload, 
    // but beacon doesn't support custom headers easily. 
    // Since this is a simple POST, fetch is fine.
    void fetch('/payload-api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    // Silently fail analytics to not break user experience
    console.error('Analytics tracking failed:', err)
  }
}
