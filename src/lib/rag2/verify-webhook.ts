import crypto from 'crypto'

export function verifyWebhookSignature(
  body: string,
  header: string | null,
  secret: string,
): boolean {
  if (!header || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header))
  } catch {
    return false
  }
}
