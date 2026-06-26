# RAG2 Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a live, admin-driven RAG pipeline that auto-embeds Payload CMS records into Supabase on publish/delete, supports manual file upload, and serves a locale-aware chat endpoint.

**Architecture:** Payload's existing `contentWebhooks.ts` fires HTTP POST to `/api/rag2/ingest` on publish/delete. The ingest handler queries `payload.*` schema via `getRawPool()`, formats text, embeds with `text-embedding-3-small`, and upserts into `public.ai_rag2_documents`. A separate `/api/rag2/upload` endpoint handles PDF/MD/TXT file uploads. `/api/rag2` is the chat endpoint — identical to RAG1 but searches `ai_rag2_documents` with locale fallback.

**Tech Stack:** Next.js App Router (Node.js runtime), TypeScript, `openai` npm (^6.45.0 already installed), `pdf-parse` npm (new), `pg` via `getRawPool()`, `@supabase/supabase-js` via `createServiceClient()`

## Global Constraints

- All new files live under `src/lib/rag2/` and `src/app/api/rag2/`
- All route files must have `export const runtime = 'nodejs'` at the top
- Use `getRawPool()` from `@/lib/db` for `payload.*` schema queries
- Use `await createServiceClient()` from `@/utils/supabase/server` for `public.*` schema (ai_rag2_documents, ai_rag2_uploads)
- Use `lexicalToText()` from `@/lib/payload-api` for richText fields
- Embedding model: `text-embedding-3-small` (1536d) — must match stored vectors
- Chat model: `gpt-4.1-mini`
- `source_id` in `ai_rag2_documents` is TEXT (Payload integer IDs stored as string, upload UUIDs stored as-is)
- Never commit `.env.local` — API keys stay in environment only
- Branch: `rag2-fei` — all commits go here

## Pre-requisites (already done by user)

- `public.ai_rag2_documents` table created (id BIGINT, source_id TEXT, source_collection TEXT, locale TEXT, content TEXT, metadata JSONB, embedding VECTOR(1536), created_at TIMESTAMPTZ)
- `public.ai_rag2_uploads` table created (id UUID, filename TEXT, url TEXT, doc_type TEXT, size_bytes BIGINT, status TEXT, error TEXT, created_at TIMESTAMPTZ)
- `match_ai_rag2_documents` RPC function created
- Indexes created on ai_rag2_documents
- GRANT ALL + GRANT SEQUENCE to service_role done

---

## File Map

| File | Purpose |
|---|---|
| `src/lib/rag2/chunk-text.ts` | Split long text into overlapping chunks (1000/200) |
| `src/lib/rag2/verify-webhook.ts` | HMAC-SHA256 signature verification |
| `src/lib/rag2/format/format-doctor.ts` | SQL + text formatter for doctors collection |
| `src/lib/rag2/format/format-department.ts` | SQL + text formatter for departments |
| `src/lib/rag2/format/format-branch.ts` | SQL + text formatter for branches |
| `src/lib/rag2/format/format-service-package.ts` | SQL + text formatter for service-packages |
| `src/lib/rag2/format/format-news.ts` | SQL + text formatter for news |
| `src/lib/rag2/format/format-health-tip.ts` | SQL + text formatter for health-tips |
| `src/lib/rag2/format/format-career.ts` | SQL + text formatter for careers |
| `src/lib/rag2/format/format-doctor-talk.ts` | SQL + text formatter for doctor-talks |
| `src/lib/rag2/format/format-promotion.ts` | SQL + text formatter for promotions |
| `src/lib/rag2/format/format-faq.ts` | SQL + text formatter for faqs |
| `src/lib/rag2/format/index.ts` | Maps webhook collection name → formatter + config |
| `src/lib/rag2/ingest-record.ts` | Orchestrates: fetch → format → embed → upsert for all locales |
| `src/lib/rag2/vector-search.ts` | Search ai_rag2_documents with locale fallback |
| `src/app/api/rag2/ingest/route.ts` | POST webhook handler — verify sig → dispatch to ingest-record |
| `src/app/api/rag2/upload/route.ts` | POST file upload → Storage → extract text → embed |
| `src/app/api/rag2/route.ts` | POST chat endpoint (RAG pipeline using ai_rag2_documents) |

---

## Task 1: Shared utilities

**Files:**
- Create: `src/lib/rag2/chunk-text.ts`
- Create: `src/lib/rag2/verify-webhook.ts`

**Interfaces:**
- Produces:
  - `chunkText(text: string): string[]`
  - `verifyWebhookSignature(body: string, header: string | null, secret: string): boolean`

- [ ] **Step 1: Create chunk-text.ts**

```typescript
// src/lib/rag2/chunk-text.ts
const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

function splitRecursive(text: string, separators: string[]): string[] {
  if (!text.trim()) return []
  if (text.length <= CHUNK_SIZE || separators.length === 0) {
    return text.trim() ? [text.trim()] : []
  }
  const [sep, ...rest] = separators
  const parts = text.split(sep)
  const result: string[] = []
  let current = ''
  for (let i = 0; i < parts.length; i++) {
    const piece = (i > 0 ? sep : '') + parts[i]
    if (current.length + piece.length <= CHUNK_SIZE) {
      current += piece
    } else {
      if (current.trim()) result.push(current.trim())
      if (piece.length > CHUNK_SIZE) {
        result.push(...splitRecursive(piece, rest))
        current = ''
      } else {
        const tail = current.length > CHUNK_OVERLAP ? current.slice(-CHUNK_OVERLAP) : current
        current = tail + piece
      }
    }
  }
  if (current.trim()) result.push(current.trim())
  return result
}

export function chunkText(text: string): string[] {
  const separators = ['\n## ', '\n### ', '\n---\n', '\n\n', '\n', ' ']
  return splitRecursive(text, separators)
}
```

- [ ] **Step 2: Create verify-webhook.ts**

```typescript
// src/lib/rag2/verify-webhook.ts
import crypto from 'crypto'

export function verifyWebhookSignature(
  body: string,
  header: string | null,
  secret: string,
): boolean {
  if (!header || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header))
  } catch {
    return false
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/houtchinhfey/orienda/orienda_bong_both
git add src/lib/rag2/chunk-text.ts src/lib/rag2/verify-webhook.ts
git commit -m "feat(rag2): add chunk-text and webhook signature utilities"
```

