import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import {
  createOtpCode,
  getMissingMekongConfig,
  getOtpExpiry,
  hashOtp,
  normalizeCambodiaPhone,
  OTP_TTL_SECONDS,
  sendMekongSms,
} from '@/lib/auth/mekong-otp'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const phone = normalizeCambodiaPhone(String(body?.phone ?? ''))

  if (!phone) {
    return NextResponse.json({ error: 'Please enter a valid Cambodian phone number.' }, { status: 400 })
  }

  const missing = getMissingMekongConfig()
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing Mekong config: ${missing.join(', ')}` }, { status: 500 })
  }

  const supabase = await createServiceClient()
  const since = new Date(Date.now() - 60_000).toISOString()
  const { count, error: countError } = await supabase
    .from('mekong_otp_challenges')
    .select('id', { count: 'exact', head: true })
    .eq('phone', phone)
    .gte('created_at', since)

  if (countError) {
    return NextResponse.json({ error: 'Could not check OTP rate limit.' }, { status: 500 })
  }

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a minute.' }, { status: 429 })
  }

  const code = createOtpCode()
  const expiresAt = getOtpExpiry()
  const { data, error } = await supabase
    .from('mekong_otp_challenges')
    .insert({
      phone,
      code_hash: hashOtp(phone, code),
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    return NextResponse.json({ error: 'Could not create OTP challenge.' }, { status: 500 })
  }

  try {
    await sendMekongSms(phone, `Your Orienda verification code is ${code}. Do not share it with anyone.`)
  } catch (err) {
    console.error('mekong-otp send failed:', err)
    return NextResponse.json({ error: 'Could not send SMS. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({
    ok: true,
    challengeId: data.id,
    phone,
    expiresIn: OTP_TTL_SECONDS,
  })
}
