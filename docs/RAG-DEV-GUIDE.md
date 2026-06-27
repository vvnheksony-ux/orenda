# RAG Dev Guide — Orienda AI Chat

> Last updated: 2026-06-27
> Branch: `pheaktra-supabase` (merged from `rag2-fei`)

---

## What is RAG?

RAG = Retrieval-Augmented Generation.

GPT knows nothing about Orienda. So instead of asking it directly, we:
1. Store Orienda's content as vectors (embeddings) in Supabase
2. When a user asks something → find the most relevant stored content
3. Feed that content to GPT as context → GPT answers using real Orienda data

---

## System Overview

```
User (chat widget)
     │
     ▼
n8n Webhook  ←── frontend sends user message here
     │
     ▼
POST /api/rag2  ←── n8n calls this (or frontend can call directly)
     │
     ├── detect intent (which doc_type)
     ├── embed message (text-embedding-3-small)
     ├── vector search → ai_rag2_documents
     └── GPT-4.1-mini → reply → save to session history
```

**Where content comes from (3 paths):**

| Path | How | Doc types |
|---|---|---|
| Payload CMS auto | Publish record → webhook → `/api/rag2/ingest` | doctors, departments, branches, service-packages, news, health-tips, careers, doctor-talks, promotions, faqs |
| Admin: Static Docs | Admin panel → type/paste/upload → Save & Embed | about, contact, policy, brand |
| Admin: Upload File | Admin panel → upload PDF/DOCX/TXT | other |
| Admin: Price Lists | Admin panel → import Excel/CSV | price |

---

## Database Tables

### `public.ai_rag2_documents` — all embeddings live here
| Column | Type | Notes |
|---|---|---|
| id | bigint | PK auto |
| source_id | text | Payload record ID (as string) or upload UUID |
| source_collection | text | doc_type — see list below |
| locale | text | `en` / `km` / `zh` |
| content | text | text that was embedded |
| metadata | jsonb | doc_type, title, filename, chunk_index, etc. |
| embedding | vector(1536) | from text-embedding-3-small |

**All doc_type values used in `source_collection`:**
```
doctors          → Payload: doctors collection
departments      → Payload: departments collection
branches         → Payload: branches collection
service-packages → Payload: service-packages collection
news             → Payload: news collection
health-tips      → Payload: health-tips collection
careers          → Payload: careers collection
doctor-talks     → Payload: doctor-talks collection
promotions       → Payload: promotions collection
faqs             → Payload: faqs collection
about            → Admin: Static Docs
contact          → Admin: Static Docs
policy           → Admin: Static Docs
brand            → Admin: Static Docs
other            → Admin: Upload File (misc PDFs)
price            → Admin: Price Lists
```

### `public.ai_rag2_uploads` — tracks uploaded files
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| filename | text | original filename |
| title | text | user-provided title |
| description | text | user-provided description (used as content if scanned PDF) |
| url | text | Supabase Storage public URL |
| doc_type | text | always `other` currently |
| size_bytes | bigint | |
| status | text | `pending` / `embedded` / `error` |
| error | text | error reason if status=error |
| created_at | timestamptz | |

### `public.ai_static_docs` — static doc content
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| doc_type | text | `about` / `contact` / `policy` / `brand` |
| locale | text | `en` / `km` / `zh` |
| content | text | full text content |
| updated_at | timestamptz | |

Unique constraint on `(doc_type, locale)`.

### `public.ai_chat_sessions` + `public.ai_chat_messages`
Stores conversation history. Loaded per `session_key` + `user_id`.

### `public.price_lists`
Price list rows imported from Excel. Embedded into `ai_rag2_documents` with `source_collection = 'price'`.

### `public.ai_orienda_documents` — RAG1 (old, do not delete)
Legacy RAG1 table. 270 chunks from static markdown files. Still used if you want to fall back to RAG1 endpoint.

---

## Supabase Storage

**Bucket:** `ai-docs` (PUBLIC)

```
ai-docs/
└── other/
    └── {uuid}/
        └── {sanitized-filename}
```

**Required policies (run once in Supabase SQL editor):**
```sql
-- Already done. If missing, run this:
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'ai-docs') WITH CHECK (bucket_id = 'ai-docs');

CREATE POLICY "Public read ai-docs"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'ai-docs');
```