---

## Task 2: Collection formatters

**Files:**
- Create: `src/lib/rag2/format/format-doctor.ts`
- Create: `src/lib/rag2/format/format-department.ts`
- Create: `src/lib/rag2/format/format-branch.ts`
- Create: `src/lib/rag2/format/format-service-package.ts`
- Create: `src/lib/rag2/format/format-news.ts`
- Create: `src/lib/rag2/format/format-health-tip.ts`
- Create: `src/lib/rag2/format/format-career.ts`
- Create: `src/lib/rag2/format/format-doctor-talk.ts`
- Create: `src/lib/rag2/format/format-promotion.ts`
- Create: `src/lib/rag2/format/format-faq.ts`
- Create: `src/lib/rag2/format/index.ts`

**Interfaces:**
- Consumes: `getRawPool()` from `@/lib/db`, `lexicalToText()` from `@/lib/payload-api`
- Produces:
  ```typescript
  interface CollectionConfig {
    sourceCollection: string
    fetchRow: (pool: any, docId: number, locale: string) => Promise<any | null>
    formatText: (row: any) => string
  }
  // format/index.ts exports:
  export function getCollectionConfig(webhookCollection: string): CollectionConfig | null
  ```

- [ ] **Step 1: Create format-doctor.ts**

```typescript
// src/lib/rag2/format/format-doctor.ts
import { lexicalToText } from '@/lib/payload-api'

export async function fetchDoctor(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows: main } = await pool.query(`
    SELECT
      doc.id, doc.phone, doc.email, doc.sex, doc.nationality,
      doc.position_title, doc.employment_type,
      doc.total_clinical_experience_years, doc.specialist_experience_years,
      doc.doctor_number,
      COALESCE(dl.name, endll.name)           AS name,
      COALESCE(dl.specialty, endll.specialty) AS specialty,
      COALESCE(dl.bio, endll.bio)             AS bio
    FROM payload.doctors doc
    LEFT JOIN payload.doctors_locales dl    ON dl._parent_id = doc.id AND dl._locale = $2
    LEFT JOIN payload.doctors_locales endll ON endll._parent_id = doc.id AND endll._locale = 'en'
    WHERE doc.id = $1 AND doc._status = 'published'
    LIMIT 1
  `, [docId, locale])
  if (!main[0]) return null
  const row = main[0]

  const [{ rows: langs }, { rows: edu }, { rows: dept }] = await Promise.all([
    pool.query(`SELECT name FROM payload.doctors_languages WHERE _parent_id = $1 ORDER BY _order`, [docId]),
    pool.query(`SELECT description FROM payload.doctors_education WHERE _parent_id = $1 ORDER BY _order`, [docId]),
    pool.query(`SELECT dl.name FROM payload.doctors doc LEFT JOIN payload.departments_locales dl ON dl._parent_id = doc.department_id AND dl._locale = 'en' WHERE doc.id = $1 LIMIT 1`, [docId]),
  ])

  return {
    ...row,
    languages: langs.map((l: any) => l.name).filter(Boolean),
    education: edu.map((e: any) => e.description).filter(Boolean),
    department: dept[0]?.name ?? '',
  }
}

export function formatDoctor(row: any): string {
  const parts: string[] = []
  if (row.name)       parts.push(`Doctor: ${row.name}`)
  if (row.specialty)  parts.push(`Specialty: ${row.specialty}`)
  if (row.department) parts.push(`Department: ${row.department}`)
  const bio = lexicalToText(row.bio)
  if (bio)            parts.push(`Bio: ${bio}`)
  if (row.doctor_number) parts.push(`Doctor Number: ${row.doctor_number}`)
  if (row.phone)      parts.push(`Phone: ${row.phone}`)
  if (row.email)      parts.push(`Email: ${row.email}`)
  if (row.sex)        parts.push(`Sex: ${row.sex}`)
  if (row.nationality) parts.push(`Nationality: ${row.nationality}`)
  if (row.position_title) parts.push(`Position: ${row.position_title}`)
  if (row.employment_type) parts.push(`Employment Type: ${row.employment_type}`)
  if (row.total_clinical_experience_years) parts.push(`Clinical Experience: ${row.total_clinical_experience_years} years`)
  if (row.specialist_experience_years) parts.push(`Specialist Experience: ${row.specialist_experience_years} years`)
  if (row.languages?.length) parts.push(`Languages: ${row.languages.join(', ')}`)
  if (row.education?.length) parts.push(`Education: ${row.education.join(' | ')}`)
  return parts.join('\n')
}
```

- [ ] **Step 2: Create format-department.ts**

```typescript
// src/lib/rag2/format/format-department.ts
import { lexicalToText } from '@/lib/payload-api'

export async function fetchDepartment(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      d.id, d.branch_id,
      COALESCE(dl.name, endll.name)               AS name,
      COALESCE(dl.description, endll.description) AS description,
      COALESCE(bl.name, en_bl.name)               AS branch_name
    FROM payload.departments d
    LEFT JOIN payload.departments_locales dl    ON dl._parent_id = d.id AND dl._locale = $2
    LEFT JOIN payload.departments_locales endll ON endll._parent_id = d.id AND endll._locale = 'en'
    LEFT JOIN payload.branches_locales bl       ON bl._parent_id = d.branch_id AND bl._locale = $2
    LEFT JOIN payload.branches_locales en_bl    ON en_bl._parent_id = d.branch_id AND en_bl._locale = 'en'
    WHERE d.id = $1 AND d._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatDepartment(row: any): string {
  const parts: string[] = []
  if (row.name)        parts.push(`Department: ${row.name}`)
  if (row.branch_name) parts.push(`Branch: ${row.branch_name}`)
  const desc = lexicalToText(row.description)
  if (desc) parts.push(`Description: ${desc}`)
  return parts.join('\n')
}
```

- [ ] **Step 3: Create format-branch.ts**

