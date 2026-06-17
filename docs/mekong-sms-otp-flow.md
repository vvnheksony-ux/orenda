# MekongSMS Phone OTP Flow

This document describes the current phone OTP implementation for Orienda Hospital. The app uses Supabase Auth for OTP generation and verification, and a custom Next.js route to deliver the SMS through MekongSMS.

## Summary

- UI entry point: `src/components/shared/LoginModal.tsx`
- SMS delivery endpoint: `src/app/api/send-sms/route.ts`
- Auth provider: Supabase Auth
- SMS provider: MekongSMS
- Database profile sync: Supabase `public.profiles`
- Runtime: Next.js App Router route handler, Node.js runtime

Supabase owns OTP generation and verification. The app does not generate or validate OTP codes itself. The app only sends the code that Supabase passes to the Send SMS hook.

## End-To-End Flow

1. User chooses phone login in `LoginModal`.
2. `LoginModal` calls Supabase:

```ts
supabase.auth.signInWithOtp({
  phone,
  options: { shouldCreateUser: true },
})
```

3. Supabase generates the OTP.
4. Supabase calls the configured Auth Hook: Send SMS.
5. The hook calls this app endpoint:

```text
POST /api/send-sms
```

6. The route reads Supabase's hook payload:

```json
{
  "user": { "phone": "+855..." },
  "sms": { "otp": "123456" }
}
```

7. The route sends the SMS through MekongSMS.
8. User enters the code in the modal.
9. `LoginModal` verifies with Supabase:

```ts
supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
```

10. If verified, Supabase creates or signs in the user.
11. The app syncs profile fields with `profiles.email_user` and `profiles.phone`.

## Important Code Paths

### Send OTP

File: `src/components/shared/LoginModal.tsx`

Function:

```ts
handleSendPhoneOtp()
```

Relevant call:

```ts
supabase.auth.signInWithOtp({
  phone,
  options: { shouldCreateUser: true },
})
```

This means the phone flow is a unified sign-in/sign-up flow. If the phone number does not exist yet, Supabase can create a user after OTP verification.

### Verify OTP

File: `src/components/shared/LoginModal.tsx`

Function:

```ts
handleVerifyPhoneOtp()
```

Relevant call:

```ts
supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
```

After successful verification, the app calls `syncProfile()` to upsert the phone into `public.profiles`.

### Profile Sync

File: `src/components/shared/LoginModal.tsx`

Function:

```ts
syncProfile(userId, { email, phone })
```

The profile table uses:

```text
profiles.email_user
profiles.phone
```

It does not use `profiles.email`.

## SMS Hook Endpoint

File: `src/app/api/send-sms/route.ts`

Route:

```text
GET  /api/send-sms
POST /api/send-sms
```

### GET health check

`GET /api/send-sms` returns JSON showing whether required Mekong env vars are present:

```json
{
  "ok": true,
  "route": "/api/send-sms",
  "provider": "mekongsms",
  "configured": true,
  "missing": []
}
```

Use this to verify local, tunnel, or deployed URLs before testing Supabase OTP.

### POST hook

`POST /api/send-sms` is called by Supabase Auth Hook.

The route:

- Optionally verifies Supabase webhook signature using `SEND_SMS_HOOK_SECRET`.
- Parses `user.phone` and `sms.otp`.
- Validates Mekong env config.
- Immediately returns `200` to Supabase.
- Sends the MekongSMS request in `after()` so Supabase does not time out after 5 seconds.

This fast acknowledgement exists because Supabase Auth Hooks have a short timeout. Waiting for MekongSMS synchronously caused hook timeout issues during testing.

## MekongSMS Request

The route sends a form-encoded POST to MekongSMS:

```ts
new URLSearchParams({
  username: MEKONG_USERNAME,
  pass: md5(MEKONG_PASSWORD),
  sender: MEKONG_SENDER,
  smstext: `Your Orienda verification code is ${otp}. Do not share it with anyone.`,
  gsm,
  int: '1',
})
```

Notes:

- `gsm` is the phone number stripped to digits only.
- The route hashes the plaintext password to MD5 before calling Mekong.
- Mekong success responses are expected to start with `0`.
- Non-zero responses are logged as errors.

## Environment Variables

Required in local `.env` and in Vercel:

```env
MEKONG_USERNAME=...
MEKONG_PASSWORD=...
MEKONG_SENDER=...
MEKONG_API_URL=...
SEND_SMS_HOOK_SECRET=...
```

Also required for Supabase Auth generally:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Local And Production Setup

The same code path is used for both local and production. The only difference is the public URL configured in Supabase and where the environment variables are stored.

| Environment | App URL Supabase should call | Env vars live in | Use case |
| --- | --- | --- | --- |
| Local | `https://YOUR_TUNNEL/api/send-sms` | local `.env` | Developer testing before deploy |
| Vercel Preview | `https://YOUR_PREVIEW_DOMAIN.vercel.app/api/send-sms` | Vercel Preview env vars | QA/staging test on deployed code |
| Vercel Production | `https://YOUR_PRODUCTION_DOMAIN/api/send-sms` | Vercel Production env vars | Real production OTP |

Recommended setup:

1. Keep local `.env` for developer testing.
2. Add the same Mekong/Supabase env names in Vercel for Preview and Production.
3. Point Supabase Send SMS hook to only one target at a time:
   - local tunnel when actively testing locally,
   - Vercel Preview for staging,
   - Vercel Production for production.
4. Use sandbox Mekong credentials for local/preview until Mekong provides production credentials.
5. Use production Mekong credentials only in the Vercel Production environment.

Important: Supabase Auth hooks are project-level. If local, preview, and production all share the same Supabase project, there is only one active Send SMS hook endpoint at a time. For a cleaner setup, use separate Supabase projects:

- Development Supabase project -> local tunnel or Vercel Preview
- Production Supabase project -> Vercel Production

### Mekong password gotcha

If the Mekong password contains `$`, escape it in `.env`:

```env
MEKONG_PASSWORD=your\$password
```

Do not use the MD5 hash in `MEKONG_PASSWORD`. The route hashes the plaintext password itself. If you store the MD5 hash, the app will hash it again and Mekong will reject the login.

During testing, an unescaped `$` caused Next.js to load the password incorrectly. Mekong returned:

```text
101 [Login Passoword Error]
```

The fix was escaping `$` so the loaded plaintext password produced the expected MD5 hash.

## Supabase Configuration

In Supabase Dashboard:

```text
Authentication -> Hooks -> Send SMS hook
```

Configure:

```text
Type: HTTPS endpoint
Endpoint: https://YOUR_DOMAIN/api/send-sms
Secret: generated by Supabase
```

Copy the same hook secret into the app environment:

```env
SEND_SMS_HOOK_SECRET=v1,whsec_...
```

Only the Send SMS hook should point to `/api/send-sms`. Do not configure the Send Email hook to this endpoint.

## Local Testing

Supabase cloud cannot call:

```text
http://localhost:3000/api/send-sms
```

Use a public tunnel for local testing.

### Option A: ngrok

```bash
ngrok http 3000
```

Use:

```text
https://YOUR_NGROK_DOMAIN/api/send-sms
```

Free ngrok can show an HTML warning page. If Supabase receives that page, it reports:

```text
Invalid JSON response. Received content-type: text/html
```

If this happens, use Cloudflare Tunnel or a deployed Vercel preview URL.

### Option B: Cloudflare Tunnel

```bash
cloudflared tunnel --url http://127.0.0.1:3000
```

Use:

```text
https://YOUR_TUNNEL.trycloudflare.com/api/send-sms
```

Before testing OTP, open the tunnel URL in a browser:

```text
https://YOUR_TUNNEL/api/send-sms
```

It must return JSON, not HTML.

## Deployment

After deploying to Vercel:

1. Add the Mekong and Supabase env vars in Vercel.
2. Redeploy after env var changes.
3. Configure Supabase Send SMS hook endpoint:

```text
https://YOUR_VERCEL_DOMAIN/api/send-sms
```

4. Configure the same `SEND_SMS_HOOK_SECRET` in Vercel.
5. Test with a full international phone number.