Bucket must be set to **Public** in Supabase Dashboard → Storage → ai-docs → Edit bucket.

---

## API Endpoints

### `POST /api/rag2` — chat (called by n8n or frontend directly)
```json
// Request body:
{
  "message": "What doctors do you have?",
  "session_key": "abc123",
  "locale": "en",
  "user_id": "uuid-or-null"
}

// Response:
{ "output": "Orienda has Dr. Sok Vanna specializing in..." }
```

Flow:
1. Validate input (spam, bad words)
2. Detect locale (en/km/zh)
3. If greeting → return immediately
4. Detect intent → map to `source_collection`
5. Embed message with `text-embedding-3-small`
6. Vector search `ai_rag2_documents` filtered by `source_collection + locale`
7. If km/zh results < 3 → fallback to en results
8. Build prompt with context → GPT-4.1-mini → reply
9. Save message + reply to `ai_chat_sessions` / `ai_chat_messages`

---

### `POST /api/rag2/ingest` — Payload CMS webhook
Called automatically when admin publishes or deletes a Payload record.

```json
// Payload webhook sends:
{
  "collection": "doctors",
  "id": 42,
  "operation": "publish"   // or "delete"
}

// Verified by HMAC-SHA256 using WEBHOOK_SECRET env var
```

Flow:
1. Verify HMAC signature
2. If delete → remove all rows from `ai_rag2_documents` where `source_id = id`
3. If publish → format record text (SQL query on `payload.*` schema) → embed all 3 locales → upsert

**Supported collections:**
`doctors`, `departments`, `branches`, `service-packages`, `news`, `health-tips`, `careers`, `doctor-talks`, `promotions`, `faqs`

---

### `POST /api/admin/ai-upload` — Upload File page
Requires admin session. Uploads file, extracts text, embeds, stores.

```bash
# From admin panel (done via browser UI)
# Or programmatically:
curl -X POST https://your-domain/api/admin/ai-upload \
  -b "payload-token=YOUR_SESSION_COOKIE" \
  -F "file=@document.pdf" \
  -F "title=My Document" \
  -F "description=Optional description"
```

- Sanitizes filename (spaces → underscores)
- Uploads file to `ai-docs` Supabase Storage bucket
- Extracts text: PDF via `pdf-parse`, DOCX via `mammoth`, TXT/MD as UTF-8
- If no text (scanned PDF) + description provided → embeds description as content
- If no text + no description → returns error asking user to add description
- Chunks text → embeds each chunk → inserts to `ai_rag2_documents` with `source_collection = 'other'`
- Records tracked in `ai_rag2_uploads`

**Delete:** `DELETE /api/admin/ai-upload/{id}`
Deletes: embeddings in `ai_rag2_documents` + upload record + file from Supabase Storage.

---

### `PUT /api/admin/ai-static-docs` — Static Docs page
```json
// Request:
{ "doc_type": "about", "locale": "en", "content": "Orienda Hospital was founded..." }

// Response:
{ "doc": { id, doc_type, locale, content, updated_at }, "embedded": true }
```

- Upserts content into `ai_static_docs` (one row per doc_type+locale)
- Deletes old embeddings from `ai_rag2_documents` first
- If content is non-empty → creates new embedding
- If content is empty → clears embedding only (AI will no longer have this doc)
- `embedded: false` means content was cleared

---

### `POST /api/admin/ai-static-docs/extract` — extract text from file (no embed)
Used by the "Append from file" button. Extracts text only, returns it to the browser.
Text is then appended to the textarea for user to review before saving.

```json
// Response:
{ "text": "extracted text content...", "filename": "document.pdf" }
```

---

### `POST /api/admin/ai-price-lists` — Price Lists page
Creates a price list entry and embeds it.

`POST /api/admin/ai-price-lists/import` — bulk import from Excel/CSV file.

`GET /api/admin/ai-price-lists/template` — download blank Excel template.

---

## Admin Panel — How to Use

### Upload File (misc documents)
1. Admin → AI Chat Bot → Upload File
2. Click upload area or drag file (PDF, DOCX, DOC, TXT, MD — max 10MB)
3. Fill **Title** (auto-filled from filename — edit if needed)
4. Fill **Description** (optional for text-based files, **required** for scanned PDFs — AI uses description as searchable content if no text can be extracted)
5. Click **Upload & Embed**
6. Status shows: `embedded` (green) or `error` (red with reason)
7. Click document title to preview file inline