```typescript
// src/lib/rag2/format/format-branch.ts
import { lexicalToText } from '@/lib/payload-api'

export async function fetchBranch(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      b.id, b.phone, b.email, b.map_url,
      COALESCE(bl.name, enbl.name)           AS name,
      COALESCE(bl.address, enbl.address)     AS address,
      COALESCE(bl.hours, enbl.hours)         AS hours,
      COALESCE(bl.description, enbl.description) AS description
    FROM payload.branches b
    LEFT JOIN payload.branches_locales bl    ON bl._parent_id = b.id AND bl._locale = $2
    LEFT JOIN payload.branches_locales enbl  ON enbl._parent_id = b.id AND enbl._locale = 'en'
    WHERE b.id = $1 AND b._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatBranch(row: any): string {
  const parts: string[] = []
  if (row.name)    parts.push(`Branch: ${row.name}`)
  if (row.address) parts.push(`Address: ${row.address}`)
  if (row.phone)   parts.push(`Phone: ${row.phone}`)
  if (row.email)   parts.push(`Email: ${row.email}`)
  const hours = lexicalToText(row.hours)
  if (hours) parts.push(`Hours: ${hours}`)
  const desc = lexicalToText(row.description)
  if (desc) parts.push(`Description: ${desc}`)
  if (row.map_url) parts.push(`Map: ${row.map_url}`)
  return parts.join('\n')
}
```

- [ ] **Step 4: Create format-service-package.ts**

```typescript
// src/lib/rag2/format/format-service-package.ts
import { lexicalToText } from '@/lib/payload-api'

export async function fetchServicePackage(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      sp.id,
      COALESCE(spl.title, en_spl.title)             AS title,
      COALESCE(spl.price_label, en_spl.price_label) AS price_label,
      COALESCE(spl.description, en_spl.description) AS description,
      COALESCE(dept_l.name, en_dept_l.name)         AS department_name
    FROM payload.service_packages sp
    LEFT JOIN payload.service_packages_locales spl     ON spl._parent_id = sp.id AND spl._locale = $2
    LEFT JOIN payload.service_packages_locales en_spl  ON en_spl._parent_id = sp.id AND en_spl._locale = 'en'
    LEFT JOIN payload.departments_locales dept_l        ON dept_l._parent_id = sp.department_id AND dept_l._locale = $2
    LEFT JOIN payload.departments_locales en_dept_l     ON en_dept_l._parent_id = sp.department_id AND en_dept_l._locale = 'en'
    WHERE sp.id = $1 AND sp._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatServicePackage(row: any): string {
  const parts: string[] = []
  if (row.title)           parts.push(`Package: ${row.title}`)
  if (row.department_name) parts.push(`Department: ${row.department_name}`)
  if (row.price_label)     parts.push(`Price: ${row.price_label}`)
  const desc = lexicalToText(row.description)
  if (desc) parts.push(`Description: ${desc}`)
  return parts.join('\n')
}
```

- [ ] **Step 5: Create format-news.ts**

```typescript
// src/lib/rag2/format/format-news.ts
import { lexicalToText } from '@/lib/payload-api'

export async function fetchNews(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      n.id, n.author,
      COALESCE(nl.title, enl.title)     AS title,
      COALESCE(nl.excerpt, enl.excerpt) AS excerpt,
      COALESCE(nl.body, enl.body)       AS body
    FROM payload.news n
    LEFT JOIN payload.news_locales nl  ON nl._parent_id = n.id AND nl._locale = $2
    LEFT JOIN payload.news_locales enl ON enl._parent_id = n.id AND enl._locale = 'en'
    WHERE n.id = $1 AND n._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatNews(row: any): string {
  const parts: string[] = []
  if (row.title)   parts.push(`Title: ${row.title}`)
  if (row.author)  parts.push(`Author: ${row.author}`)
  if (row.excerpt) parts.push(`Summary: ${row.excerpt}`)
  const body = lexicalToText(row.body)
  if (body) parts.push(`Content: ${body}`)
  return parts.join('\n')
}
```

- [ ] **Step 6: Create format-health-tip.ts**

```typescript
// src/lib/rag2/format/format-health-tip.ts
import { lexicalToText } from '@/lib/payload-api'

export async function fetchHealthTip(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      ht.id, ht.author, ht.health_tip_category, ht.reading_time,
      COALESCE(htl.title, en_htl.title)     AS title,
      COALESCE(htl.excerpt, en_htl.excerpt) AS excerpt,
      COALESCE(htl.body, en_htl.body)       AS body
    FROM payload.health_tips ht
    LEFT JOIN payload.health_tips_locales htl    ON htl._parent_id = ht.id AND htl._locale = $2
    LEFT JOIN payload.health_tips_locales en_htl ON en_htl._parent_id = ht.id AND en_htl._locale = 'en'
    WHERE ht.id = $1 AND ht._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatHealthTip(row: any): string {
  const parts: string[] = []
  if (row.title)               parts.push(`Health Tip: ${row.title}`)
  if (row.health_tip_category) parts.push(`Category: ${row.health_tip_category}`)
  if (row.reading_time)        parts.push(`Reading Time: ${row.reading_time} min`)
  if (row.author)              parts.push(`Author: ${row.author}`)
  if (row.excerpt)             parts.push(`Summary: ${row.excerpt}`)
  const body = lexicalToText(row.body)
  if (body) parts.push(`Content: ${body}`)
  return parts.join('\n')
}
```

- [ ] **Step 7: Create format-career.ts**