No tunnel is needed after deployment.

### Vercel Environment Checklist

Set these in Vercel Project Settings -> Environment Variables.

For Preview:

```env
MEKONG_USERNAME=...
MEKONG_PASSWORD=...
MEKONG_SENDER=MKN UAT
MEKONG_API_URL=https://sandbox.mekongsms.com/api/postsms.aspx
SEND_SMS_HOOK_SECRET=v1,whsec_...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

For Production:

```env
MEKONG_USERNAME=...
MEKONG_PASSWORD=...
MEKONG_SENDER=...
MEKONG_API_URL=...
SEND_SMS_HOOK_SECRET=v1,whsec_...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Notes:

- Vercel stores env values directly, so enter the Mekong password as the real raw value in the Vercel dashboard.
- The `\$` escape is only needed in local `.env` files when the value contains `$`.
- Redeploy after changing Vercel env vars.
- Verify the deployed route before changing Supabase:

```text
https://YOUR_VERCEL_DOMAIN/api/send-sms
```

Expected:

```json
{
  "ok": true,
  "provider": "mekongsms",
  "configured": true,
  "missing": []
}
```

### Supabase Hook URLs By Environment

Local:

```text
https://YOUR_TUNNEL/api/send-sms
```

Preview:

```text
https://YOUR_PREVIEW_DOMAIN.vercel.app/api/send-sms
```

Production:

```text
https://YOUR_PRODUCTION_DOMAIN/api/send-sms
```

After changing the hook URL, trigger a phone OTP and check logs:

- Local: Next dev server terminal/logs.
- Preview/Production: Vercel function logs for `/api/send-sms`.

Production is ready only when the health check is configured, the Supabase hook URL points at the production domain, and Vercel function logs show either `MekongSMS sent OK (...)` or a Mekong provider error code.

## Phone Number Format

Use full international/E.164-style numbers in the UI:

```text
+855XXXXXXXX
```

Avoid local-only or short numbers:

```text
012345678
17877577
```

Mekong receives the digits-only form after the route strips punctuation and spaces.

## Troubleshooting

### Supabase says hook timed out after 5 seconds

Likely causes:

- Supabase cannot reach the endpoint.
- Tunnel is closed.
- Hook endpoint still points to localhost.
- Endpoint returns slowly.

Current route returns `200` before calling MekongSMS, so if this still happens, check the public URL first.

### Supabase receives HTML instead of JSON

Likely causes:

- ngrok warning page.
- wrong tunnel URL.
- wrong path.
- Send Email hook points to `/api/send-sms`.

Open:

```text
https://YOUR_PUBLIC_URL/api/send-sms
```

Expected response is JSON with `provider: "mekongsms"`.

### Mekong returns `101 [Login Passoword Error]`

Likely causes:

- Wrong username/password.
- Password stored as MD5 instead of plaintext.
- Password contains `$` and was not escaped in `.env`.

Check that the plaintext env value hashes to the MD5 provided by Mekong.

### OTP request succeeds but SMS does not arrive

Check server logs for:

```text
MekongSMS sent OK (...)
```

or:

```text
send-sms: MekongSMS request failed ...
```

If Supabase accepted the hook but Mekong failed, the app logs the Mekong error code.

## Security Notes

- Do not commit real Mekong credentials.
- Do not paste ngrok auth tokens or provider credentials into tickets/chats.
- Rotate any credentials that were shared during testing before production.
- Keep `SEND_SMS_HOOK_SECRET` enabled in production to verify requests came from Supabase.
- The endpoint logs phone numbers as digits when Mekong fails; review logging policy before production if this is considered sensitive.

## Current Implementation Status

- Phone OTP UI exists in `LoginModal`.
- Supabase OTP verification is implemented.
- MekongSMS delivery route exists at `/api/send-sms`.
- Health check exists via `GET /api/send-sms`.
- Route uses fast Supabase acknowledgement plus background Mekong send.
- Profile sync uses `email_user` and `phone`.
- Production requires Vercel env vars and Supabase Send SMS hook URL setup.
