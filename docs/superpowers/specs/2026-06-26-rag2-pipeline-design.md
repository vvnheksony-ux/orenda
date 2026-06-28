# RAG2 Pipeline Design

**Date:** 2026-06-26
**Branch:** rag2-fei

---

## Goal

Replace static markdown embeddings (RAG1) with a live, admin-driven RAG pipeline. Content published in Payload CMS auto-embeds into Supabase. Uploaded files (PDFs, price lists) also embed. RAG2 chat endpoint searches this live data with locale-awareness.

---

## Architecture

```
[Payload Admin publish/delete]
        │ HTTP POST (existing contentWebhooks.ts)
        ▼
POST /api/rag2/ingest          ← verify sig, fetch payload.* schema, embed, upsert
        │
        ▼
public.ai_rag2_documents       ← pgvector table, locale-aware

[Admin file upload]
        │ multipart/form-data
        ▼
POST /api/rag2/upload          ← store file → Supabase Storage, extract text, embed
        │
        ▼
public.ai_rag2_uploads  +  public.ai_rag2_documents

[Frontend chat]
        │ POST { message, session_key, locale, user_id }
        ▼
POST /api/rag2                 ← same pipeline as RAG1, searches ai_rag2_documents
        │
        ▼
{ output: string }
```

**Key principle:** Zero changes to Payload CMS code. Payload already fires webhooks on publish/delete via `contentWebhooks.ts`. We register our ingest URL in Payload admin → Operational Settings → webhookTargets.

---

## Database

### `public.ai_rag2_documents` (already created)

```sql
CREATE TABLE public.ai_rag2_documents (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id         UUID NOT NULL,         -- Payload record ID or upload UUID
  source_collection TEXT NOT NULL,         -- 'doctors', 'faqs', 'price', etc.
  locale            TEXT NOT NULL,         -- 'en', 'km', 'zh'
  content           TEXT NOT NULL,         -- formatted text fed to embedder
  metadata          JSONB NOT NULL DEFAULT '{}',
  embedding         VECTOR(1536),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes (already created)
-- ivfflat on embedding, (source_id), (source_collection, locale)
```

### `public.ai_rag2_uploads` (already created)

```sql
CREATE TABLE public.ai_rag2_uploads (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename   TEXT NOT NULL,
  url        TEXT NOT NULL,               -- Supabase Storage URL
  doc_type   TEXT NOT NULL,               -- e.g. 'price', 'policy'
  size_bytes BIGINT,
  status     TEXT DEFAULT 'pending',      -- 'pending' | 'embedded' | 'error'
  error      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RPC `match_ai_rag2_documents` (already created)

Filters by `metadata @> filter` — supports `{ source_collection, locale }` filters.

### Locale lifecycle

- **Publish** → delete WHERE `source_id = docId` → re-embed all locales → insert
- **Delete** → delete WHERE `source_id = docId`
- **Locale fallback rule:** if locale `km`/`zh` content is empty in Payload, embed the `en` content tagged with that locale — ensures search always has a result
- **Doctor count:** `SELECT COUNT(DISTINCT source_id) FROM ai_rag2_documents WHERE source_collection = 'doctors'`

---

## Section 1: Webhook Ingest (`POST /api/rag2/ingest`)

### Trigger

Payload fires on every publish/delete. Payload webhook body:
```json
{ "event": "published", "collection": "doctors", "docId": "uuid-...", "locale": "en", "slug": "...", "timestamp": "..." }
```
Header: `X-Payload-Signature: <hmac-sha256>`

### Security

Verify HMAC-SHA256: `crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex')` must match `X-Payload-Signature`. Return 401 if mismatch.

### Collections handled

| Webhook `collection` | Payload table | `source_collection` in metadata |
|---|---|---|
| `doctors` | `payload.doctors` + `payload.doctors_locales` | `doctors` |
| `departments` | `payload.departments` + `payload.departments_locales` | `departments` |
| `branches` | `payload.branches` + `payload.branches_locales` | `branches` |
| `service-packages` | `payload.service_packages` + `payload.service_packages_locales` | `service_packages` |
| `news` | `payload.news` + `payload.news_locales` | `news` |
| `health-tips` | `payload.health_tips` + `payload.health_tips_locales` | `health_tips` |
| `careers` | `payload.careers` + `payload.careers_locales` | `careers` |
| `doctor-talks` | `payload.doctor_talks` | `doctor_talks` |
| `promotions` | `payload.promotions` + `payload.promotions_locales` | `promotions` |
| `faqs` | `payload.faqs` + `payload.faqs_locales` | `faqs` |