**Scanned PDF flow:** If PDF has no selectable text (image-based), the system falls back to the description you typed. AI can find the document by description but cannot read its contents.

**Delete:** trash icon on each row → confirms → deletes file from storage + all embeddings.

---

### Static Docs (about / contact / policy / brand)
1. Admin → AI Chat Bot → Static Docs
2. Select locale from top-right dropdown (English / Khmer / Chinese)
3. Select tab: **About**, **Contact**, **Policy**, or **Brand**
4. Two ways to add content:
   - **Type/paste** directly into the textarea (click Edit if viewing)
   - **"Append from file"** button → upload file → text is extracted and appended to existing content
5. Review content in textarea
6. Click **Save & Embed**

Each doc_type+locale combination is stored and embedded separately.
Clearing all content and saving → removes embedding → AI no longer uses it.

---

### Price Lists
1. Admin → AI Chat Bot → Price Lists
2. Download template via "Download Template" button
3. Fill price data in Excel
4. Upload via import button

---

## Environment Variables

```bash
# Required in .env (or Vercel env):
OPENAI_API_KEY=sk-proj-...              # OpenAI embedding + chat
DATABASE_URL=postgresql://...           # Payload CMS postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # Client (read-only)
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # Server-only (write to ai_* tables)
WEBHOOK_SECRET=...                      # Payload webhook HMAC secret
RAG2_INGEST_URL=https://your-domain/api/rag2/ingest
RAG2_UPLOAD_SECRET=orienda-upload-2026 # protects legacy /api/rag2/upload
```

---

## File Structure

```
src/
├── lib/
│   ├── rag2/
│   │   ├── chunk-text.ts           split text into 1000-char chunks (200 overlap)
│   │   ├── verify-webhook.ts       HMAC-SHA256 signature check
│   │   ├── detect-intent.ts        user message keywords → source_collection
│   │   ├── ingest-record.ts        fetch Payload record → format → embed → upsert
│   │   ├── vector-search.ts        embed query + search ai_rag2_documents (locale fallback)
│   │   └── format/
│   │       ├── format-doctor.ts
│   │       ├── format-faq.ts
│   │       ├── format-department.ts
│   │       ├── format-branch.ts
│   │       ├── format-service-package.ts
│   │       ├── format-news.ts
│   │       ├── format-health-tip.ts
│   │       ├── format-career.ts
│   │       ├── format-doctor-talk.ts
│   │       ├── format-promotion.ts
│   │       └── index.ts            maps collection name → formatter
│   └── rag1/                       legacy — RAG1 system
└── app/api/
    ├── rag2/
    │   ├── route.ts                POST /api/rag2 — main chat endpoint
    │   ├── ingest/route.ts         POST /api/rag2/ingest — Payload webhook receiver
    │   └── upload/route.ts         POST /api/rag2/upload — legacy CLI upload (secret-protected)
    └── admin/
        ├── ai-upload/
        │   ├── route.ts            GET list / POST upload file
        │   └── [id]/route.ts       DELETE upload + storage + embeddings
        ├── ai-static-docs/
        │   ├── route.ts            GET all / PUT save+embed
        │   └── extract/route.ts    POST extract text from file (no embed)
        ├── ai-price-lists/
        │   ├── route.ts            GET / POST price entry
        │   ├── [id]/route.ts       PUT / DELETE
        │   ├── import/route.ts     POST bulk import from Excel
        │   └── template/route.ts   GET blank Excel template
        └── ai-documents/
            ├── route.ts            GET all rag2 documents (debug view)
            └── [id]/route.ts       DELETE single embedding
```

---

## n8n Workflow Integration

The frontend chat widget sends to an **n8n webhook URL**. n8n then calls `POST /api/rag2` internally.

```
User chat widget
      │  POST {message, session_key, locale, user_id}
      ▼
n8n webhook  (configured in n8n instance)
      │
      ├── Get session history from Supabase (ai_chat_sessions + ai_chat_messages)
      │
      └── POST /api/rag2
              │  {message, session_key, locale, user_id}
              ▼
         RAG response → back to n8n → back to user
```

