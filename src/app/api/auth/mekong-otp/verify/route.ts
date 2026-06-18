import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import {
  hashOtp,
  normalizeCambodiaPhone,
  OTP_MAX_VERIFY_ATTEMPTS,
  syntheticPhoneEmail,
} from '@/lib/auth/mekong-otp'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const phone = normalizeCambodiaPhone(String(body?.phone ?? ''))
  const token = String(body?.token ?? '').replace(/\D/g, '')
  const challengeId = String(body?.challengeId ?? '')

  if (!phone || token.length !== 6 || !challengeId) {
    return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data: challenge, error } = await supabase
    .from('mekong_otp_challenges')
    .select('id, phone, code_hash, attempts, expires_at, consumed_at')
    .eq('id', challengeId)
    .eq('phone', phone)
    .single()

  if (error || !challenge) {
    return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 })
  }

  if (challenge.consumed_at || new Date(challenge.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'This code has expired. Please request a new one.' }, { status: 400 })
  }

  if (challenge.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 })
  }

  const expected = hashOtp(phone, token)
  if (challenge.code_hash !== expected) {
    await supabase
      .from('mekong_otp_challenges')
      .update({ attempts: challenge.attempts + 1 })
      .eq('id', challengeId)
    return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 })
  }

  await supabase
    .from('mekong_otp_challenges')
    .update({ consumed_at: new Date().toISOString(), attempts: challenge.attempts + 1 })
    .eq('id', challengeId)

  const email = syntheticPhoneEmail(phone)
  const { data: link, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      data: { phone, provider: 'mekong-otp' },
    },
  })

  const tokenHash = link?.properties?.hashed_token
  if (linkError || !tokenHash || !link.user?.id) {
    console.error('mekong-otp generateLink failed:', linkError)
    return NextResponse.json({ error: 'Could not create login session.' }, { status: 500 })
  }

  await supabase.from('profiles').upsert(
    {
      id: link.user.id,
      email_user: email,
      phone,
    },
    { onConflict: 'id' }
  )

  return NextResponse.json({
    ok: true,
    email,
    tokenHash,
  })
}