```typescript
// src/lib/rag2/format/format-career.ts
import { lexicalToText } from '@/lib/payload-api'

export async function fetchCareer(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      c.id, c.career_employment_type, c.experience_level, c.application_deadline,
      COALESCE(cl.title, encl.title)                             AS title,
      COALESCE(cl.position, encl.position)                       AS position,
      COALESCE(cl.excerpt, encl.excerpt)                         AS excerpt,
      COALESCE(cl.body, encl.body)                               AS body,
      COALESCE(cl.salary_range, encl.salary_range)               AS salary_range,
      COALESCE(cl.career_requirements, encl.career_requirements) AS career_requirements,
      COALESCE(cl.responsibilities, encl.responsibilities)       AS responsibilities,
      COALESCE(dept_l.name, en_dept_l.name)                      AS department_name
    FROM payload.careers c
    LEFT JOIN payload.careers_locales cl    ON cl._parent_id = c.id AND cl._locale = $2
    LEFT JOIN payload.careers_locales encl  ON encl._parent_id = c.id AND encl._locale = 'en'
    LEFT JOIN payload.departments_locales dept_l    ON dept_l._parent_id = c.career_department_id AND dept_l._locale = $2
    LEFT JOIN payload.departments_locales en_dept_l ON en_dept_l._parent_id = c.career_department_id AND en_dept_l._locale = 'en'
    WHERE c.id = $1 AND c._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatCareer(row: any): string {
  const parts: string[] = []
  if (row.position || row.title) parts.push(`Position: ${row.position ?? row.title}`)
  if (row.department_name)       parts.push(`Department: ${row.department_name}`)
  if (row.career_employment_type) parts.push(`Employment Type: ${row.career_employment_type}`)
  if (row.experience_level)      parts.push(`Experience Level: ${row.experience_level}`)
  if (row.salary_range)          parts.push(`Salary Range: ${row.salary_range}`)
  if (row.application_deadline)  parts.push(`Application Deadline: ${row.application_deadline}`)
  if (row.excerpt)               parts.push(`Summary: ${row.excerpt}`)
  const requirements = lexicalToText(row.career_requirements)
  if (requirements) parts.push(`Requirements: ${requirements}`)
  const responsibilities = lexicalToText(row.responsibilities)
  if (responsibilities) parts.push(`Responsibilities: ${responsibilities}`)
  const body = lexicalToText(row.body)
  if (body) parts.push(`Details: ${body}`)
  return parts.join('\n')
}
```

- [ ] **Step 8: Create format-doctor-talk.ts**

```typescript
// src/lib/rag2/format/format-doctor-talk.ts
import { lexicalToText } from '@/lib/payload-api'

export async function fetchDoctorTalk(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      dt.id, dt.meeting_link, dt.event_date,
      COALESCE(dtl.title, endtl.title)           AS title,
      COALESCE(dtl.talk_topic, endtl.talk_topic) AS talk_topic,
      COALESCE(dtl.excerpt, endtl.excerpt)       AS excerpt,
      COALESCE(dtl.body, endtl.body)             AS body,
      doc_l.name AS doctor_name,
      doc_l.specialty AS doctor_specialty
    FROM payload.doctor_talks dt
    LEFT JOIN payload.doctor_talks_locales dtl    ON dtl._parent_id = dt.id AND dtl._locale = $2
    LEFT JOIN payload.doctor_talks_locales endtl  ON endtl._parent_id = dt.id AND endtl._locale = 'en'
    LEFT JOIN payload.doctors doc ON doc.id = dt.featured_doctor_id
    LEFT JOIN payload.doctors_locales doc_l ON doc_l._parent_id = doc.id AND doc_l._locale = 'en'
    WHERE dt.id = $1 AND dt._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatDoctorTalk(row: any): string {
  const parts: string[] = []
  if (row.title)          parts.push(`Doctor Talk: ${row.title}`)
  if (row.talk_topic)     parts.push(`Topic: ${row.talk_topic}`)
  if (row.doctor_name)    parts.push(`Speaker: ${row.doctor_name}`)
  if (row.doctor_specialty) parts.push(`Specialty: ${row.doctor_specialty}`)
  if (row.event_date)     parts.push(`Date: ${row.event_date}`)
  if (row.meeting_link)   parts.push(`Link: ${row.meeting_link}`)
  if (row.excerpt)        parts.push(`Summary: ${row.excerpt}`)
  const body = lexicalToText(row.body)
  if (body) parts.push(`Details: ${body}`)
  return parts.join('\n')
}
```

- [ ] **Step 9: Create format-promotion.ts**

```typescript
// src/lib/rag2/format/format-promotion.ts
import { lexicalToText } from '@/lib/payload-api'

export async function fetchPromotion(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      p.id, p.valid_from, p.valid_to,
      COALESCE(pl.title, enpl.title)             AS title,
      COALESCE(pl.description, enpl.description) AS description
    FROM payload.promotions p
    LEFT JOIN payload.promotions_locales pl    ON pl._parent_id = p.id AND pl._locale = $2
    LEFT JOIN payload.promotions_locales enpl  ON enpl._parent_id = p.id AND enpl._locale = 'en'
    WHERE p.id = $1 AND p._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatPromotion(row: any): string {
  const parts: string[] = []
  if (row.title)     parts.push(`Promotion: ${row.title}`)
  if (row.valid_from) parts.push(`Valid From: ${row.valid_from}`)
  if (row.valid_to)   parts.push(`Valid To: ${row.valid_to}`)
  const desc = lexicalToText(row.description)
  if (desc) parts.push(`Details: ${desc}`)
  return parts.join('\n')
}
```

- [ ] **Step 10: Create format-faq.ts**

```typescript
// src/lib/rag2/format/format-faq.ts
import { lexicalToText } from '@/lib/payload-api'

export async function fetchFaq(pool: any, docId: number, locale: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT
      f.id, f.category,
      COALESCE(fl.question, enfl.question) AS question,
      COALESCE(fl.answer, enfl.answer)     AS answer
    FROM payload.faqs f
    LEFT JOIN payload.faqs_locales fl    ON fl._parent_id = f.id AND fl._locale = $2
    LEFT JOIN payload.faqs_locales enfl  ON enfl._parent_id = f.id AND enfl._locale = 'en'
    WHERE f.id = $1 AND f._status = 'published'
    LIMIT 1
  `, [docId, locale])
  return rows[0] ?? null
}

export function formatFaq(row: any): string {
  const parts: string[] = []
  if (row.question) parts.push(`Question: ${row.question}`)
  const answer = lexicalToText(row.answer)
  if (answer) parts.push(`Answer: ${answer}`)
  if (row.category) parts.push(`Category: ${row.category}`)
  return parts.join('\n')
}
```

- [ ] **Step 11: Create format/index.ts**

```typescript
// src/lib/rag2/format/index.ts
import { getRawPool } from '@/lib/db'
import { fetchDoctor, formatDoctor } from './format-doctor'
import { fetchDepartment, formatDepartment } from './format-department'
import { fetchBranch, formatBranch } from './format-branch'
import { fetchServicePackage, formatServicePackage } from './format-service-package'
import { fetchNews, formatNews } from './format-news'
import { fetchHealthTip, formatHealthTip } from './format-health-tip'
import { fetchCareer, formatCareer } from './format-career'
import { fetchDoctorTalk, formatDoctorTalk } from './format-doctor-talk'
import { fetchPromotion, formatPromotion } from './format-promotion'
import { fetchFaq, formatFaq } from './format-faq'

