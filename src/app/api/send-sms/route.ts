import { after, NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'

// Supabase "Send SMS" auth hook → MekongSMS.
//
// FLOW:
//   1. LoginModal calls supabase.auth.signInWithOtp({ phone }).
//   2. Supabase GENERATES the OTP and POSTs to this route (the Send SMS hook),
//      signed with the hook secret, body: { user: { phone }, sms: { otp } }.
//   3. This route delivers the OTP via MekongSMS.
//   4. User enters it → supabase.auth.verifyOtp() → Supabase VERIFIES it.
//
// ENV (set in Vercel → Project → Settings → Environment Variables):
//   MEKONG_USERNAME       provided by MekongSMS
//   MEKONG_PASSWORD       plaintext (hashed to MD5 here)
//   MEKONG_SENDER         sender ID, max 11 chars (sandbox: "MKN UAT")
//   MEKONG_API_URL        MekongSMS endpoint for the target environment
//   SEND_SMS_HOOK_SECRET  the "v1,whsec_..." secret Supabase shows for the hook
//                         (enables signature verification — recommended)

export const runtime = 'nodejs'

const MEKONG_USERNAME = process.env.MEKONG_USERNAME ?? ''
const MEKONG_PASSWORD = process.env.MEKONG_PASSWORD ?? ''
const MEKONG_SENDER = (process.env.MEKONG_SENDER ?? 'Orienda').slice(0, 11)
const MEKONG_API_URL = process.env.MEKONG_API_URL ?? ''
const HOOK_SECRET = process.env.SEND_SMS_HOOK_SECRET ?? ''
const MEKONG_TIMEOUT_MS = 8000

// Standard Webhooks signature check (the scheme Supabase signs the hook with).
function verifySignature(headers: Headers, body: string) {
  const id = headers.get('webhook-id')
  const timestamp = headers.get('webhook-timestamp')
  const sigHeader = headers.get('webhook-signature')
  if (!id || !timestamp || !sigHeader) throw new Error('missing webhook headers')

  const base64Secret = HOOK_SECRET.replace(/^v1,/, '').replace(/^whsec_/, '')
  const expected = crypto
    .createHmac('sha256', Buffer.from(base64Secret, 'base64'))
    .update(`${id}.${timestamp}.${body}`)
    .digest('base64')
  // Header looks like "v1,<sig> v1,<sig2>" — accept if any matches.
  const provided = sigHeader.split(' ').map((p) => p.split(',')[1])
  if (!provided.includes(expected)) throw new Error('signature mismatch')
}

function getMissingMekongConfig() {
  return [
    ['MEKONG_USERNAME', MEKONG_USERNAME],
    ['MEKONG_PASSWORD', MEKONG_PASSWORD],
    ['MEKONG_SENDER', MEKONG_SENDER],
    ['MEKONG_API_URL', MEKONG_API_URL],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)
}

function toMekongGsm(phone: string) {
  return phone.replace(/[^\d]/g, '')
}

async function sendMekongSms(phone: string, otp: string) {
  const missing = getMissingMekongConfig()
  if (missing.length > 0) {
    throw new Error(`missing Mekong config: ${missing.join(', ')}`)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MEKONG_TIMEOUT_MS)
  const gsm = toMekongGsm(phone)
  const passMd5 = crypto.createHash('md5').update(MEKONG_PASSWORD).digest('hex')
  const form = new URLSearchParams({
    username: MEKONG_USERNAME,
    pass: passMd5,
    sender: MEKONG_SENDER,
    smstext: `Your Orienda verification code is ${otp}. Do not share it with anyone.`,
    gsm,
    int: '1',
  })

  try {
    const res = await fetch(MEKONG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      signal: controller.signal,
    })
    const result = (await res.text()).trim()
    // MekongSMS returns a value starting with "0" on success; otherwise an error code.
    if (!result.startsWith('0')) {
      throw new Error(`MekongSMS error: ${result}`)
    }
    console.log(`MekongSMS sent OK (${result}) to ${gsm}`)
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  const missing = getMissingMekongConfig()

  return NextResponse.json({
    ok: true,
    route: '/api/send-sms',
    provider: 'mekongsms',
    configured: missing.length === 0,
    missing,
  })
}

export async function POST(req: NextRequest) {
  const raw = await req.text()

  // 1) Confirm the request really came from Supabase (when a secret is configured).
  if (HOOK_SECRET) {
    try {
      verifySignature(req.headers, raw)
    } catch (err) {
      console.error('send-sms: signature check failed:', (err as Error).message)
      return NextResponse.json({ error: { http_code: 401, message: 'invalid signature' } }, { status: 401 })
    }
  }

  // 2) Pull phone + OTP from Supabase's hook payload.
  let payload: { user?: { phone?: string }; sms?: { otp?: string } }
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: { http_code: 400, message: 'invalid body' } }, { status: 400 })
  }
  const phone = payload.user?.phone ?? ''
  const otp = payload.sms?.otp ?? ''
  if (!phone || !otp) {
    return NextResponse.json({ error: { http_code: 400, message: 'missing phone or otp' } }, { status: 400 })
  }

  const missing = getMissingMekongConfig()
  if (missing.length > 0) {
    return NextResponse.json(
      { error: { http_code: 500, message: `missing Mekong config: ${missing.join(', ')}` } },
      { status: 500 }
    )
  }

  // Supabase auth hooks have a short timeout. Acknowledge quickly, then send SMS.
  after(async () => {
    try {
      await sendMekongSms(phone, otp)
    } catch (err) {
      console.error(`send-sms: MekongSMS request failed for ${toMekongGsm(phone)}:`, err)
    }
  })

  return NextResponse.json({}, { status: 200 })
}