Unknown collections → return 200 (ignore silently).

### Ingest flow (published)

```
1. Verify signature
2. DELETE FROM ai_rag2_documents WHERE source_id = docId
3. For each locale in ['en', 'km', 'zh']:
   a. Query payload schema via getRawPool() — JOIN main table + _locales WHERE _locale = locale
   b. Format record to structured text string
   c. If text empty AND locale != 'en': use en-formatted text as fallback
   d. If text still empty: skip this locale
   e. embed(text) → insert row (source_id, source_collection, locale, content, metadata, embedding)
4. Return 200
```

### Ingest flow (deleted)

```
1. Verify signature
2. DELETE FROM ai_rag2_documents WHERE source_id = docId
3. Return 200
```

### Query pattern (follows existing /api/doctors pattern)

```ts
const pool = getRawPool()
// For localized collections:
const { rows } = await pool.query(`
  SELECT doc.*, COALESCE(dl.<field>, en_dl.<field>) AS <field>
  FROM payload.<table> doc
  LEFT JOIN payload.<table>_locales dl   ON dl._parent_id = doc.id AND dl._locale = $2
  LEFT JOIN payload.<table>_locales en_dl ON en_dl._parent_id = doc.id AND en_dl._locale = 'en'
  WHERE doc.id = $1 AND doc._status = 'published'
`, [docId, locale])
```

### Text formatters (one file per collection)

Each formatter returns a plain text string optimized for embedding. All fields joined with newlines. Rich text converted via `lexicalToText()`. Empty fields omitted.

**Doctor format:**
```
Doctor: {name}
Specialty: {specialty}
Department: {department_name}
Bio: {bio}
Doctor Number: {doctorNumber}
Phone: {phone} | Email: {email}
Sex: {sex} | Nationality: {nationality}
Position: {positionTitle} | Employment: {employmentType}
Clinical Experience: {totalClinicalExperienceYears} years
Specialist Experience: {specialistExperienceYears} years
Languages: {languages.join(', ')}
Education: {educations.join(' | ')}
```

**Department format:**
```
Department: {name}
Branch: {branch_name}
Description: {description}
```

**Branch format:**
```
Branch: {name}
Address: {address}
Phone: {phone} | Email: {email}
Hours: {hours}
Description: {description}
```

**Service Package format:**
```
Package: {title}
Department: {department_name}
Price: {priceLabel}
Description: {description}
Services included: {services}
Promotion: {promotion_title}
```

**News format:**
```
Title: {title}
Author: {author}
Excerpt: {excerpt}
Content: {body}
```

**Health Tip format:**
```
Title: {title}
Category: {category}
Reading Time: {readingTime} min
Excerpt: {excerpt}
Content: {body}
```

**Career format:**
```
Position: {title}
Department: {careerDepartment}
Location: {careerLocation}
Employment Type: {careerEmploymentType}
Experience Level: {experienceLevel}
Salary: {salaryRange}
Deadline: {applicationDeadline}
Description: {excerpt}
Requirements: {careerRequirements}
Responsibilities: {responsibilities}
```

**Doctor Talk format:**
```
Doctor Talk: {title}
YouTube: {youtubeUrl}
```

**Promotion format:**
```
Promotion: {title}
Valid: {validFrom} to {validTo}
Description: {description}
```

**FAQ format:**
```
Question: {question}
Answer: {answer}
Category: {category}
```

---

## Section 2: File Upload (`POST /api/rag2/upload`)

### Auth

Header `X-Upload-Secret` must match env var `RAG2_UPLOAD_SECRET`. Return 401 if missing/wrong.

### Request

`multipart/form-data`:
- `file`: PDF, TXT, or MD file (max 10MB)
- `doc_type`: string (e.g. `"price"`, `"policy"`)

### Flow

```
1. Verify X-Upload-Secret
2. Upload file → Supabase Storage bucket 'ai-docs' at path ai-docs/{uuid}/{filename}
3. INSERT INTO ai_rag2_uploads (filename, url, doc_type, size_bytes, status='pending')
4. Extract text:
   - .pdf → pdf-parse npm package
   - .txt/.md → read as utf-8
5. Chunk text (1000 chars / 200 overlap — same chunker as RAG1)
6. Delete existing ai_rag2_documents WHERE source_collection = doc_type AND source_id IN
   (SELECT id FROM ai_rag2_uploads WHERE doc_type = doc_type) -- replaces old upload
7. embed(chunks) → INSERT rows into ai_rag2_documents with source_id = upload.id, locale = 'en'
8. UPDATE ai_rag2_uploads SET status = 'embedded'
9. Return { uploadId, chunks: number }
```

