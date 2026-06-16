'use client'

import { useEffect } from 'react'
import type { IOneSignalOneSignal } from 'react-onesignal'

// Initializes the OneSignal Web Push SDK once on the client.
// Stays inert until NEXT_PUBLIC_ONESIGNAL_APP_ID is set in the environment,
// so it's safe to ship before the App ID is available.
let initialized = false
let initInFlight = false

// Browsers without these APIs (e.g. iOS Safari tabs, some in-app/mobile browsers)
// can't receive Web Push. Skip init there so OneSignal doesn't throw.
function isWebPushSupported() {
  if (typeof window === 'undefined') return false
  if (!window.isSecureContext && window.location.hostname !== 'localhost') return false
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return false
  if (!('PushManager' in window) || typeof PushSubscriptionOptions === 'undefined') return false

  return Object.prototype.hasOwnProperty.call(
    PushSubscriptionOptions.prototype,
    'applicationServerKey'
  )
}

function isExpectedUnsupportedPushError(error: unknown) {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    error.name === 'AbortError' ||
    message.includes('push service not available') ||
    message.includes('does not support web push') ||
    message.includes('push notifications')
  )
}

export default function OneSignalInit() {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId || initialized || initInFlight) return
    if (!isWebPushSupported()) return

    const init = async () => {
      initInFlight = true
      try {
        const { default: OneSignal } = await import('react-onesignal') as {
          default: IOneSignalOneSignal
        }

        await OneSignal.init({
          appId,
          autoRegister: false,
          notifyButton: {
            enable: false,
          },
          promptOptions: {
            slidedown: {
              prompts: [
                {
                  type: 'push',
                  autoPrompt: false,
                  delay: { pageViews: 999 },
                },
              ],
            },
          },
          // Lets web push work on http://localhost during local testing.
          allowLocalhostAsSecureOrigin: true,
        })
        initialized = true
      } catch (error) {
        if (!isExpectedUnsupportedPushError(error)) {
          console.warn('OneSignal init skipped:', error)
        }
      } finally {
        initInFlight = false
      }
    }

    init()
  }, [])

  return null
}
