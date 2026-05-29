# PRD — Orienda Backend, CMS & Analytics Platform

**Version:** 3.0  
**Date:** 2026-05-28  
**Stack:** PayloadCMS · Node.js (v20 LTS) · PostgreSQL 16 · REST + GraphQL  
**Scope:** Backend only — CMS, Admin Panel, Localization, Analytics & KPI  

---

## Overview

Build the complete backend system for Orienda using **PayloadCMS** as the foundation. This covers the content API, role-based admin panel, multilingual (localized) dynamic content, embedded analytics dashboard, and custom KPI tracking — all managed from within the PayloadCMS admin UI.

Frontend / website implementation is **out of scope** for this PRD.

---

## Architecture

```
                        ┌──────────────────────────────────────────────────┐
                        │              PayloadCMS Admin Panel               │
                        │  ┌────────────┐ ┌─────────────┐ ┌─────────────┐ │
                        │  │  Content   │ │ Localization │ │ Analytics & │ │
                        │  │  Manager   │ │  (en / km)   │ │  KPI View   │ │
                        │  └────────────┘ └─────────────┘ └─────────────┘ │
                        └────────────────────┬─────────────────────────────┘
                                             │
               ┌─────────────────────────────┼──────────────────────────┐
               ▼                             ▼                          ▼
          REST API                      GraphQL API              Webhook Layer
          /api/*                        /api/graphql          (outbound on events)
               │                             │                          │
               └─────────────────────────────┴──────────────────────────┘
                                             │
                              ┌──────────────┼──────────────┐
                              ▼              ▼              ▼
                        PostgreSQL 16    node-cron       BullMQ Queue
                        (primary DB)   (scheduled jobs)  (async tasks)
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
         S3 / R2 Media   GA4 Data API    SMTP / Resend
         (file storage)  (server-side)   (email reports)
```

**Webhook Layer:** PayloadCMS `afterChange` hooks emit outbound webhooks on
content publish events. Payload: `{ event, collection, docId, locale, timestamp }`.
Consumers: frontend revalidation (ISR), third-party notification systems.
Webhook targets are configured per-collection in `siteSettings` (admin-managed URL list).

---

## Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | PayloadCMS Backend & Collections | Core setup, all collections, localization, API |
| 2 | CMS Admin Panel — RBAC & Content Ops | Roles, workflows, media, versioning, audit trail |
| 3 | Analytics & KPI Dashboard | Custom analytics embedded in admin panel + reporting |

---

---

## Module 1 — PayloadCMS Backend & Collections

### Goal
Bootstrap PayloadCMS as the backend engine: define all content and analytics collections, enable localization on dynamic fields, configure the database, and expose a clean REST + GraphQL API.

---

### Scope of Work

#### 1.1 — Project Bootstrap
- Initialize PayloadCMS project with TypeScript (`strict: true`)
- Node.js v20 LTS runtime
- Set up PostgreSQL adapter (`@payloadcms/db-postgres`)
- Configure environment variables (`.env` schema documented below)
- Set up CORS allowlist, express-rate-limit, helmet security headers
- Define base `payload.config.ts`

**Environment Variables Schema:**
```
# Database
DATABASE_URI=postgresql://user:pass@host:5432/orienda

# PayloadCMS
PAYLOAD_SECRET=<32+ char secret>

# S3 / Cloudflare R2
S3_BUCKET=
S3_REGION=
S3_ENDPOINT=          # R2 custom endpoint if used
S3_ACCESS_KEY=
S3_SECRET_KEY=
PUBLIC_MEDIA_URL=     # CDN base URL for media

# Google Analytics
GA4_PROPERTY_ID=
GA4_SERVICE_ACCOUNT_KEY=   # JSON string of service account

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# App
NODE_ENV=development|staging|production
PAYLOAD_PUBLIC_SERVER_URL=
FRONTEND_URL=         # for preview links and CORS
WEBHOOK_SECRET=       # HMAC secret for outbound webhooks
```

---

#### 1.2 — Complete Collection Schema

##### Content Collections (Public-facing)

| Collection | Key Fields | Localized | Versions | Notes |
|------------|-----------|-----------|----------|-------|
| `pages` | title, slug, hero (block), sections (blocks array), seoTitle, seoDesc, seoImage | ✅ | ✅ | Block-based layout builder |
| `doctors` | name, photo (→media), bio (richText), specialty, department (→departments), phone, email, order | ✅ | ✅ | |
| `departments` | name, slug, description, icon (→media), doctors (relation array) | ✅ | ✅ | |
| `services` | title, slug, description, department (→departments), icon (→media) | ✅ | ✅ | |
| `news` | title, slug, body (richText), thumbnail (→media), excerpt, author, publishedAt, status | ✅ | ✅ | |
| `promotions` | title, description, image (→media), validFrom (date), validTo (date), status | ✅ | ✅ | |
| `faqs` | question, answer (richText), category (select), order | ✅ | ✅ | |
| `tourScenes` | sceneNumber (int, 1–15), title, description, thumbnailImage (→media), hotspots (array) | ✅ | ❌ | Manages 360° tour content |

##### Operational Collections (Internal)

| Collection | Key Fields | Localized | Notes |
|------------|-----------|-----------|-------|
| `inquiries` | name, phone, email, message, status (new/in-progress/resolved), assignedTo (→users), resolvedAt (date), staffNotes (textarea), createdAt | ❌ | Internal workflow; staff manage from admin |
| `users` | email, name, role (admin/editor/contributor), avatar (→media), lastLoginAt | ❌ | PayloadCMS auth users |
| `media` | file, mimeType, filesize, width, height, alt, caption, tags (array), usedIn (virtual) | ✅ (alt, caption) | |