**To bypass n8n and call RAG directly** (e.g. from a new frontend):
```js
const res = await fetch('https://your-domain/api/rag2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    session_key: 'unique-session-id',  // any string, identifies conversation
    locale: 'en',                       // 'en' | 'km' | 'zh'
    user_id: null                       // or user's UUID if logged in
  })
})
const { output } = await res.json()
```

---

## Supabase RPC Functions

### `match_ai_rag2_documents`
Used by `/api/rag2` vector search.

```sql
SELECT match_ai_rag2_documents(
  query_embedding := '[0.1, 0.2, ...]'::vector,
  match_count     := 5,
  filter          := '{"source_collection": "doctors", "locale": "en"}'::jsonb
);
```

Returns rows ordered by cosine similarity. The RAG2 vector search calls this with `locale = user_locale` first, then fallback to `locale = 'en'` if results < 3.

### `match_ai_orienda_documents`
RAG1 only. Same signature.

---

## How to Seed Data (first time setup / after data loss)

### Step 1 — Static Docs (about, contact, policy, brand)
Go to Admin → AI Chat Bot → Static Docs → type/upload content for each tab in each locale → Save & Embed.

### Step 2 — Payload CMS collections
The fastest way to embed all existing Payload data:
- Go to each collection in admin (Doctors, Departments, FAQs, etc.)
- Bulk re-publish all records (Payload fires webhook per record → auto-embeds)
- OR trigger ingest manually via curl:

```bash
# Re-embed a single record:
curl -X POST https://your-domain/api/rag2/ingest \
  -H "Content-Type: application/json" \
  -H "x-payload-webhook-secret: YOUR_WEBHOOK_SECRET" \
  -d '{"collection": "doctors", "id": 1, "operation": "publish"}'
```

### Step 3 — Price Lists
Upload via Admin → AI Chat Bot → Price Lists → Import.

### Step 4 — Upload File (misc docs)
Upload via Admin → AI Chat Bot → Upload File.

---

## Current Status (as of 2026-06-27)

| Feature | Status |
|---|---|
| `/api/rag2` chat endpoint | ✅ Working |
| Payload webhook → auto-ingest | ✅ Working |
| Admin: Upload File | ✅ Working (storage, embed, delete, preview) |
| Admin: Static Docs | ✅ Working (all 4 types, all 3 locales, file append) |
| Admin: Price Lists | ✅ Working |
| Supabase Storage `ai-docs` bucket | ✅ Created, public |
| Storage RLS policies | ✅ Applied |
| Sidebar toggle / UI fixes | ✅ Done |
| `ai_rag2_uploads` title/description/error columns | ⚠️ Run migration if not done |
| n8n → /api/rag2 connected | ✅ Connected |
| Frontend switches from n8n to direct `/api/rag2` | ⬜ Optional future step |
| RAG1 (`/api/rag1`) | ✅ Working (legacy, 270 chunks) |

---

## Pending Migration

If the `ai_rag2_uploads` table is missing `title`, `description`, `error` columns, run:

```sql
-- supabase/migrations/add_upload_title_description.sql
ALTER TABLE public.ai_rag2_uploads
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS error text;
```

---

## Adding a New Doc Type

1. Add keyword patterns in `src/lib/rag2/detect-intent.ts`
2. Create formatter in `src/lib/rag2/format/format-{type}.ts`
3. Register in `src/lib/rag2/format/index.ts`
4. Add Payload webhook handler support in `src/lib/rag2/ingest-record.ts`
5. Add to `source_collection` type union in `detect-intent.ts`

---

## Common Issues

| Problem | Cause | Fix |
|---|---|---|
| `Bucket not found` | Storage bucket not public / not created | Dashboard → Storage → ai-docs → Edit → toggle Public ON |
| `Could not extract text` | Scanned/image PDF | Add description → re-upload; description embeds as content |
| Webhook not triggering | `RAG2_INGEST_URL` wrong in env | Set to `https://your-domain/api/rag2/ingest` |
| Empty search results | Data not seeded yet | Bulk re-publish Payload records or upload static docs |
| Toggle shows over modal | z-index issue (fixed) | CSS `:has()` rules hide it — see OriendaAdminStyle.tsx |