export interface CollectionConfig {
  sourceCollection: string
  fetchRow: (docId: number, locale: string) => Promise<any | null>
  formatText: (row: any) => string
}

// Webhook collection name → config
// Note: Payload's createWebhookHooks uses the slug passed to it, which may differ from collection slug
const REGISTRY: Record<string, CollectionConfig> = {
  doctors: {
    sourceCollection: 'doctors',
    fetchRow: (id, locale) => fetchDoctor(getRawPool(), id, locale),
    formatText: formatDoctor,
  },
  departments: {
    sourceCollection: 'departments',
    fetchRow: (id, locale) => fetchDepartment(getRawPool(), id, locale),
    formatText: formatDepartment,
  },
  branches: {
    sourceCollection: 'branches',
    fetchRow: (id, locale) => fetchBranch(getRawPool(), id, locale),
    formatText: formatBranch,
  },
  servicePackages: {
    sourceCollection: 'service_packages',
    fetchRow: (id, locale) => fetchServicePackage(getRawPool(), id, locale),
    formatText: formatServicePackage,
  },
  news: {
    sourceCollection: 'news',
    fetchRow: (id, locale) => fetchNews(getRawPool(), id, locale),
    formatText: formatNews,
  },
  'health-tips': {
    sourceCollection: 'health_tips',
    fetchRow: (id, locale) => fetchHealthTip(getRawPool(), id, locale),
    formatText: formatHealthTip,
  },
  careers: {
    sourceCollection: 'careers',
    fetchRow: (id, locale) => fetchCareer(getRawPool(), id, locale),
    formatText: formatCareer,
  },
  'doctor-talks': {
    sourceCollection: 'doctor_talks',
    fetchRow: (id, locale) => fetchDoctorTalk(getRawPool(), id, locale),
    formatText: formatDoctorTalk,
  },
  promotions: {
    sourceCollection: 'promotions',
    fetchRow: (id, locale) => fetchPromotion(getRawPool(), id, locale),
    formatText: formatPromotion,
  },
  faqs: {
    sourceCollection: 'faqs',
    fetchRow: (id, locale) => fetchFaq(getRawPool(), id, locale),
    formatText: formatFaq,
  },
}

export function getCollectionConfig(webhookCollection: string): CollectionConfig | null {
  return REGISTRY[webhookCollection] ?? null
}
```

- [ ] **Step 12: Commit**

```bash
git add src/lib/rag2/format/
git commit -m "feat(rag2): add collection formatters for all 10 Payload collections"
```

---

## Task 3: Ingest record orchestrator

**Files:**
- Create: `src/lib/rag2/ingest-record.ts`

**Interfaces:**
- Consumes:
  - `getCollectionConfig(collection)` from `./format/index`
  - `createServiceClient()` from `@/utils/supabase/server`
  - OpenAI client passed in (created at route level)
- Produces: `ingestRecord(openai, collection, docId): Promise<void>`
- Produces: `deleteRecord(docId): Promise<void>`

- [ ] **Step 1: Create ingest-record.ts**

```typescript
// src/lib/rag2/ingest-record.ts
import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'
import { getCollectionConfig } from './format/index'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const LOCALES = ['en', 'km', 'zh'] as const

async function embedText(text: string, openai: OpenAI): Promise<number[]> {
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text })
  return res.data[0].embedding
}

export async function deleteRecord(sourceId: string): Promise<void> {
  const db = await createServiceClient()
  const { error } = await db
    .from('ai_rag2_documents')
    .delete()
    .eq('source_id', sourceId)
  if (error) console.error('[rag2] delete error:', error)
}

