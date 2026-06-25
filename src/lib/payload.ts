import { getPayload } from 'payload'
import config from '@/../payload.config'

declare global {
  var __cachedPayload: Awaited<ReturnType<typeof getPayload>> | null
}

export async function getPayloadClient() {
  if (process.env.PAYLOAD_ENABLED !== 'true') {
    throw new Error(
      'Payload is disabled in this mode. Use "npm run dev:full" to enable admin features.',
    )
  }
  if (global.__cachedPayload) return global.__cachedPayload
  global.__cachedPayload = await getPayload({ config })
  return global.__cachedPayload
}
