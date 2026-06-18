import crypto from 'node:crypto'

const MEKONG_TIMEOUT_MS = 8000
const OTP_TTL_MS = 5 * 60 * 1000
const OTP_MAX_ATTEMPTS = 5

export const OTP_TTL_SECONDS = OTP_TTL_MS / 1000
export const OTP_MAX_VERIFY_ATTEMPTS = OTP_MAX_ATTEMPTS

export function normalizeCambodiaPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  const normalized = (() => {
    if (digits.startsWith('00855')) return `+${digits.slice(2)}`
    if (digits.startsWith('855')) return `+${digits}`
    if (digits.startsWith('0')) return `+855${digits.slice(1)}`
    if (digits.length >= 8 && digits.length <= 9) return `+855${digits}`
    return ''
  })()

  return /^\+855\d{8,9}$/.test(normalized) ? normalized : null
}

export function toMekongGsm(phone: string) {
  return phone.replace(/[^\d]/g, '')
}

export function getOtpExpiry() {
  return new Date(Date.now() + OTP_TTL_MS)
}

export function createOtpCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}

function getHashSecret() {
  return process.env.SEND_SMS_HOOK_SECRET || process.env.PAYLOAD_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

export function hashOtp(phone: string, code: string) {
  return crypto
    .createHmac('sha256', getHashSecret())
    .update(`${phone}.${code}`)
    .digest('hex')
}

export function getMissingMekongConfig() {
  return [
    ['MEKONG_USERNAME', process.env.MEKONG_USERNAME ?? ''],
    ['MEKONG_PASSWORD', process.env.MEKONG_PASSWORD ?? ''],
    ['MEKONG_SENDER', process.env.MEKONG_SENDER ?? ''],
    ['MEKONG_API_URL', process.env.MEKONG_API_URL ?? ''],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)
}

export async function sendMekongSms(phone: string, message: string) {
  const missing = getMissingMekongConfig()
  if (missing.length > 0) {
    throw new Error(`missing Mekong config: ${missing.join(', ')}`)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MEKONG_TIMEOUT_MS)
  const gsm = toMekongGsm(phone)
  const passMd5 = crypto.createHash('md5').update(process.env.MEKONG_PASSWORD ?? '').digest('hex')
  const form = new URLSearchParams({
    username: process.env.MEKONG_USERNAME ?? '',
    pass: passMd5,
    sender: (process.env.MEKONG_SENDER ?? 'Orienda').slice(0, 11),
    smstext: message,
    gsm,
    int: '1',
  })

  try {
    const res = await fetch(process.env.MEKONG_API_URL ?? '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      signal: controller.signal,
    })
    const result = (await res.text()).trim()
    if (!result.startsWith('0')) {
      throw new Error(`MekongSMS error: ${result}`)
    }
    console.log(`MekongSMS sent OK (${result}) to ${gsm}`)
    return result
  } finally {
    clearTimeout(timeout)
  }
}

export function syntheticPhoneEmail(phone: string) {
  return `phone.${toMekongGsm(phone)}@orienda.local`
}
