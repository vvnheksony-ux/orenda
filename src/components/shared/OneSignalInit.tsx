'use client'

import { useEffect } from 'react'
import type { IOneSignalOneSignal, IInitObject } from 'react-onesignal'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'

// Initializes the OneSignal Web Push SDK once on the client, then — when a
// patient is logged in — links the device to their profile, asks for
// permission, and saves the subscription id into profiles.onesignal_player_id.
// Stays inert until NEXT_PUBLIC_ONESIGNAL_APP_ID is set in the environment,
// so it's safe to ship before the App ID is available.
let initialized = false
let initInFlight = false
let oneSignalRef: IOneSignalOneSignal | null = null

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

// Write the current push subscription id to the logged-in patient's profile.
// No-op until OneSignal has actually produced an id (it arrives once the user
// has accepted the permission prompt).
async function saveSubscriptionId(userId: string) {
  const OneSignal = oneSignalRef
  const subscriptionId = OneSignal?.User?.PushSubscription?.id
  if (!subscriptionId) return

  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ onesignal_player_id: subscriptionId })
    .eq('id', userId)
  if (error) console.warn('OneSignal: failed to save subscription id:', error.message)
}

export default function OneSignalInit() {
  const { user } = useAuth()

  // 1) Initialize the SDK exactly once.
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
          notifyButton: { enable: false } as unknown as IInitObject['notifyButton'],
          // Lets web push work on http://localhost during local testing.
          allowLocalhostAsSecureOrigin: true,
        })
        oneSignalRef = OneSignal
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

  // 2) Once a patient is logged in: link the device, prompt for permission,
  //    and save the resulting subscription id to their profile.
  useEffect(() => {
    if (!user) return
    let cancelled = false
    const onSubscriptionChange = () => {
      if (!cancelled) saveSubscriptionId(user.id)
    }

    const run = async () => {
      // Wait for init (step 1) to finish — it runs in parallel on first load.
      for (let i = 0; i < 50 && !oneSignalRef; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      const OneSignal = oneSignalRef
      if (!OneSignal || cancelled) return

      try {
        // Tie this browser/device to the patient's profile id (external_id).
        await OneSignal.login(user.id)

        // Show the browser's "Allow notifications?" prompt if not yet decided.
        if (!OneSignal.Notifications.permission) {
          await OneSignal.Notifications.requestPermission()
        }

        // Save the id now if we have one, and again whenever it changes
        // (the id is only available after the user accepts).
        await saveSubscriptionId(user.id)
        OneSignal.User.PushSubscription.addEventListener('change', onSubscriptionChange)
      } catch (error) {
        if (!isExpectedUnsupportedPushError(error)) {
          console.warn('OneSignal subscribe skipped:', error)
        }
      }
    }

    run()

    return () => {
      cancelled = true
      oneSignalRef?.User?.PushSubscription?.removeEventListener('change', onSubscriptionChange)
    }
  }, [user])

  return null
}