##### Analytics Collections (Append-only / System)

| Collection | Key Fields | Access |
|------------|-----------|--------|
| `analyticsEvents` | event (enum), slug, locale, scene (int), sessionId, ipHash, referrer, userAgent, timestamp | Append via public API; read by admin only |
| `kpiSnapshots` | date, metric (enum), value (int), locale, granularity (day/week/month), breakdown (JSON) | System write; admin read |
| `gaReports` | reportType (enum), dateRange, data (JSON), fetchedAt | System write; admin read |

##### System Collections

| Collection | Key Fields | Access |
|------------|-----------|--------|
| `auditLogs` | action (created/updated/published/archived/deleted), collectionSlug, documentId, documentTitle, userId, userName, userRole, changedFields (JSON diff), timestamp | Admin read-only; no UI write |

**Full `auditLogs` field schema:**
```typescript
{
  action:          'created' | 'updated' | 'published' | 'archived' | 'deleted',
  collectionSlug:  string,           // e.g. 'doctors'
  documentId:      string,
  documentTitle:   string,           // snapshot of title at time of change
  userId:          string,
  userName:        string,
  userRole:        'admin' | 'editor' | 'contributor',
  changedFields:   {                 // JSON diff — only changed keys
    field: string,
    before: unknown,
    after:  unknown,
  }[],
  timestamp:       Date,
}
```

---

#### 1.3 — Localization (i18n via PayloadCMS)

```typescript
// payload.config.ts
localization: {
  locales: [
    { label: 'English', code: 'en' },
    { label: 'Khmer',   code: 'km' },
  ],
  defaultLocale: 'en',
  fallback: true,   // serve 'en' if 'km' field is empty
}
```

- All user-facing text fields marked `localized: true`
- Rich text (Lexical) fields localized independently per locale
- REST API: `GET /api/doctors?locale=km` — returns Khmer fields (falls back to en)
- GraphQL: `doctors(locale: km) { name bio }` — same fallback behavior
- Admin UI: locale tabs per document — editors switch locale inline
- **Translation completeness tracking:** custom admin view shows `km` completion % per collection (count of docs with non-empty `km` fields vs total)

---

#### 1.4 — Complete API Route Map

##### Auto-generated by PayloadCMS (per collection)
```
GET    /api/{collection}              List with pagination, filters, sort
GET    /api/{collection}/:id          Single document
POST   /api/{collection}              Create (auth required)
PATCH  /api/{collection}/:id          Update (auth required)
DELETE /api/{collection}/:id          Delete (auth required)
GET    /api/{collection}/:id/versions Version history list (auth required)
GET    /api/globals/{global}          Read global
POST   /api/globals/{global}          Update global (auth required)
```

**Pagination:** All list endpoints support `?limit=20&page=1`. Max limit: 100.
Response envelope: `{ docs, totalDocs, limit, page, totalPages, hasNextPage, hasPrevPage }`.

##### Custom Routes
```
POST   /api/inquiries          Public form submission (rate-limited: 5/min per IP)
POST   /api/events             KPI event ingestion (rate-limited: 60/min per IP)
GET    /api/analytics/kpi      KPI summary (auth: admin only)
                               Query: ?from=2026-01-01&to=2026-01-31&metric=all
GET    /api/analytics/export   CSV export of KPI data (auth: admin only)
                               Query: ?from=&to=&metrics=calls,inquiries,tour
POST   /api/auth/login         Login → JWT access + refresh tokens
POST   /api/auth/refresh       Refresh access token
POST   /api/auth/logout        Revoke refresh token
GET    /api/health             Health check (uptime, DB status) — public
```

##### Auth Flow
- Access token: JWT, 15-minute TTL
- Refresh token: httpOnly cookie, 7-day TTL
- Token revocation: refresh token stored in DB; deleted on logout

##### Webhook Outbound (server-to-server)
```
POST {configured_url}   Triggered on: afterChange (status = published), afterDelete
Headers: X-Payload-Signature: HMAC-SHA256(body, WEBHOOK_SECRET)
Body: { event, collection, docId, locale, slug, timestamp }
```

---

#### 1.5 — Globals

| Global | Localized Fields | Non-localized Fields |
|--------|-----------------|----------------------|
| `siteSettings` | siteName, tagline, emergencyCTAText | logo (→media), contactEmail, contactPhone, analyticsReportRecipients, webhookTargets |
| `navigation` | mainMenuItems (label, url, children array), footerMenuItems | — |
| `socialLinks` | — | facebook, instagram, youtube, tiktok |

---

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|-------------|---------------------|
| D1.1 | PayloadCMS running, DB connected | Admin at `/admin`; all collections visible; health endpoint returns 200 |
| D1.2 | All 16 collections defined | CRUD functional for every collection via admin and API |
| D1.3 | Localization enabled | Per-locale editing works; `?locale=km` returns correct fallback data |
| D1.4 | Full API route map live | All endpoints return correct responses; Postman collection delivered |
| D1.5 | Webhooks functional | Publish event fires outbound webhook; HMAC signature verifiable |
| D1.6 | Globals configured | All 3 globals editable in admin; changes reflected in API |

---

### Phase Breakdown

#### Phase 1.1 — Bootstrap & DB
```
- [ ] Init PayloadCMS + TypeScript (strict)
- [ ] Install @payloadcms/db-postgres; connect to PostgreSQL 16
- [ ] .env schema file + validation on startup (throw if required vars missing)
- [ ] CORS allowlist (FRONTEND_URL + admin origin)
- [ ] express-rate-limit (global: 200/min; strict on public POST routes)
- [ ] helmet() security headers
- [ ] Base payload.config.ts — no collections yet
- [ ] /api/health endpoint
- [ ] Confirm /admin loads, DB migrations run cleanly
```
**Output:** Running PayloadCMS install; health check green; DB connected.

