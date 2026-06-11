# Orienda Hospital — Sprint Tasks

## ✅ Done
- [x] Build passes — zero TypeScript errors
- [x] 404 page created
- [x] Appointments page restored (`/appointments`) with user history + Book New
- [x] Appointments GET API (returns user's bookings)
- [x] SEO metadata (OG, Twitter, robots) in layout
- [x] Navbar: Sign In button + user avatar dropdown + My Appointments link
- [x] Navbar: mobile Sign In / Sign Out / My Appointments
- [x] Cache-Control headers on all public API routes
- [x] Mock data flash fixed (WhySection, PartnersSection — start null, no flicker)
- [x] 360 tour cache (module-level, shared across all tour pages)
- [x] ThreeSixtyViewer: PSV internal loader hidden
- [x] MapSection: Figma design implemented (slide-up info panel on hover)
- [x] Google OAuth `prompt: select_account` (forces account picker after logout)
- [x] Register → redirect to login after signup
- [x] API routes no longer hijacked by next-intl locale redirect
- [x] Fake/mock data removed (fake testimonials, fake jobs, fake clinics)
- [x] Cleanup: deleted .playwright-mcp/, root screenshots, temp files, .claude figma pngs
- [x] Duplicate images removed (~46MB freed): room-bg, 360-bg, room-card, why-bg, branch-building, figma-building
- [x] Contact form inquiries API — public (no auth required), uses service client
- [x] Empty states: doctors (0 doctors), departments (0 depts), 360 tour (0 scenes)
- [x] Sitemap (`/sitemap.xml`) + robots.txt (`/robots.txt`) added
- [x] `og-cover.jpg` created from facility-main.jpg

---

## 🔴 Code Tasks (Dev work)

### Auth & User Flow
- [ ] Test full appointment booking: login → modal → submit → Supabase → Telegram fires
- [ ] Test Google OAuth on local (login + logout + re-login forces picker)
- [ ] Forgot password flow — test email sends and reset works
- [x] After login redirect — `?next=` param wired: email/phone/Google all redirect correctly

### Forms & Submissions
- [x] Contact page form — verified: submits to `/api/inquiries`, success state shown, public access fixed
- [x] Inquiry page form — submits to `/api/inquiries`, validation present (name + email/phone + consent)
- [x] BookAppointmentModal — validation: name+phone required, error shown; auth guard: unauthenticated → `/login?next=` 
- [x] Career page — "Apply Now" links to `/career/[slug]` detail page ✓

### Pages — Empty State / Crash Guard
- [x] Doctors page — 0 doctors: shows message, hides empty dept sections
- [x] News page — 0 articles: shows "No news available"
- [x] 360 tour list page — 0 scenes: shows message not blank
- [x] Clinics/Departments — 0 items: shows message
- [x] Promotions page — 0 promos/packages: shows message
- [x] Health tips page — already handled (displayed.length === 0 check)
- [x] Doctor talks page — already handled (displayed.length === 0 check)
- [x] Centers of Excellence — 0 doctors: shows message (not infinite skeleton)

### Navigation & Links
- [x] Footer links — all fixed: `/about`, `/news`, `/career`, `/promotions`, `/doctors`, `/departments`, `/contact`; phone=tel:, email=mailto:, address=Google Maps
- [x] Navbar nav items — all correct (verified by agent)
- [x] "Book Appointment" CTA — footer wired; BookAppointmentSection added to homepage; hero has AI search (intentional, no book CTA)
- [x] Emergency form — API auth guard removed (public), validation fixed to match `contact_info` field
- [x] Doctor detail page — "Back" button: `/doctors` ✓
- [x] News detail — "Back to news": `/news` ✓
- [ ] Department/clinic detail — breadcrumb works (no breadcrumb, not critical)

### Mobile Responsiveness (375px + 768px)
- [x] All locale pages — `px-[80px]` → `px-4 sm:px-8 lg:px-[80px]` (bulk replace done)
- [x] All locale pages — `pt-[212px]` → `pt-[100px] lg:pt-[212px]` (bulk replace done)
- [ ] Home page — all sections look good on mobile (visual QA)
- [ ] Navbar mobile drawer — all links, sign in, branch selector work
- [ ] MapSection — mobile layout (stacked cards)
- [ ] Doctors page — card grid on mobile
- [ ] News page — layout on mobile
- [ ] BookAppointmentModal — usable on mobile (scrollable, fields accessible)
- [ ] 360 Tour page — carousel works on mobile (touch drag)
- [ ] Centers of Excellence — layout on mobile
- [ ] About page — mobile layout
- [ ] Footer — mobile layout

### Admin Panel & Content (OUT OF SCOPE — admin team handles)
- Admin panel + Payload CMS content entry handled by admin team, not dev

### i18n — Translations
- [x] `messages/km.json` — all 23 keys present, fully translated
- [x] `messages/zh.json` — all 23 keys present, fully translated
- [ ] Test app in Khmer locale — no missing strings (visual QA)
- [ ] Test app in Chinese locale — no missing strings (visual QA)

### SEO & Meta
- [x] `og-cover.jpg` image exists at `/public/images/og-cover.jpg`
- [x] Sitemap — `src/app/sitemap.ts` added → `/sitemap.xml`
- [x] robots.txt — `src/app/robots.ts` added → `/robots.txt`
- [x] Each major page has specific title — 13 layout.tsx + 3 server page.tsx files added (doctors, news, departments, contact, faq, emergency, promotions, career, appointments, 360-tour, CoE, health-tips, doctor-talks, about, insurance, testimonials)

### Performance
- [ ] Lighthouse score check (target: >80 performance)
- [ ] Images — verify no unoptimized large images on homepage
- [x] FloatingChat — wired to `/api/ai-chat` → n8n webhook `orienda_ai_agent`; HeroSection dispatches `orienda:ask-ai` event → chat opens (code verified)

### Deployment
- [x] `npm run build` — passes clean ✓
- [x] All env vars documented in `.env.example`
- [ ] Vercel project configured with all production env vars
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` set on Vercel
- [ ] `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID` set on Vercel
- [ ] `DATABASE_URL` set on Vercel
- [ ] `NEXT_PUBLIC_SITE_URL=https://orienda.com` set on Vercel (required for payloadFetch: partners, testimonials, why-stats, globals APIs)
- [ ] Google OAuth redirect URI updated for production domain
- [ ] Deploy to Vercel — production URL works
- [ ] Test full appointment flow on production

### Polish / Nice-to-have (do if time allows)
- [ ] Sitemap auto-generated
- [ ] Cookie consent — verify it blocks analytics until accepted
- [ ] Loading skeleton on doctors/news/departments pages (instead of blank)
- [ ] Smooth page transitions
- [ ] Print-friendly styles for appointment confirmation
