# RAG Dev Guide — Orienda AI Chat

## What is RAG?

RAG = Retrieval-Augmented Generation.

Instead of asking GPT to answer from its own knowledge (it knows nothing about Orienda), we:
1. Store Orienda's data as vectors (embeddings) in Supabase
2. When user asks a question → find the most relevant stored data
3. Feed that data to GPT as context → GPT answers using real Orienda info

---

## RAG1 vs RAG2 — Summary

| | RAG1 | RAG2 |
|---|---|---|
| **Branch** | `rag1-fei` | `rag2-fei` |
| **Endpoint** | `POST /api/rag1` | `POST /api/rag2` |
| **Data source** | Static markdown files (manually written) | Live Payload CMS data (doctors, FAQs, news, etc.) + uploaded PDFs |
| **Supabase table** | `public.ai_orienda_documents` | `public.ai_rag2_documents` |
| **Embedding model** | `text-embedding-3-small` | `text-embedding-3-small` |
| **Chat model** | `gpt-4.1-mini` | `gpt-4.1-mini` |
| **Locale-aware** | No (all mixed in one table) | Yes (en/km/zh stored separately, with fallback) |
| **Auto-update** | No — must re-run Python script manually | Yes — publish in Payload → auto-embeds |
| **Status** | Done, working | Done, needs data seeded |

---

## RAG1 — How It Works

### Data
11 markdown files manually written in `orienda_scrape/n8n_orienda_doc_type/01_embed_primary/`:
- `doctor.md`, `faq.md`, `service.md`, `department.md`, `price.md`, `branch.md`, `contact.md`, `about.md`, `promotion_package.md`, `policy.md`, `brand.md`

These were embedded using `reembed_client.py` and stored in `ai_orienda_documents`.

### How to re-embed (if data changes)
```bash
cd /Users/houtchinhfey/orienda/orienda_scrape
python3 reembed_client.py
```
This clears the table and re-embeds all 11 files.

### Request / Response
```json
// POST /api/rag1
// Body:
{ "message": "What doctors do you have?", "session_key": "abc123", "locale": "en", "user_id": "uuid" }

// Response:
{ "output": "Orienda has Dr. Sok Vanna specializing in..." }
```

### Flow
```
User message
  → validate (bad words, spam, nonsense)
  → detect language (en/km/zh)
  → if greeting → return greeting reply immediately
  → detect intent (which doc_type to search)
  → embed message with text-embedding-3-small
  → vector search in ai_orienda_documents
  → build prompt with context
  → gpt-4.1-mini → reply
  → save to session history
```

---

## RAG2 — How It Works

### Data
Comes from two sources:

**Source A — Payload CMS (auto)**
When admin publishes/deletes a record in Payload admin panel:
- Payload fires a webhook → `POST /api/rag2/ingest`
- Handler fetches the record from `payload.*` database schema
- Formats it to text, embeds all 3 locales (en, km, zh)
- Stores in `ai_rag2_documents`

Collections supported: Doctors, Departments, Branches, Service Packages, News, Health Tips, Careers, Doctor Talks, Promotions, FAQs

**Source B — File Upload (manual)**
Admin uploads a PDF/TXT/MD file via `POST /api/rag2/upload`:
- File saved to Supabase Storage bucket `ai-docs`
- Text extracted, chunked, embedded
- Stored in `ai_rag2_documents`
- Upload record tracked in `ai_rag2_uploads`

Use for: price lists, policy docs, anything not in Payload

### Request / Response
Same format as RAG1:
```json
// POST /api/rag2
// Body:
{ "message": "Tell me about the spine department", "session_key": "abc123", "locale": "km", "user_id": "uuid" }

// Response:
{ "output": "..." }
```

### Flow
```
User message
  → same validation + language detection as RAG1
  → if greeting → return immediately
  → detect intent → maps to source_collection (doctors, departments, etc.)
  → embed message
  → vector search in ai_rag2_documents filtered by source_collection + locale
  → if km/zh results < 3 → also search en as fallback
  → gpt-4.1-mini → reply
  → save to session history
```

### Locale behavior
- 1 Payload record = 3 rows in `ai_rag2_documents` (en, km, zh)
- If admin only filled English → km/zh rows use en text as fallback
- User asks in Khmer → searches km rows first → falls back to en if needed

---

## Database Tables