---

#### Phase 1.2 — Collections & Schema
```
- [ ] Define all 8 content collections (fields, validation, relations)
- [ ] Define all 3 operational collections (inquiries, users, media)
- [ ] Define all 4 analytics/system collections (analyticsEvents, kpiSnapshots, gaReports, auditLogs)
- [ ] tourScenes collection (sceneNumber 1–15, hotspots array)
- [ ] inquiries: assignedTo (→users), resolvedAt, staffNotes fields
- [ ] Field validation: required fields, slug format regex, date range logic
- [ ] beforeChange hook: auto-generate slug from title (if blank)
- [ ] afterChange hook: invalidate cache / fire webhook (stub for now)
- [ ] Seed script: sample data for all content collections
```
**Output:** All 16 collections CRUD-functional; seed data visible in admin.

---

#### Phase 1.3 — Localization & Globals
```
- [ ] Enable localization config (en, km, fallback: true)
- [ ] Mark localized: true on all applicable fields per collection
- [ ] Create all 3 Globals with correct localized fields
- [ ] Translation completeness view (custom admin component)
- [ ] Test locale switching in admin UI
- [ ] Test ?locale=km on REST; verify en fallback when km is empty
- [ ] Test GraphQL locale argument
```
**Output:** Editors can independently manage en and km content; fallback works.

---

#### Phase 1.4 — API Hardening, Custom Routes & Docs
```
- [ ] Access control: public read on content collections; auth required for write
- [ ] analyticsEvents, kpiSnapshots, gaReports, auditLogs: admin-read only (no public access)
- [ ] JWT auth flow (login, refresh, logout routes)
- [ ] POST /api/inquiries (public; rate-limit 5/min per IP; store to inquiries collection)
- [ ] POST /api/events (public; rate-limit 60/min per IP — see Module 3)
- [ ] GET /api/analytics/kpi + GET /api/analytics/export (admin-only)
- [ ] Outbound webhook on afterChange (status → published) with HMAC signing
- [ ] OpenAPI spec generated (or manual Postman collection with all routes)
- [ ] Input sanitization on all POST body fields
```
**Output:** Secure API; all custom routes working; documentation delivered.

---

---

## Module 2 — CMS Admin Panel (RBAC, Content Ops, Media, Versioning)

### Goal
Configure PayloadCMS admin as a full content operations hub — role-based access, content workflow with scheduled publishing, media management, version history, and tamper-evident audit trail.

---

### Scope of Work

#### 2.1 — Role-Based Access Control (RBAC)

| Role | Collections | Publish | Delete | Users | Settings | Analytics |
|------|-------------|---------|--------|-------|----------|-----------|
| **Admin** | All | ✅ | ✅ | ✅ manage | ✅ | ✅ |
| **Editor** | Content + Media | ✅ | ✅ own | ❌ | ❌ | ❌ view only |
| **Contributor** | Content (own drafts) | ❌ | ❌ | ❌ | ❌ | ❌ |

**Field-level restrictions:**
- `status`, `publishedAt`, `assignedTo` fields: hidden from Contributor in UI; blocked at API level
- `role` field on users: admin-only read/write
- `analyticsEvents`, `kpiSnapshots`, `gaReports`, `auditLogs`: admin-only; not visible to other roles

**Access function pattern (PayloadCMS):**
```typescript
// Example: collections/news.ts
access: {
  read:   () => true,                          // public
  create: ({ req }) => !!req.user,             // any logged-in user
  update: ({ req }) => isEditorOrAdmin(req),
  delete: ({ req }) => isAdmin(req),
  admin:  ({ req }) => !!req.user,
}
```

---

#### 2.2 — Content Workflow & Scheduled Publishing

**Status flow:**
```
draft → published → archived
  ↑___________↓         ↓
  (unpublish)     (restore to draft)
```

- `status` field (select): `draft` | `published` | `archived`
- `publishedAt` (datetime): if set to a future time, document stays `draft` in API responses until that time passes
- **Scheduled publishing implementation:**
  - `publishedAt` is a plain datetime field; no external queue needed
  - All public REST/GraphQL queries filter: `status = published AND (publishedAt IS NULL OR publishedAt <= NOW())`
  - Revalidation webhook fires when status changes to `published`
- **Preview links:** each content collection has a `previewUrl` computed field:
  `${FRONTEND_URL}/preview?secret=${PREVIEW_TOKEN}&slug={doc.slug}&locale={locale}`
  - `PREVIEW_TOKEN` is a shared secret between CMS and frontend
  - Frontend validates token before rendering preview

---

#### 2.3 — Media Library

- **Upload adapter:** `@payloadcms/storage-s3` (local disk in dev via env flag)
- **Supported types:** JPEG, PNG, WebP, GIF, SVG, PDF, DOCX (max 20 MB per file)
- **Auto-generated image sizes:**

| Size Name | Max Width | Format | Usage |
|-----------|-----------|--------|-------|
| `thumbnail` | 400px | WebP | Admin grid, list views |
| `card` | 800px | WebP | Blog cards, doctor cards |
| `hero` | 1600px | WebP | Page hero banners |
| `og` | 1200px | JPEG | Social share / SEO |

- **CDN URL pattern:** `${PUBLIC_MEDIA_URL}/{filename}` (R2 public bucket or CDN prefix)
- **Tag system:** free-form tags array; filterable in admin media picker
- **Usage tracking:** `afterChange` hook on all content collections writes `mediaId` references to a lookup; admin shows "used in X documents" per asset
- **Orphan detection:** weekly cron reports media files not referenced by any document