export async function ingestRecord(
  openai: OpenAI,
  webhookCollection: string,
  docId: number,
): Promise<void> {
  const config = getCollectionConfig(webhookCollection)
  if (!config) {
    console.log(`[rag2] skipping unknown collection: ${webhookCollection}`)
    return
  }

  const sourceId = String(docId)

  // Clean slate before re-embedding
  await deleteRecord(sourceId)

  // Fetch en content once for fallback
  const enRow = await config.fetchRow(docId, 'en')
  if (!enRow) {
    console.log(`[rag2] doc ${docId} not found or unpublished — skipped`)
    return
  }
  const enText = config.formatText(enRow).trim()
  if (!enText) {
    console.log(`[rag2] doc ${docId} produced empty en text — skipped`)
    return
  }

  const db = await createServiceClient()
  const rows: object[] = []

  for (const locale of LOCALES) {
    let text = enText // default to en fallback
    if (locale !== 'en') {
      const locRow = await config.fetchRow(docId, locale)
      const locText = locRow ? config.formatText(locRow).trim() : ''
      if (locText) text = locText
    }

    const embedding = await embedText(text, openai)
    rows.push({
      source_id:         sourceId,
      source_collection: config.sourceCollection,
      locale,
      content:           text,
      metadata: {
        doc_id:            docId,
        source_collection: config.sourceCollection,
        locale,
      },
      embedding,
    })
  }

  const { error } = await db.from('ai_rag2_documents').insert(rows)
  if (error) console.error('[rag2] insert error:', error)
  else console.log(`[rag2] embedded ${rows.length} locales for ${webhookCollection}/${docId}`)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/rag2/ingest-record.ts
git commit -m "feat(rag2): add ingest-record orchestrator (fetch, format, embed, upsert)"
```

---

## Task 4: Webhook ingest endpoint

**Files:**
- Create: `src/app/api/rag2/ingest/route.ts`

**Interfaces:**
- Consumes:
  - `verifyWebhookSignature` from `@/lib/rag2/verify-webhook`
  - `ingestRecord`, `deleteRecord` from `@/lib/rag2/ingest-record`
  - `WEBHOOK_SECRET` env var (already used by Payload)
- In: POST `{ event: 'published'|'deleted', collection: string, docId: number, locale?: string, slug?: string, timestamp: string }` + `X-Payload-Signature` header
- Out: `{ ok: true }` or error

- [ ] **Step 1: Create ingest/route.ts**

```typescript
// src/app/api/rag2/ingest/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { verifyWebhookSignature } from '@/lib/rag2/verify-webhook'
import { ingestRecord, deleteRecord } from '@/lib/rag2/ingest-record'

export const runtime = 'nodejs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()
  const signature = req.headers.get('X-Payload-Signature')
  const secret = process.env.WEBHOOK_SECRET ?? ''

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    console.warn('[rag2/ingest] invalid signature')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: { event: string; collection: string; docId: number; timestamp: string }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event, collection, docId } = payload
  console.log(`[rag2/ingest] ${event} ${collection}/${docId}`)

  try {
    if (event === 'published') {
      await ingestRecord(openai, collection, docId)
    } else if (event === 'deleted') {
      await deleteRecord(String(docId))
    }
  } catch (err: any) {
    console.error('[rag2/ingest] error:', err?.message ?? err)
    return NextResponse.json({ error: 'Ingest failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/houtchinhfey/orienda/orienda_bong_both
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing errors unrelated to rag2 files)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/rag2/ingest/route.ts
git commit -m "feat(rag2): add webhook ingest endpoint with HMAC signature verification"
```

---

## Task 5: File upload endpoint

**Files:**
- Create: `src/app/api/rag2/upload/route.ts`
- Modify: `package.json` (add pdf-parse)

**Interfaces:**
- Consumes:
  - `chunkText` from `@/lib/rag2/chunk-text`
  - `createServiceClient()` from `@/utils/supabase/server`
  - `RAG2_UPLOAD_SECRET` env var
  - `NEXT_PUBLIC_SUPABASE_URL` env var (for storage URL construction)
- In: POST multipart `{ file: File, doc_type: string }` + `X-Upload-Secret` header
- Out: `{ uploadId: string, chunks: number }`

**Pre-requisite:** Create `ai-docs` bucket in Supabase Storage dashboard (set to private).

- [ ] **Step 1: Install pdf-parse**

```bash
cd /Users/houtchinhfey/orienda/orienda_bong_both
npm install pdf-parse
npm install --save-dev @types/pdf-parse
```

Expected: package-lock.json updated, no errors

- [ ] **Step 2: Create upload/route.ts**

```typescript
// src/app/api/rag2/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'
import { chunkText } from '@/lib/rag2/chunk-text'

export const runtime = 'nodejs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const EMBEDDING_MODEL = 'text-embedding-3-small'
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB

async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') {
    const pdfParse = (await import('pdf-parse')).default
    const result = await pdfParse(buffer)
    return result.text
  }
  // txt / md
  return buffer.toString('utf-8')
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts })
  return res.data.map(d => d.embedding)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const uploadSecret = process.env.RAG2_UPLOAD_SECRET ?? ''
  if (!uploadSecret || req.headers.get('X-Upload-Secret') !== uploadSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const docType = (formData.get('doc_type') as string | null)?.trim() ?? ''

  if (!file || !docType) {
    return NextResponse.json({ error: 'file and doc_type required' }, { status: 400 })
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const db = await createServiceClient()

  // Upload to Supabase Storage
  const uploadPath = `${docType}/${crypto.randomUUID()}/${file.name}`
  const { error: storageErr } = await db.storage
    .from('ai-docs')
    .upload(uploadPath, buffer, { contentType: file.type || 'application/octet-stream', upsert: false })

  if (storageErr) {
    console.error('[rag2/upload] storage error:', storageErr)
    return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const fileUrl = `${supabaseUrl}/storage/v1/object/ai-docs/${uploadPath}`

  // Insert upload record
  const { data: uploadRecord, error: insertErr } = await db
    .from('ai_rag2_uploads')
    .insert({ filename: file.name, url: fileUrl, doc_type: docType, size_bytes: file.size, status: 'pending' })
    .select('id')
    .single()

  if (insertErr || !uploadRecord) {
    console.error('[rag2/upload] upload record insert error:', insertErr)
    return NextResponse.json({ error: 'Failed to save upload record' }, { status: 500 })
  }

  const uploadId: string = uploadRecord.id

  // Extract text and chunk
  let text: string
  try {
    text = await extractText(buffer, file.name)
  } catch (err: any) {
    await db.from('ai_rag2_uploads').update({ status: 'error', error: err.message }).eq('id', uploadId)
    return NextResponse.json({ error: 'Text extraction failed' }, { status: 500 })
  }

  const chunks = chunkText(text)
  if (chunks.length === 0) {
    await db.from('ai_rag2_uploads').update({ status: 'error', error: 'No text extracted' }).eq('id', uploadId)
    return NextResponse.json({ error: 'No text content found in file' }, { status: 400 })
  }

  // Delete previous embeddings for this doc_type from uploads
  const { data: oldUploads } = await db
    .from('ai_rag2_uploads')
    .select('id')
    .eq('doc_type', docType)
    .neq('id', uploadId)
  if (oldUploads?.length) {
    const oldIds = oldUploads.map((u: any) => u.id)
    await db.from('ai_rag2_documents').delete().in('source_id', oldIds)
    await db.from('ai_rag2_uploads').delete().in('id', oldIds)
  }

  // Embed in batches of 50
  const embeddingRows: object[] = []
  for (let i = 0; i < chunks.length; i += 50) {
    const batch = chunks.slice(i, i + 50)
    const embeddings = await embedBatch(batch)
    for (let j = 0; j < batch.length; j++) {
      embeddingRows.push({
        source_id: uploadId,
        source_collection: docType,
        locale: 'en',
        content: batch[j],
        metadata: { doc_type: docType, filename: file.name, chunk_index: i + j },
        embedding: embeddings[j],
      })
    }
  }

  const { error: embedErr } = await db.from('ai_rag2_documents').insert(embeddingRows)
  if (embedErr) {
    await db.from('ai_rag2_uploads').update({ status: 'error', error: embedErr.message }).eq('id', uploadId)
    console.error('[rag2/upload] embed insert error:', embedErr)
    return NextResponse.json({ error: 'Embedding insert failed' }, { status: 500 })
  }

  await db.from('ai_rag2_uploads').update({ status: 'embedded' }).eq('id', uploadId)
  console.log(`[rag2/upload] ${file.name} → ${chunks.length} chunks → ${docType}`)
  return NextResponse.json({ uploadId, chunks: chunks.length })
}
```

- [ ] **Step 3: Add RAG2_UPLOAD_SECRET to .env.local**

Open `/Users/houtchinhfey/orienda/orienda_bong_both/.env.local` and add:
```
RAG2_UPLOAD_SECRET=<generate a random 32-char string>
```

Also add to Vercel env vars when deploying.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors in rag2 files

- [ ] **Step 5: Commit**

```bash
git add src/app/api/rag2/upload/route.ts package.json package-lock.json
git commit -m "feat(rag2): add file upload endpoint with pdf-parse, Supabase Storage, and embedding"
```

---

## Task 6: RAG2 vector search

**Files:**
- Create: `src/lib/rag2/vector-search.ts`

**Interfaces:**
- Consumes: `createServiceClient()` from `@/utils/supabase/server`
- Produces:
  ```typescript
  interface Rag2SearchResult { id: number; content: string; metadata: Record<string, unknown>; similarity: number }
  type SearchTarget = { collection: string; topK: number }
  embedQuery(text: string, openai: OpenAI): Promise<number[]>
  parallelSearch(embedding: number[], targets: SearchTarget[], locale: string): Promise<Rag2SearchResult[]>
  ```

- [ ] **Step 1: Create vector-search.ts**

```typescript
// src/lib/rag2/vector-search.ts
import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'

const EMBEDDING_MODEL = 'text-embedding-3-small'

export interface Rag2SearchResult {
  id: number
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export type SearchTarget = { collection: string; topK: number }

export async function embedQuery(text: string, openai: OpenAI): Promise<number[]> {
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text })
  return res.data[0].embedding
}

async function searchOne(
  embedding: number[],
  collection: string,
  locale: string,
  topK: number,
): Promise<Rag2SearchResult[]> {
  const db = await createServiceClient()
  const { data, error } = await db.rpc('match_ai_rag2_documents', {
    query_embedding: embedding,
    match_count: topK,
    filter: { source_collection: collection, locale },
  })
  if (error || !data) return []
  return data as Rag2SearchResult[]
}

export async function parallelSearch(
  embedding: number[],
  targets: SearchTarget[],
  locale: string,
): Promise<Rag2SearchResult[]> {
  const all: Rag2SearchResult[] = []

  await Promise.all(
    targets.map(async ({ collection, topK }) => {
      const results = await searchOne(embedding, collection, locale, topK)
      // Locale fallback: if < 3 results and locale != 'en', supplement with en
      if (results.length < 3 && locale !== 'en') {
        const enResults = await searchOne(embedding, collection, 'en', topK - results.length)
        // Only add en results not already in results (by id)
        const seen = new Set(results.map(r => r.id))
        for (const r of enResults) {
          if (!seen.has(r.id)) { results.push(r); seen.add(r.id) }
        }
      }
      all.push(...results)
    })
  )

  // Dedup by id, sort by similarity desc, top 15
  const seen = new Set<number>()
  return all
    .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 15)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/rag2/vector-search.ts
git commit -m "feat(rag2): add locale-aware vector search with en fallback"
```

---

## Task 7: RAG2 chat endpoint

**Files:**
- Create: `src/app/api/rag2/route.ts`

**Interfaces:**
- Consumes: all rag1 utilities reused directly + new `embedQuery`, `parallelSearch` from `@/lib/rag2/vector-search`
- In: POST `{ message: string, session_key?: string, locale?: string, user_id?: string }`
- Out: `{ output: string }`

The intent detection maps to `source_collection` values used in `ai_rag2_documents`. Reuse RAG1's `detectLanguage`, `validateInput`, `isGreeting`, `greetingReply`, `fetchHistory`, `formatHistory`, `buildMessages` as-is.

- [ ] **Step 1: Create rag2 detect-intent.ts**

RAG2 intent maps to `source_collection` names (different from RAG1's doc_type strings).

```typescript
// src/lib/rag2/detect-intent.ts
export type Rag2Collection =
  | 'doctors' | 'departments' | 'branches' | 'service_packages'
  | 'news' | 'health_tips' | 'careers' | 'doctor_talks'
  | 'promotions' | 'faqs' | 'price'

export type IntentTarget = { collection: Rag2Collection; topK: number }

const PATTERNS: Array<{ re: RegExp; collection: Rag2Collection; topK: number }> = [
  { re: /doctor|physician|specialist|surgeon|ob|gyn|pediatrician|vej|វេជ|医生|医师|专科/i, collection: 'doctors', topK: 6 },
  { re: /department|clinic|centre|center|unit|ward|spine|icu|nicu|division|មន្ទីរ|ផ្នែក|科室|科|部门/i, collection: 'departments', topK: 5 },
  { re: /branch|location|address|direction|hospital|map|how to get|ORD1|ORD2|orienda hospital|orienda clinic|សាខា|ទីតាំង|分院|地址|医院|诊所/i, collection: 'branches', topK: 4 },
  { re: /package|checkup|check.up|antenatal|prenatal|delivery|screening|women health|service package|health package|កញ្ចប់|ការពិនិត្យ|套餐|检查/i, collection: 'service_packages', topK: 6 },
  { re: /news|announcement|update|article|latest|ព័ត៌មាន|ថ្មី|新闻|公告|最新/i, collection: 'news', topK: 4 },
  { re: /health tip|health advice|wellness|lifestyle|diet|nutrition|exercise|tips|ចំណែក|健康|养生|建议|小贴士/i, collection: 'health_tips', topK: 4 },
  { re: /career|job|vacancy|hiring|position|apply|employment|recruit|ការងារ|ជ្រើស|职位|招聘|工作/i, collection: 'careers', topK: 4 },
  { re: /doctor talk|seminar|talk|webinar|youtube|event|speaker|ការពិភាក្សា|讲座|活动|研讨/i, collection: 'doctor_talks', topK: 3 },
  { re: /promot|offer|discount|deal|special|sale|ប្រូម៉ូ|ការលើក|优惠|折扣|活动/i, collection: 'promotions', topK: 4 },
  { re: /price|cost|fee|rate|how much|affordable|charge|rate|budget|ថ្លៃ|តម្លៃ|价格|费用|多少钱/i, collection: 'price', topK: 6 },
  { re: /faq|question|how|what|why|when|who|ques|answer|query|ques|tell me|explain|ពន்?|ហើ|什么|怎么|为什么|告诉/i, collection: 'faqs', topK: 5 },
]

const FALLBACK: IntentTarget[] = [
  { collection: 'faqs', topK: 4 },
  { collection: 'departments', topK: 3 },
  { collection: 'branches', topK: 3 },
]

export function detectRag2Intent(message: string): IntentTarget[] {
  const matched: IntentTarget[] = []
  const seen = new Set<Rag2Collection>()
  for (const { re, collection, topK } of PATTERNS) {
    if (re.test(message) && !seen.has(collection)) {
      matched.push({ collection, topK })
      seen.add(collection)
      if (matched.length >= 3) break
    }
  }
  return matched.length > 0 ? matched : FALLBACK
}
```

- [ ] **Step 2: Create rag2/route.ts**

```typescript
// src/app/api/rag2/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'
import { detectLanguage } from '@/lib/rag1/detect-language'
import { fetchHistory, formatHistory } from '@/lib/rag1/fetch-history'
import { buildMessages } from '@/lib/rag1/build-prompt'
import { validateInput, isGreeting, greetingReply } from '@/lib/rag1/validate-input'
import { detectRag2Intent } from '@/lib/rag2/detect-intent'
import { embedQuery, parallelSearch } from '@/lib/rag2/vector-search'

export const runtime = 'nodejs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { message, session_key, locale, user_id } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  const language = detectLanguage(message)

  const validation = validateInput(message, language)
  if (!validation.valid) {
    return NextResponse.json({ output: validation.reply }, { status: 200 })
  }

  // Session upsert + user message save
  let sessionId: string | null = null
  if (session_key) {
    try {
      const db = await createServiceClient()
      const { data, error: sessErr } = await db
        .from('ai_chat_sessions')
        .upsert(
          { session_key, locale: locale ?? 'en', user_id: user_id ?? null },
          { onConflict: 'session_key', ignoreDuplicates: false },
        )
        .select('id')
        .single()
      if (sessErr) console.error('[rag2] session upsert error:', sessErr)
      sessionId = data?.id ?? null
      if (sessionId) {
        await db.from('ai_chat_messages').insert({ session_id: sessionId, role: 'user', content: message.trim() })
      }
    } catch (e) {
      console.error('[rag2] session/msg insert error:', e)
    }
  }

  // Greeting short-circuit
  if (isGreeting(message, language)) {
    const reply = greetingReply(language)
    if (sessionId) {
      try {
        const db = await createServiceClient()
        await db.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: reply })
      } catch (e) { console.error('[rag2] greeting save error:', e) }
    }
    return NextResponse.json({ output: reply }, { status: 200 })
  }

  // RAG pipeline
  let reply: string
  try {
    const intent = detectRag2Intent(message)
    const [history, embedding] = await Promise.all([
      sessionId ? fetchHistory(sessionId) : Promise.resolve([]),
      embedQuery(message, openai),
    ])
    const searchLocale = language === 'km' ? 'km' : language === 'zh' ? 'zh' : 'en'
    const chunks = await parallelSearch(embedding, intent, searchLocale)
    const msgs = buildMessages(message, language, formatHistory(history), chunks)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: msgs,
      temperature: 0.3,
      max_tokens: 800,
    })
    reply = completion.choices[0]?.message?.content?.trim()
      ?? "Sorry, I couldn't get a response right now. Please try again in a moment."
  } catch (err: any) {
    console.error('[rag2] RAG error:', err?.message ?? err)
    reply = "Sorry, I couldn't get a response right now. Please try again in a moment."
  }

  // Save assistant reply
  if (sessionId && reply) {
    try {
      const db = await createServiceClient()
      await db.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: reply })
    } catch (e) { console.error('[rag2] assistant msg insert error:', e) }
  }

  return NextResponse.json({ output: reply }, { status: 200 })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/rag2/detect-intent.ts src/app/api/rag2/route.ts
