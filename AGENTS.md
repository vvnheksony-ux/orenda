<!-- BEGIN:nextjs-agent-rules -->

# Next.js 16

Next is pinned to `16.2.6` with React `19.2.4`; verify App Router APIs against the installed package/docs before changing routing, metadata, middleware, or route handlers. Do not assume older Next signatures, e.g. route `params` are awaited in `src/app/[locale]/layout.tsx`.

<!-- END:nextjs-agent-rules -->

## Commands

- npm is the package manager here (`package-lock.json`); run `npm install` if dependencies are missing.
- Use `npm run dev`, `npm run build`, and `npm run lint`.
- No `test`, `typecheck`, formatter, CI, or pre-commit config exists; use `npm run build` for Next/TypeScript verification and `npm run lint` for ESLint.

## App Shape

- The README is the default template and points at `app/page.tsx`; the real homepage is `src/app/[locale]/page.tsx`.
- App Router pages live under `src/app/[locale]`; API route handlers live under `src/app/api`.
- `next-intl` is wired by `next.config.ts` -> `src/i18n/request.ts`; locales are `en`, `km`, and `zh`, with messages in root `messages/*.json`.
- Prefer localized navigation helpers from `src/i18n/routing.ts` over raw Next router/link helpers.
- `src/app/[locale]/layout.tsx` owns global providers: `NextIntlClientProvider`, `AuthProvider`, and `CookieConsent`.

## Supabase

- Browser Supabase client: `src/utils/supabase/client.ts`; server clients: `src/utils/supabase/server.ts`.
- Required env vars are `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` for service-role API routes.
- `src/middleware.ts` combines `next-intl` routing with Supabase session refresh; preserve both when editing matcher or auth flow.
- API routes use service role through `@/lib/supabase`; `/api/doctors` reads from the `payload.doctors` schema.

## Styling

- Tailwind v4 is configured in `src/app/globals.css` with `@import "tailwindcss"` and `@theme inline`; there is no `tailwind.config.*`.
- Brand fonts are centralized in `src/lib/fonts.ts` and exposed as CSS variables consumed by Tailwind font tokens.
- `next.config.ts` restricts image qualities to `[75, 90]`; remote doctor images currently use `<Image unoptimized />`.

## Local Artifacts

- `.env*`, `node_modules`, `.next`, `out`, `build`, `next-env.d.ts`, images, SQL, logs, and `.claude/` are ignored.
- `.playwright-mcp/` contains local Playwright MCP page snapshots; do not treat it as app source.

## Plans

- Make the plan extremely consise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questios to answer, if any.