---

#### 2.4 — Content Versioning

- `versions: { maxPerDoc: 20, drafts: true }` on: `pages`, `news`, `promotions`, `doctors`, `departments`, `services`, `faqs`
- Auto-save: PayloadCMS saves a draft version every time a document is saved (not just on publish)
- Admin version list: shows version number, save date, saved-by user, status at save time
- Diff view: side-by-side or inline diff of changed fields (PayloadCMS built-in)
- Restore: one-click restores selected version as current draft (does not auto-publish)

---

#### 2.5 — Inquiry Management Workflow

The `inquiries` collection doubles as a lightweight CRM for staff:

```
new → in-progress → resolved
```

- Admin/Editor can view all inquiries; assign to self or another user (`assignedTo`)
- `staffNotes` textarea for internal communication
- `resolvedAt` auto-populated when status set to `resolved`
- Email notification: when new inquiry submitted → notify admin emails (via SMTP)
- Bulk actions in admin: mark selected as resolved, export selected to CSV

---

#### 2.6 — Audit Trail

Full schema defined in section 1.2. Behavioral spec:

- **Trigger:** `afterChange` and `afterDelete` global hooks run on every collection
- **Excluded collections:** `analyticsEvents`, `kpiSnapshots`, `gaReports`, `auditLogs` (system collections — not audited to avoid infinite loops)
- **Diff logic:** compare `req.data` (new) vs. fetched previous document; log only changed keys
- **Storage:** written to `auditLogs` collection; no delete or update permitted on this collection (enforced via access functions)
- **Retention:** audit logs retained for 24 months; records older than 24 months deleted by monthly cron
- **Admin view:** filterable by collection, user, action, date range; paginated table
- **CSV export:** `GET /api/audit-export?from=&to=&collection=&userId=` (admin-only)

---

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|-------------|---------------------|
| D2.1 | RBAC enforced at API + UI | Unauthorized actions blocked for each role; confirmed via test matrix |
| D2.2 | Content workflow live | Draft/publish/archive transitions work; scheduled publish fires at correct time |
| D2.3 | Preview links functional | Preview URL renders unpublished content behind token; invalid token → 401 |
| D2.4 | Media library on S3/R2 | Uploads stored on S3; image sizes generated; CDN URLs correct |
| D2.5 | Version history | 20-version cap; restore works; diff shows changed fields |
| D2.6 | Inquiry workflow | Status transitions work; email on new submission; CSV export functional |
| D2.7 | Audit trail live | Every write action logged with diff; CSV export works; retention cron runs |
| D2.8 | Staff training documentation | Role-specific guide with annotated screenshots |

---

### Phase Breakdown

#### Phase 2.1 — RBAC Setup
```
- [ ] Role enum on users collection (admin / editor / contributor)
- [ ] Access functions implemented on all 16 collections
- [ ] Field-level access: status, publishedAt, assignedTo hidden from contributor
- [ ] analyticsEvents / kpiSnapshots / gaReports / auditLogs: admin-only
- [ ] User management UI (admin invites by email, assigns role)
- [ ] RBAC test matrix: document expected vs actual result for each role × action
- [ ] Run full test matrix; confirm all pass
```
**Output:** Roles enforced at API and UI level; test matrix documented.

---

#### Phase 2.2 — Content Workflow, Media & Inquiry
```
- [ ] status + publishedAt fields added to all content collections
- [ ] Public read query filter: status=published AND publishedAt<=NOW()
- [ ] Preview URL computed field + PREVIEW_TOKEN env var
- [ ] afterChange webhook stub: fires on status→published
- [ ] S3/R2 upload adapter configured (env-switched: local dev, S3 prod)
- [ ] imageSizes defined (thumbnail, card, hero, og)
- [ ] Media tag field + search
- [ ] Media usage tracking hooks
- [ ] inquiries: assignedTo, staffNotes, resolvedAt, status workflow
- [ ] Email notification on new inquiry (Nodemailer / Resend)
- [ ] Bulk resolve + CSV export for inquiries
```
**Output:** Full content and media workflow; inquiry management live.

---

#### Phase 2.3 — Versioning & Audit Trail
```
- [ ] Enable versions: { maxPerDoc: 20, drafts: true } on 7 collections
- [ ] Confirm auto-save on edit in admin
- [ ] Test restore to previous version
- [ ] auditLogs collection (no update/delete access)
- [ ] Global afterChange + afterDelete hooks writing to auditLogs
- [ ] JSON diff utility (compare previous vs new document)
- [ ] Exclude system collections from audit hooks
- [ ] Admin auditLogs view (filter by collection, user, action, date)
- [ ] CSV export route for audit logs
- [ ] 24-month retention cron (runs monthly, deletes records older than cutoff)
- [ ] Orphan media detection cron (weekly)
```
**Output:** Complete version history + audit trail; retention automated.

---

---

## Module 3 — Analytics & KPI Dashboard

### Goal
Embed a custom analytics and KPI dashboard inside the PayloadCMS admin panel. Track Orienda-specific KPIs (calls, appointments, language usage, 360° tour engagement) with a custom event ingestion pipeline, integrate GA4 server-side, and deliver automated management reports.

---

### Scope of Work

#### 3.1 — KPI Definitions & Formulas

All metrics must be precisely defined before implementation:

| KPI | Definition | Formula | Unit |
|-----|------------|---------|------|
| **Call Clicks** | User tapped/clicked a phone number CTA | `COUNT(events WHERE event='call_click')` | count |
| **Appointment Inquiries** | Inquiry form successfully submitted | `COUNT(inquiries WHERE status!='spam')` | count |
| **Tour Sessions** | Unique sessionIds that viewed ≥1 tour scene | `COUNT(DISTINCT sessionId WHERE event='tour_scene_view')` | count |
| **Tour Scene Views** | Total individual scene views | `COUNT(events WHERE event='tour_scene_view')` | count |
| **Avg Scenes per Tour Session** | Engagement depth | `tour_scene_views / tour_sessions` | ratio |
| **Most-viewed Tour Scene** | Scene with highest view count | `scene with MAX(COUNT) WHERE event='tour_scene_view'` | scene# |
| **Language Split (en)** | % of sessions in English locale | `COUNT(DISTINCT sessionId WHERE locale='en') / total_sessions × 100` | % |
| **Language Split (km)** | % of sessions in Khmer locale | `COUNT(DISTINCT sessionId WHERE locale='km') / total_sessions × 100` | % |
| **Doctor Profile Views** | Views per doctor slug | `COUNT(events WHERE event='doctor_view' GROUP BY slug)` | count per doctor |
| **Department Views** | Views per department slug | `COUNT(events WHERE event='department_view' GROUP BY slug)` | count per dept |
| **Page Views** | Total page view events | `COUNT(events WHERE event='page_view')` | count |

**KPI snapshot granularity:** daily (default), weekly rollup, monthly rollup — stored separately in `kpiSnapshots.granularity`.

---

#### 3.2 — Session Tracking Strategy (No Auth)

Since events are submitted by unauthenticated public users:

- **Session ID generation:** frontend generates a `sessionId` as `crypto.randomUUID()` stored in `sessionStorage` (cleared on tab close)
- `sessionId` is included in every event POST
- Backend stores `ipHash` = SHA-256(ip + date-salt) for deduplication — never stores raw IP
- Sessions are **not** tracked across browser sessions (by design — privacy-safe)
- Session lifetime: events within same `sessionId` within 30 minutes counted as one session
- Unique visitor approximation: `COUNT(DISTINCT ipHash per day)` — noted as approximate in dashboard

---

#### 3.3 — Event Ingestion API

**Endpoint:** `POST /api/events`  
**Auth:** None (public)  
**Rate limit:** 60 requests/min per IP  

```typescript
// Request body schema
{
  event: 
    | 'page_view'
    | 'call_click'
    | 'inquiry_submit'
    | 'language_switch'
    | 'tour_scene_view'
    | 'doctor_view'
    | 'department_view',

  payload: {
    slug?:      string,    // page, doctor, or department slug
    locale?:    'en' | 'km',
    scene?:     number,    // 1–15, for tour_scene_view only
    referrer?:  string,    // truncated to 200 chars
    sessionId:  string,    // required; UUID from frontend
    timestamp:  string,    // ISO 8601
  }
}

// Response: 204 No Content (no body on success)
// Error:    400 { error: "validation message" }
//           429 { error: "rate limit exceeded" }
```

**Validation rules:**
- `event` must be one of the enum values
- `sessionId` must be a valid UUID v4
- `scene` must be integer 1–15 (when event = `tour_scene_view`)
- `timestamp` must be valid ISO 8601, not more than 5 minutes in the past or future (clock skew guard)
- All string fields stripped of HTML; max lengths enforced

**Storage:** Written to `analyticsEvents` collection. Server appends `ipHash` and `userAgent` (not accepted from client).

---

#### 3.4 — Analytics Collections (Full Schema)

**`analyticsEvents`** (raw, append-only):
```typescript
{
  event:      string,     // enum
  slug?:      string,
  locale?:    string,
  scene?:     number,
  referrer?:  string,
  sessionId:  string,
  ipHash:     string,     // server-computed
  userAgent:  string,     // server-computed
  timestamp:  Date,
}
```

**`kpiSnapshots`** (aggregated):
```typescript
{
  date:         Date,       // start of period (day/week/month)
  granularity:  'day' | 'week' | 'month',
  metric:       string,     // KPI name enum
  value:        number,
  locale?:      string,     // for locale-split metrics
  breakdown:    JSON,       // e.g. { by_slug: { "dr-john": 42 } }
}
```

**`gaReports`** (GA4 cache):
```typescript
{
  reportType:  'overview' | 'top_pages' | 'devices' | 'geo',
  dateRange:   { startDate: string, endDate: string },
  data:        JSON,        // raw GA4 Data API response
  fetchedAt:   Date,
}
```

---

#### 3.5 — Aggregation Jobs (Cron)

| Job | Schedule | Description |
|-----|----------|-------------|
| `aggregate-daily-kpis` | Every night at 02:00 | Query `analyticsEvents` for yesterday; compute all KPI formulas; write to `kpiSnapshots` (granularity: day) |
| `aggregate-weekly-kpis` | Every Monday at 03:00 | Sum daily snapshots for last 7 days; write weekly snapshot |
| `aggregate-monthly-kpis` | 1st of month at 04:00 | Sum daily snapshots for last calendar month |
| `fetch-ga-reports` | Every day at 05:00 | Pull GA4 overview, top_pages, devices, geo; cache in `gaReports`; TTL 24h |
| `send-weekly-report` | Every Monday at 08:00 | Compose + email HTML KPI report to `siteSettings.analyticsReportRecipients` |
| `retention-cleanup` | 1st of month at 01:00 | Delete `analyticsEvents` older than 12 months; delete `auditLogs` older than 24 months |
| `orphan-media-check` | Every Sunday at 06:00 | Find media files not referenced by any document; log to admin notifications |