### `public.ai_orienda_documents` (RAG1)
| Column | Type | Notes |
|---|---|---|
| id | bigint | PK |
| content | text | chunk text |
| metadata | jsonb | doc_type, branch, language |
| embedding | vector(1536) | |

RPC: `match_ai_orienda_documents(query_embedding, match_count, filter)`

### `public.ai_rag2_documents` (RAG2)
| Column | Type | Notes |
|---|---|---|
| id | bigint | PK |
| source_id | text | Payload record ID (as string) or upload UUID |
| source_collection | text | 'doctors', 'faqs', 'price', etc. |
| locale | text | 'en', 'km', 'zh' |
| content | text | formatted text |
| metadata | jsonb | |
| embedding | vector(1536) | |

RPC: `match_ai_rag2_documents(query_embedding, match_count, filter)`

### `public.ai_rag2_uploads` (RAG2 file uploads)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| filename | text | original filename |
| url | text | Supabase Storage URL |
| doc_type | text | e.g. 'price' |
| status | text | 'pending' / 'embedded' / 'error' |

### `public.ai_chat_sessions` + `public.ai_chat_messages` (shared)
Stores conversation history. Used by both RAG1 and RAG2.

---

## Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-proj-...          # OpenAI — embedding + chat
DATABASE_URL=postgresql://...        # Payload CMS postgres (payload.* schema)
NEXT_PUBLIC_SUPABASE_URL=...         # Client Supabase URL
SUPABASE_SERVICE_ROLE_KEY=...        # Client Supabase — write to ai_* tables
WEBHOOK_SECRET=...                   # Signs Payload webhook requests
RAG2_INGEST_URL=http://localhost:3000/api/rag2/ingest  # local dev
RAG2_UPLOAD_SECRET=orienda-upload-2026  # protects /api/rag2/upload
```

---

## File Structure

```
src/
├── lib/
│   ├── rag1/
│   │   ├── detect-language.ts      detect en/km/zh
│   │   ├── detect-intent.ts        keywords → doc_type
│   │   ├── fetch-history.ts        load chat history from DB
│   │   ├── vector-search.ts        embed query + search ai_orienda_documents
│   │   ├── build-prompt.ts         system prompt + context injection
│   │   └── validate-input.ts       spam/bad words/greeting detection
│   └── rag2/
│       ├── chunk-text.ts           split long text into chunks
│       ├── verify-webhook.ts       HMAC signature check
│       ├── detect-intent.ts        keywords → source_collection
│       ├── ingest-record.ts        fetch payload record → format → embed → save
│       ├── vector-search.ts        search ai_rag2_documents with locale fallback
│       └── format/
│           ├── format-doctor.ts    SQL + text formatter for doctors
│           ├── format-faq.ts       SQL + text formatter for FAQs
│           ├── ...                 (one file per collection)
│           └── index.ts            maps webhook collection name → formatter
└── app/api/
    ├── rag1/route.ts               POST /api/rag1 — chat endpoint
    └── rag2/
        ├── route.ts                POST /api/rag2 — chat endpoint
        ├── ingest/route.ts         POST /api/rag2/ingest — Payload webhook
        └── upload/route.ts         POST /api/rag2/upload — file upload
```

---

## Current Status

### RAG1
- ✅ All code done
- ✅ 270 chunks embedded in `ai_orienda_documents`
- ✅ Endpoint working at `/api/rag1`
- ⬜ Frontend not switched yet (still calls n8n webhook)

### RAG2
- ✅ All code done
- ⬜ `ai_rag2_documents` is empty — no data yet
- ⬜ Need to seed: publish existing Payload records to trigger embedding
- ⬜ `ai-docs` Supabase Storage bucket created (user done)
- ⬜ `RAG2_INGEST_URL` added to `.env.local` (user needs to do)
- ⬜ Frontend not switched yet

### To go live
1. Add all env vars to Vercel
2. Deploy
3. In Payload admin — bulk re-publish all collections to trigger RAG2 embedding
4. Test `/api/rag2` returns real data
5. Switch frontend from n8n → `/api/rag2`

---

## How to Upload a Price List (RAG2)

```bash
curl -X POST https://your-domain.com/api/rag2/upload \
  -H "X-Upload-Secret: orienda-upload-2026" \
  -F "file=@price-list.pdf" \
  -F "doc_type=price"
```

Response: `{ "uploadId": "uuid", "chunks": 42 }`