git commit -m "feat(rag2): add RAG2 chat endpoint with locale-aware vector search"
```

---

## Task 8: Verify and push

- [ ] **Step 1: TypeScript check**

```bash
cd /Users/houtchinhfey/orienda/orienda_bong_both
npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors in any `src/lib/rag2/` or `src/app/api/rag2/` files.

- [ ] **Step 2: Dev server smoke test**

```bash
npm run dev
```

In a new terminal, test ingest signature reject:
```bash
curl -s -X POST http://localhost:3000/api/rag2/ingest \
  -H "Content-Type: application/json" \
  -H "X-Payload-Signature: badsig" \
  -d '{"event":"published","collection":"faqs","docId":1,"timestamp":"2026-06-26T00:00:00Z"}'
```
Expected: `{"error":"Unauthorized"}`

Test chat endpoint:
```bash
curl -s -X POST http://localhost:3000/api/rag2 \
  -H "Content-Type: application/json" \
  -d '{"message":"What departments does Orienda have?"}'
```
Expected: `{"output":"..."}` with a non-empty response (uses ai_rag2_documents — may be empty until Payload webhook fires or data is seeded)

- [ ] **Step 3: Add WEBHOOK_SECRET and RAG2_UPLOAD_SECRET to Vercel**

Go to Vercel → orienda_bong_both project → Settings → Environment Variables. Add:
- `RAG2_UPLOAD_SECRET` (same value as in `.env.local`)

`WEBHOOK_SECRET` should already be there from the existing Payload webhook setup.

- [ ] **Step 4: Push branch**

```bash
git push origin rag2-fei
```

- [ ] **Step 5: Register ingest URL in Payload admin**

1. Go to Payload admin → Settings → Operational Settings
2. Add to Webhook Targets: `https://<your-vercel-domain>/api/rag2/ingest`
3. Save
4. Publish any FAQ in Payload admin → check Vercel logs for `[rag2/ingest] published faqs/...`

---

## Post-implementation: Seed existing data

After the ingest endpoint is live, to embed all existing published records, run this from Payload admin — re-publish each collection's records, OR use the Payload API to trigger bulk re-publish. Alternatively, write a one-off seed script that calls `ingestRecord()` for every published record in each collection.

## Frontend switch (when ready)

Change frontend from `/api/rag1` to `/api/rag2` — same request/response format `{ output }`.