**Aggregation SQL example (daily call_clicks):**
```sql
SELECT COUNT(*) AS value
FROM   analytics_events
WHERE  event     = 'call_click'
  AND  timestamp >= CURRENT_DATE - INTERVAL '1 day'
  AND  timestamp <  CURRENT_DATE;
```

---

#### 3.6 — Google Analytics Integration

- **Auth:** GA4 Data API v1, service account JSON key (`GA4_SERVICE_ACCOUNT_KEY`)
- **Reports fetched** (cached in `gaReports`):

| Report Type | Metrics | Dimensions |
|-------------|---------|------------|
| `overview` | sessions, pageViews, bounceRate, avgSessionDuration | date |
| `top_pages` | pageViews, avgTimeOnPage | pagePath, pageTitle |
| `devices` | sessions | deviceCategory |
| `geo` | sessions | country, city |

- Cache refresh: nightly cron (see 3.5)
- Manual refresh: button in admin dashboard → calls internal `POST /api/admin/refresh-ga`
- If GA4 API is unavailable: show last cached data with a "last updated" timestamp; do not break dashboard

---

#### 3.7 — Analytics Dashboard UI (Custom Admin View)

**Route:** `/admin/analytics`  
**Access:** Admin only  
**Tech:** React component registered as PayloadCMS custom view; Recharts for charts  

```
┌──────────────────────────────────────────────────────────────┐
│  Analytics & KPI Dashboard          [Date Range ▼] [Export] │
├──────────────────────────────────────────────────────────────┤
│  KPI OVERVIEW CARDS                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Calls   │ │  Inquir. │ │Tour Sess.│ │ Sessions │       │
│  │   142  ↑ │ │   38   → │ │  521   ↑ │ │  4,820 ↑ │       │
│  │ +12% 7d  │ │  =0% 7d  │ │ +8% 7d  │ │ +21% 7d  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├──────────────────────────────────────────────────────────────┤
│  TREND CHARTS (Line — selected date range)                   │
│  [Calls over time] [Inquiries over time] [Tour sessions]     │
├──────────────────────────────────────────────────────────────┤
│  LANGUAGE USAGE                TOUR SCENE HEATMAP            │
│  [Pie: en 68% / km 32%]        [Bar: scenes 1–15 view count] │
│  [Bar: CMS edits by locale]    [Avg scenes/session: 4.2]     │
├──────────────────────────────────────────────────────────────┤
│  CONTENT PERFORMANCE                                         │
│  Top Doctors │ Top Departments │ Top Pages (from GA4)        │
│  [sortable table with view counts and % of total]           │
├──────────────────────────────────────────────────────────────┤
│  GOOGLE ANALYTICS (cached)      Last updated: today 05:01   │
│  Sessions / Bounce Rate / Avg duration │ Device breakdown   │
└──────────────────────────────────────────────────────────────┘
```

**Date range controls:** Today / Last 7 days / Last 30 days / Custom (date picker)  
**% change indicators:** compare current period to prior equal-length period  
**Export button:** triggers `GET /api/analytics/export` → downloads CSV  

---

#### 3.8 — CSV Export Format

```
date, metric, value, locale, breakdown
2026-05-01, call_clicks, 12, en, {}
2026-05-01, inquiry_submits, 3, all, {}
2026-05-01, tour_scene_views, 84, all, "{""scene_1"":12,""scene_2"":9,...}"
2026-05-01, language_split, 68, en, {}
2026-05-01, language_split, 32, km, {}
...
```

---

#### 3.9 — Weekly Email Report Format

**Subject:** `Orienda Weekly KPI Report — Week of {date}`  
**Recipients:** `siteSettings.analyticsReportRecipients` (admin-managed list)  
**Sections:**
1. KPI summary table (all metrics, current week vs prior week, % change)
2. Top 5 doctors by profile views
3. Top 5 departments by views
4. Language split (en vs km %)
5. Tour engagement (sessions, avg scenes viewed, most-viewed scene)
6. Link to full dashboard: `{PAYLOAD_PUBLIC_SERVER_URL}/admin/analytics`

---

### Deliverables

| # | Deliverable | Acceptance Criteria |
|---|-------------|---------------------|
| D3.1 | Event ingestion API | Events POST, validate, store; rate limiting enforced; returns 204 |
| D3.2 | KPI formulas implemented | All 11 KPIs compute correctly against test dataset |
| D3.3 | Aggregation crons running | Daily snapshots populate `kpiSnapshots`; verified in admin |
| D3.4 | GA4 integration live | GA data in `gaReports`; visible in dashboard; refreshes nightly |
| D3.5 | Analytics dashboard in admin | All 5 sections render live data; date filter works; admin-only |
| D3.6 | CSV export | Filtered export downloads correct data in spec'd format |
| D3.7 | Weekly email report | Email delivered Monday 08:00; content matches dashboard data |
| D3.8 | Data retention | 12-month event cleanup and 24-month audit cleanup run on schedule |
| D3.9 | Analytics documentation | KPI glossary, formula reference, cron schedule, dashboard guide |

---

### Phase Breakdown

#### Phase 3.1 — Event Ingestion & Collections
```
- [ ] analyticsEvents collection with all fields (ipHash server-computed)
- [ ] kpiSnapshots collection
- [ ] gaReports collection
- [ ] POST /api/events: validation, rate limiting, ipHash computation, storage
- [ ] Session ID UUID validation
- [ ] Timestamp clock-skew guard (±5 min)
- [ ] Unit tests for validation edge cases
```
**Output:** Events ingesting and stored; validation rejecting bad payloads.

---

