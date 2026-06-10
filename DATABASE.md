# Database & CMS Architecture

## Overview

Single database: **Supabase Postgres** (hosted). Two systems write to it:

1. **Payload CMS** — content management (doctors, news, departments, etc.)
2. **Supabase Auth + custom tables** — user auth, appointments, inquiries

---

## 1. Payload CMS

### What is it?
Payload is a headless CMS that manages structured content. It runs at `/admin` in the app.  
The admin panel URL: `http://localhost:3000/admin` (local) or `https://orienda.com/admin` (prod).

### Database Connection
```
DATABASE_URL=postgresql://...@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```
Payload uses the `postgresAdapter` from `@payloadcms/db-postgres`. All Payload tables live in the **`payload` schema** (not `public`).

### Collections (tables in `payload` schema)
| Collection | Purpose | Page that uses it |
|---|---|---|
| `Users` | CMS admin users (NOT website users) | `/admin` login |
| `Branches` | Hospital locations (name, address, phone, hours, map) | Home MapSection, Contact |
| `Doctors` | Doctor profiles (name, specialty, dept, photo) | `/doctors`, CoE |
| `Departments` | Medical departments (name, icon, description) | `/departments` |
| `DoctorSchedules` | Doctor availability | (future) |
| `News` | News articles (title, content, thumbnail) | `/news` |
| `HealthTips` | Health tip articles | `/health-tips` |
| `DoctorTalks` | Seminar/talk events | `/doctor-talks` |
| `TourScenes` | 360° panorama room data | `/360-tour` |
| `Faqs` | FAQ Q&A pairs | `/faq` |
| `Promotions` | Promotional offers | `/promotions` |
| `ServicePackages` | Medical packages with price | `/promotions` (Packages section) |
| `Services` | Medical services list | (future) |
| `Careers` | Job postings | `/career` |
| `InsuranceUpdates` | Insurance company list/updates | `/insurance` |
| `Media` | File uploads — stored in **S3** (not DB) | all images |
| `Inquiries` | Contact form submissions | contact form → `/api/inquiries` |
| `AnalyticsEvents` | Custom event tracking | FloatingChat, CTAs |
| `Announcements` | Site-wide announcements | (future) |
| `Pages` | Generic content pages | (future) |
| `ContentSearchIndex` | Search index | (future) |
| `KpiSnapshots` | Dashboard metrics | admin only |
| `GaReports` | Google Analytics data | admin only |
| `AuditLogs` | Admin action log | admin only |

### Globals (single-record config in `payload` schema)
| Global | Purpose |
|---|---|
| `SiteSettings` | Site name, logo, contact info |
| `OperationalSettings` | Hours, holidays |
| `Navigation` | Navbar links config |
| `SocialLinks` | Facebook, Instagram, etc. URLs |

### How to read Payload data in API routes
```ts
// Option A: via Payload REST API (internal)
// GET /payload-api/doctors?locale=en&limit=20

// Option B: via custom API route (used in this project)
// src/app/api/doctors/route.ts reads from Supabase directly using SQL
// because Payload REST API is slower and requires auth headers
```

### Payload API vs custom API routes
This project uses **custom API routes** (`/api/...`) that query the `payload.*` tables directly via Supabase service client. This is faster and avoids Payload auth middleware overhead.

Example: `/api/doctors` queries `payload.doctors` table directly, not via `/payload-api/doctors`.

### Media / File Storage
All uploaded images → **AWS S3** (or S3-compatible storage).  
Config env vars: `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_ENDPOINT`

Payload stores the S3 URL in the `media` table. The URL is returned as the `url` field on media objects.

---

## 2. Supabase Auth + Custom Tables

### What is it?
Supabase handles **website user auth** (patients registering/logging in). Custom tables in the `public` schema store user-generated data.

### Auth
- Email/password login: `/login`
- Google OAuth: `/login` (Google button)
- Registration: `/register` → redirect to `/login`
- Session managed via cookies (SSR-compatible via `@supabase/ssr`)

### Custom Tables (in `public` schema)
| Table | Columns | Purpose |
|---|---|---|
| `appointments` | `id, user_id, patient_name, patient_phone, patient_email, preferred_date, preferred_time, department_id, message, source, created_at` | Appointment bookings |
| `inquiries` | `id, name, email, phone, subject, message, language, user_id, created_at` | Contact form submissions |

### Row Level Security (RLS)
- `appointments`: RLS active. Service role client bypasses it (used in `/api/appointments`)
- `inquiries`: RLS active. Service role client used (public form, any visitor can submit)

---

## 3. Supabase Clients

### Browser client (use in Client Components only)
```ts
// src/utils/supabase/client.ts
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()
// — uses ANON key — subject to RLS
```

### Server client (use in API routes / Server Components)
```ts
// src/utils/supabase/server.ts
import { createClient, createServiceClient } from '@/utils/supabase/server'

const anonClient = await createClient()        // reads session cookie, subject to RLS
const serviceClient = await createServiceClient() // BYPASSES RLS, full DB access
```

**Rule:** Use `createServiceClient()` for admin API routes. Use `createClient()` to get the current user session.

---

## 4. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://rmxxlirvvubublylbixp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # NEVER expose to client

# Payload CMS
DATABASE_URL=postgresql://postgres.rmxxlirvvubublylbixp:...@pooler.supabase.com:6543/postgres
PAYLOAD_SECRET=...                 # JWT signing secret for Payload admin sessions

# Media Storage (S3)
S3_BUCKET=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_REGION=...
S3_ENDPOINT=...                    # e.g. https://s3.amazonaws.com

# Notifications
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ADMIN_CHAT_ID=...

# Optional
ENABLE_API_DOCS=true               # enables /payload-api/docs
NEXT_PUBLIC_GA_MEASUREMENT_ID=...  # Google Analytics
```

---

## 5. Migrations

Payload schema changes → run migrations:
```bash
# Generate migration after changing a collection
npm run payload migrate:create

# Apply pending migrations
npm run payload migrate
```

Migration files live in `src/migrations/`. Already applied migrations are tracked in Supabase.

**Never manually ALTER TABLE in the `payload` schema** — always go through Payload migrations.

For the `public` schema (appointments, inquiries), use Supabase Dashboard SQL editor or MCP tools.

---

## 6. Data Flow Summary

```
Website user → form submit
  → /api/appointments (POST)
    → createClient() reads session → user_id
    → createServiceClient() INSERT into public.appointments
    → sendTelegram() notifies admin

Admin → Payload CMS
  → /admin (Payload CMS)
    → creates/edits Doctor/News/Branch/etc.
    → data stored in payload.doctors / payload.news / etc.
    → media uploaded to S3

Website visitor → page load
  → /api/doctors (GET)
    → createServiceClient() SELECT from payload.doctors
    → returns JSON to frontend
```