### Package needed

```
npm install pdf-parse
npm install --save-dev @types/pdf-parse
```

---

## Section 3: Chat Endpoint (`POST /api/rag2`)

Mirrors RAG1 exactly except vector search targets `ai_rag2_documents`.

### Request / Response

Same as RAG1:
- In: `{ message, session_key, locale, user_id }`
- Out: `{ output: string }`

### Intent → source_collection map

| Intent keywords | source_collection |
|---|---|
| doctor, physician, specialist, specialist, វេជ្ជបណ្ឌិត, 医生 | `doctors` |
| department, clinic, center, មន្ទីរ, 科室 | `departments` |
| branch, location, address, hospital, clinic, សាខា, 分院 | `branches` |
| package, checkup, antenatal, delivery, គ្រូពេទ្យ, 套餐 | `service_packages` |
| news, update, announcement, ព័ត៌មាន, 新闻 | `news` |
| health tip, advice, wellness, សុខភាព, 健康 | `health_tips` |
| career, job, vacancy, hire, ការងារ, 职位 | `careers` |
| doctor talk, seminar, talk, youtube, ការពិភាក្សា, 讲座 | `doctor_talks` |
| promotion, offer, discount, ប្រូម៉ូសិន, 优惠 | `promotions` |
| faq, question, how, what, why, 常见问题, សំណួរ | `faqs` |
| price, fee, cost, rate, cost, តម្លៃ, 价格 | `price` (upload-only) |
| fallback | `faqs`, `departments`, `branches` |

### Vector search with locale fallback

```
1. Detect locale from message
2. Detect intent → list of { collection, topK }
3. Embed query
4. For each intent:
   a. Search ai_rag2_documents WHERE source_collection=X AND locale=detectedLocale, topK results
   b. If results < 3 AND detectedLocale != 'en':
      also search WHERE source_collection=X AND locale='en', take up to (topK - results) more
5. Dedup by id, sort by similarity desc, take top 15
6. Build prompt + call gpt-4.1-mini
7. Return { output }
```

### Session / history / validation

Identical to RAG1 — same tables (`ai_chat_sessions`, `ai_chat_messages`), same validation, same greeting short-circuit.

---

## File Structure

```
src/lib/rag2/
  format/
    format-doctor.ts
    format-department.ts
    format-branch.ts
    format-service-package.ts
    format-news.ts
    format-health-tip.ts
    format-career.ts
    format-doctor-talk.ts
    format-promotion.ts
    format-faq.ts
    index.ts             ← exports getFormatter(collection)
  ingest-record.ts       ← fetch → format → embed → upsert (all locales)
  chunk-text.ts          ← shared chunker (same as RAG1)
  vector-search.ts       ← search ai_rag2_documents with locale fallback
  build-prompt.ts        ← same as RAG1 (reuse or copy)

src/app/api/rag2/
  ingest/route.ts        ← POST, signature verify, dispatch to ingest-record.ts
  upload/route.ts        ← POST, file upload + embed
  route.ts               ← POST, chat endpoint
```

---

## Environment Variables

```
# Already exists:
OPENAI_API_KEY=...
DATABASE_URL=...                    # payload schema access via getRawPool()
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...       # write to ai_rag2_documents / ai_rag2_uploads

# New:
WEBHOOK_SECRET=...                  # already used by Payload, reuse same value
RAG2_UPLOAD_SECRET=...              # admin-only file upload auth
```

---

## Admin Setup (one-time, no code)

1. Deploy Next.js to Vercel with new env vars
2. Go to Payload admin → Settings → Operational Settings → Webhook Targets
3. Add: `https://orienda.com/api/rag2/ingest`
4. Save — all future publishes/deletes auto-trigger embedding

---

## What RAG2 Does NOT Do

- No streaming (same as RAG1 — non-streaming `{ output }`)
- No Services collection (no localized text worth embedding beyond description — covered by service_packages)
- No TourScenes, InsuranceUpdates, Announcements (not user-facing chat content)
- No Payload code changes