#### Phase 3.2 — Aggregation Jobs
```
- [ ] node-cron setup with all 7 job schedules
- [ ] Daily KPI aggregation: implement all 11 KPI SQL queries
- [ ] Weekly + monthly rollup jobs
- [ ] kpiSnapshots write with correct granularity + breakdown JSON
- [ ] Test: seed 30 days of fake events; verify snapshots match manual count
- [ ] Retention cleanup cron (12 months events, 24 months audit)
- [ ] Orphan media detection cron
```
**Output:** Automated daily KPI snapshots; retention running on schedule.

---

#### Phase 3.3 — GA4 Integration
```
- [ ] GA4 Data API service account setup + key stored as env var
- [ ] Node.js GA4 client (google-analytics-data npm package)
- [ ] Fetch all 4 report types; store in gaReports
- [ ] Nightly fetch cron (05:00)
- [ ] Manual refresh internal route
- [ ] Graceful degradation if GA4 unavailable (serve cached + show timestamp)
```
**Output:** GA4 data cached in CMS; available for dashboard.

---

#### Phase 3.4 — Analytics Dashboard View
```
- [ ] Register /admin/analytics custom view in PayloadCMS config
- [ ] Admin-only access guard
- [ ] KPI overview cards (11 KPIs with % change vs prior period)
- [ ] Line charts: calls, inquiries, tour sessions (Recharts LineChart)
- [ ] Pie chart: language usage en vs km
- [ ] Bar chart: tour scene heatmap (scenes 1–15)
- [ ] Content performance tables (top doctors, depts, pages)
- [ ] GA4 section (overview metrics + device breakdown)
- [ ] Date range filter + period comparison logic
- [ ] Loading states + error states for each section
```
**Output:** Full interactive dashboard inside PayloadCMS admin.

---

#### Phase 3.5 — Export & Email Reports
```
- [ ] GET /api/analytics/export — CSV generation with date + metric filters
- [ ] Export button in dashboard UI
- [ ] Weekly email HTML template (inline CSS for email clients)
- [ ] send-weekly-report cron job
- [ ] Admin config: recipient list in siteSettings global
- [ ] Test email delivery (staging environment)
- [ ] Analytics documentation (KPI glossary, formulas, cron schedule)
```
**Output:** Automated weekly reports; manual CSV export; full documentation.

---

---

## Cross-Cutting Concerns

### Error Handling & Structured Logging

- **Logger:** `pino` (JSON structured logs)
- **Log levels:** `error`, `warn`, `info`, `debug` (controlled by `LOG_LEVEL` env var)
- **Every request logged:** method, path, status, duration (ms), userId if authenticated
- **Every error logged:** error message, stack trace, request context, userId
- **Cron jobs:** log start, completion, duration, and row counts on every run
- **Error response format (all API errors):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "fields": { "email": "Invalid email format" }
  }
}
```
- **Error codes defined:**

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Request body fails validation |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Token valid but insufficient role |
| `NOT_FOUND` | 404 | Document does not exist |
| `RATE_LIMITED` | 429 | Too many requests from this IP |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

### Security

| Area | Measure |
|------|---------|
| Auth | JWT (15-min access token) + httpOnly refresh cookie (7-day) |
| Transport | HTTPS enforced (HSTS header via helmet); HTTP → HTTPS redirect |
| Input | All POST body sanitized (DOMPurify server-side for rich text); max body size 1 MB |
| SQL | PayloadCMS ORM parameterizes all queries — no raw SQL interpolation |
| Webhooks | HMAC-SHA256 signature on all outbound webhooks; verified by receiver |
| Media upload | File type validated by MIME sniffing (not extension); virus scan optional (ClamAV) |
| Secrets | All secrets in env vars; never committed; rotated on deploy |
| Rate limiting | Global: 200 req/min; public POST routes: 5–60/min per IP |
| CORS | Allowlist only: frontend origin + admin origin |

---

### Environment Strategy

| Environment | Purpose | DB | Media | Email |
|-------------|---------|-----|-------|-------|
| `development` | Local dev | Local PostgreSQL | Local disk (`/uploads`) | Log to console (no send) |
| `staging` | Pre-prod testing | Dedicated PG instance | S3 staging bucket | Deliver to test inboxes |
| `production` | Live system | Managed PG (e.g. Supabase, RDS) | S3/R2 production bucket | Real SMTP / Resend |

- Promotion path: `development → staging → production` (no direct dev → prod)
- Staging mirrors production config; used for client UAT sign-off before each release
- DB migrations run automatically on deploy (`payload migrate`)

---

### Testing Strategy

| Layer | Tool | What to Test |
|-------|------|-------------|
| Unit | Vitest | KPI aggregation formulas, validation functions, slug generation, diff utility |
| Integration | Vitest + supertest | All API routes (auth, CRUD, custom); RBAC access matrix; event ingestion |
| E2E (API) | Postman / Newman | Full collection run in CI against staging DB |
| Manual | Test matrix doc | RBAC role × action; locale switching; version restore; scheduled publish |

- CI runs unit + integration tests on every PR
- E2E Postman collection runs on staging after every deploy
- Minimum coverage target: 80% on business logic (aggregation, validation, access functions)

---

### CI/CD & Deployment

```
Git push → GitHub Actions CI
  ├── Lint (ESLint + TypeScript check)
  ├── Unit tests (Vitest)
  ├── Integration tests (Vitest + supertest)
  └── Build check (tsc --noEmit)

Merge to main → Deploy to staging
  ├── Docker build
  ├── Push to container registry
  ├── Deploy to staging (Docker Compose or managed container)
  ├── Run DB migrations (payload migrate)
  └── Run Postman E2E collection

Manual promote → Deploy to production
  ├── Same Docker image (no rebuild)
  ├── Run DB migrations
  └── Health check → smoke test
