# Deployment Issues

Use these as GitHub issues or a launch checklist for production deployment.

## 1. Confirm Production Hosting Target

- Question: Will production run on Vercel?
- Why it matters: Hosting choice defines build/runtime behavior and domain setup.
- Acceptance criteria:
  - Production hosting platform is confirmed
  - Team agrees on deploy workflow
  - Node runtime is confirmed as `20+`

## 2. Configure Production Domain

- Question: What is the final production domain?
- Why it matters: Public URLs, metadata, GA4, sitemap, and auth flows depend on it.
- Acceptance criteria:
  - Final production domain is confirmed
  - `NEXT_PUBLIC_SITE_URL` is set to the production origin
  - `PAYLOAD_PUBLIC_SERVER_URL` is set to the production origin
  - Domain matches `metadataBase`, sitemap, and robots expectations

## 3. Point DNS To Hosting

- Question: Has the production domain been connected to Vercel and pointed correctly in DNS?
- Why it matters: The app cannot go live until DNS is correct.
- Acceptance criteria:
  - Domain is added in Vercel
  - Apex domain points to Vercel
  - `www` subdomain is configured or intentionally omitted
  - HTTPS works on the public domain

## 4. Set Production Secrets

- Question: Are all production secrets and env vars configured in the hosting platform?
- Why it matters: Missing env vars will break auth, database access, storage, and integrations.
- Acceptance criteria:
  - `PAYLOAD_SECRET` is set
  - `DATABASE_URL` is set
  - `NEXT_PUBLIC_SUPABASE_URL` is set
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
  - `SUPABASE_SERVICE_ROLE_KEY` is set
  - Storage env vars are set
  - Secrets are stored only in production env management, not git

## 5. Disable Non-Production Features

- Question: Are development-only features disabled in production?
- Why it matters: Reduces exposure and accidental misuse.
- Acceptance criteria:
  - `ENABLE_API_DOCS` is disabled in production
  - `/payload-api/docs` is not publicly exposed
  - production-blocked routes like `/api/seed-demo` are confirmed blocked

## 6. Verify Production Build Command

- Question: Is the deployment using the correct production build path?
- Why it matters: This app was verified successfully with webpack production build.
- Acceptance criteria:
  - Production build command is `npx next build --webpack`
  - Build succeeds without blocking errors
  - Hosting config does not rely on the stuck Turbopack path

## 7. Verify Production Runtime

- Question: Does the built app serve correctly in production mode?
- Why it matters: Successful build alone is not enough; runtime behavior must also work.
- Acceptance criteria:
  - Built app starts successfully with `npx next start`
  - Core pages load
  - Key APIs respond
  - No critical runtime crash on homepage

## 8. Enable Google Analytics In Production

- Question: Is GA4 configured in the production environment?
- Why it matters: Analytics depends on the runtime env var and the live domain.
- Acceptance criteria:
  - GA4 property exists
  - Web data stream exists
  - `NEXT_PUBLIC_GA_ID` is set to `G-DPLW5RZCQQ`
  - Production deploy includes the GA env var

## 9. Verify Google Analytics Consent Behavior

- Question: Does GA load only after cookie consent?
- Why it matters: This is part of the current privacy-safe implementation.
- Acceptance criteria:
  - Before consent: no GA script, no `dataLayer`
  - After consent: GA script loads
  - After consent: `dataLayer` exists
  - Realtime traffic is visible in GA4 after manual verification

## 10. Decide Whether Payload Should Import GA4 Reports

- Question: Do we want Payload admin dashboards to import GA4 reports?
- Why it matters: This requires extra setup beyond website GA tagging.
- Acceptance criteria:
  - Decision is made: yes or no
  - If yes, `GA4_PROPERTY_ID` is configured
  - If yes, `GA4_SERVICE_ACCOUNT_KEY` is configured
  - If yes, `@google-analytics/data` is installed

## 11. Configure Google Maps For Production

- Question: Is the production Google Maps key configured?
- Why it matters: Map features will not work with placeholder values.
- Acceptance criteria:
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in production
  - Key is restricted appropriately in Google Cloud

## 12. Decide Production Scope For OneSignal

- Question: Is OneSignal part of production launch scope?
- Why it matters: Push is optional, but if enabled it needs valid production config.
- Acceptance criteria:
  - Decision is made: enabled now or deferred
  - If enabled, `NEXT_PUBLIC_ONESIGNAL_APP_ID` is set
  - If enabled, `ONESIGNAL_API_KEY` is set

## 13. Decide Production Scope For Mekong OTP

- Question: Will Mekong SMS OTP be active in production?
- Why it matters: Sandbox credentials must not be used in live production.
- Acceptance criteria:
  - Decision is made: enabled now or deferred
  - If enabled, production Mekong credentials are configured
  - If enabled, production Mekong endpoint is configured
  - `SEND_SMS_HOOK_SECRET` is set securely

## 14. Configure Real Email Delivery

- Question: Is Payload email configured with a real production adapter?
- Why it matters: Current runtime warns that email falls back to console output.
- Acceptance criteria:
  - Production email provider is selected
  - Adapter is configured
  - Test email flow succeeds

## 15. Rotate Development Credentials Before Launch

- Question: Have development/test credentials been rotated before public launch?
- Why it matters: Shared or long-lived dev secrets are a production risk.
- Acceptance criteria:
  - Sensitive development credentials are reviewed
  - Any exposed or shared test secrets are rotated
  - Production uses fresh secrets

## 16. Final Production Smoke Test

- Question: Has the deployed production site passed launch smoke testing?
- Why it matters: Final confirmation before public release.
- Acceptance criteria:
  - Homepage loads
  - Authentication basics work
  - Core APIs respond
  - Storage-backed media loads
  - GA4 Realtime sees traffic
  - No high-severity console/runtime failures