```

**Docker setup:**
- Single `Dockerfile` (multi-stage: build → production)
- `docker-compose.yml` for local dev (app + PostgreSQL + pgAdmin)
- Container: Node 20 Alpine base; non-root user; read-only filesystem except `/uploads` (dev)

---

### Data Retention Policy

| Data | Retention | Deletion Method |
|------|-----------|----------------|
| `analyticsEvents` (raw) | 12 months | Monthly cron deletes records where `timestamp < NOW() - 12 months` |
| `kpiSnapshots` | 36 months | Monthly cron |
| `gaReports` | 90 days | Monthly cron |
| `auditLogs` | 24 months | Monthly cron |
| Content versions | 20 per document | PayloadCMS enforces automatically on save |
| Soft-deleted content | 90 days | Monthly cron hard-deletes archived docs older than 90 days |
| Media (orphaned) | Flag on detection | Admin manually confirms deletion after weekly orphan report |

---

### Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GA4 API quota exceeded | Low | Medium | Cache aggressively (24h); exponential backoff on retry |
| PostgreSQL disk growth from raw events | Medium | High | 12-month retention cron; monitor DB size in staging |
| Cron jobs silently fail | Medium | Medium | Log start/end of every cron; admin notification on 3 consecutive failures |
| PayloadCMS upgrade breaking changes | Low | Medium | Pin exact version; test upgrades in staging before production |
| S3/R2 unavailable (media uploads fail) | Low | High | Graceful error in admin; uploads queued if BullMQ configured |
| Khmer (km) content untranslated | High | Medium | Translation completeness view alerts editors; en fallback prevents blank pages |
| Event ingestion abuse (spam events) | Medium | Medium | IP rate limiting; ipHash deduplication; anomaly detection in aggregation |

---

---

## Implementation Sequence

```
Week 1   │ Phase 1.1  Bootstrap, DB, health check
         │ Phase 1.2  All 16 collections + seed data
         │
Week 2   │ Phase 1.3  Localization + Globals
         │ Phase 2.1  RBAC + access functions
         │
Week 3   │ Phase 1.4  API hardening + custom routes + docs
         │ Phase 2.2  Content workflow + media + inquiry workflow
         │
Week 4   │ Phase 2.3  Versioning + audit trail + retention crons
         │ Phase 3.1  Event ingestion API + analytics collections
         │
Week 5   │ Phase 3.2  KPI aggregation jobs + cron setup
         │ Phase 3.3  GA4 integration
         │
Week 6   │ Phase 3.4  Analytics dashboard view (React + Recharts)
         │ Phase 3.5  CSV export + weekly email report
         │
Week 7   │ Full integration QA (RBAC matrix, locale, KPI, reports)
         │ Staging deploy → client UAT
         │
Week 8   │ UAT fixes
         │ Production deploy
         │ Documentation handoff
```

**Phase dependencies:**
- Phase 2.1 requires Phase 1.2 (collections must exist before access functions)
- Phase 3.1 requires Phase 1.4 (needs `/api/events` route infrastructure)
- Phase 3.2 requires Phase 3.1 (snapshots aggregate from raw events)
- Phase 3.4 requires Phase 3.2 + 3.3 (dashboard reads snapshots and GA cache)
- Phase 3.5 requires Phase 3.4 (export and email pull from same data sources)

---

## Technology Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| CMS engine | **PayloadCMS 3.x** | TypeScript-native, self-hosted, built-in i18n + versioning + access control |
| Runtime | **Node.js v20 LTS** | LTS stability; PayloadCMS requirement |
| Database | **PostgreSQL 16** | Relational content + analytics queries; better than MongoDB for KPI aggregation |
| File storage | **Cloudflare R2** (or AWS S3) | S3-compatible, cost-effective, global CDN |
| Analytics charts | **Recharts** | React-native; embeds cleanly in PayloadCMS custom admin views |
| GA integration | **google-analytics-data** npm | Official GA4 Data API SDK; server-side only |
| Email | **Resend** (or Nodemailer + SMTP) | Reliable transactional email; HTML template support |
| Job scheduling | **node-cron** | Lightweight; sufficient for 7 scheduled jobs |
| Logging | **pino** | Fast JSON structured logging |
| Testing | **Vitest + supertest** | Fast; TypeScript-native |
| Containerization | **Docker + Docker Compose** | Consistent environments; easy staging/prod parity |
| CI/CD | **GitHub Actions** | Lint, test, build, deploy pipeline |

---

## Out of Scope

- Frontend / website implementation
- Mobile application
- Public user login / patient portal
- Online appointment booking or payment
- Third-party EHR / hospital system integration
- Real-time analytics (WebSocket / streaming) — batch aggregation is sufficient

---

## Acceptance Criteria — System Level

| Area | Done When |
|------|-----------|
| **Backend** | All 16 collections live; API documented + tested; health check green |
| **Localization** | en + km content independently editable; fallback works; completeness tracked |
| **RBAC** | Full test matrix passes; unauthorized actions blocked at API and UI |
| **Media** | S3 uploads working; 4 image sizes generated; CDN URLs correct |
| **Versioning** | 20-version history; restore functional; diff visible |
| **Audit** | Every write action logged; CSV export; retention cron running |
| **Analytics** | Events ingesting; 11 KPIs computing; snapshots populated daily |
| **Dashboard** | All 5 sections render live data; date filter + % change working |
| **Reporting** | Weekly email delivered Monday 08:00; CSV export correct |
| **CI/CD** | Tests pass on every PR; staging auto-deploys on merge to main |
| **Docs** | API spec, RBAC matrix, KPI glossary, staff guide, deployment runbook all delivered |