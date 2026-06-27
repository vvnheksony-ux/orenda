# Orienda AI Chat — 3 Systems Summary

> Last updated: 2026-06-27

---

## Overview

There are 3 AI chat systems. Only **RAG2 is active** (as of 2026-06-27).

| # | Name | Status | Entry point |
|---|---|---|---|
| 1 | **n8n Only** | ❌ Retired | n8n webhook directly |
| 2 | **RAG1** | ⚠️ Legacy (kept, not used) | `POST /api/rag1` |
| 3 | **RAG2** | ✅ Active | `POST /api/rag2` via `POST /api/ai-chat` |

Frontend always calls `POST /api/ai-chat` → which now proxies to RAG2.

---

## System 1 — n8n Only (Retired)

### What it was
Entire AI logic lived inside an n8n workflow. No custom code.

### How it worked
```
User → n8n webhook
         ├── fetch session history from Supabase
         ├── send to OpenAI with static system prompt
         └── return reply → User
```

### Problems
- No vector search — AI had no knowledge of Orienda content
- Static prompt only — AI made up answers
- Hard to update — had to edit n8n nodes
- No embedding pipeline — no admin content management

### Status
Replaced entirely. No longer in use.

---

## System 2 — RAG1 (Legacy, kept but not used)

### What it is
First code-based RAG. n8n still existed as the entry point but the actual AI logic moved into Next.js code.

### Entry point
```
POST /api/rag1
```

### Input
```json
{
  "message": "string",
  "session_key": "string",
  "locale": "en | km | zh",
  "user_id": "uuid | null"
}
```

### Output
```json
{ "output": "AI reply string" }
```

### How it works
```
User message
  → detectLanguage (Unicode range check: km/zh/en)
  → validateInput (spam, bad words, too long, symbols, URLs)
  → upsert ai_chat_sessions + save user msg to ai_chat_messages
  → isGreeting? → return greeting (no GPT)
  → detectIntent (regex keywords → doc_type list)
  → [parallel] embed message (text-embedding-3-small) + fetch history
  → parallelSearch → match_ai_orienda_documents RPC (per doc_type)
  → buildMessages (system prompt + history + context + message)
  → GPT-4.1-mini → reply
  → save reply to ai_chat_messages
  → return { output }
```

### Content source
`public.ai_orienda_documents` — **static 270 chunks** from markdown files.
Seeded once manually. Never auto-updates. If content changes → must re-seed manually.

### Doc types (11)
```
doctor, price, promotion_package, service,
department, contact, branch, faq,
about, policy, brand
```

### No locale support
Single embedding per doc — no km/zh variants. All search in English only.

### Why retired
- Static content (270 chunks) — can't update without re-seeding
- No admin UI — developers must run scripts to update content
- No locale-aware search
- No uploaded file support
- No price list support

---

## System 3 — RAG2 (Active ✅)

### What it is
Full code-based RAG pipeline. Admin manages all content via Payload CMS and admin panel. No n8n involved in AI logic.

### Entry point (from frontend)
```
POST /api/ai-chat     ← frontend always calls this
  └── proxies to /api/rag2
```

### Direct call (same result, skips proxy)
```
POST /api/rag2
```

### Input
```json
{
  "message": "string",
  "session_key": "string",
  "locale": "en | km | zh",
  "user_id": "uuid | null"
}
```

### Output (non-streaming)
```json
{ "output": "AI reply string" }
```

### Output (streaming) — `POST /api/rag2?stream=true`
```
data: {"text":"Orienda"}
data: {"text":" has"}
data: {"text":" 10 doctors..."}
data: [DONE]
```
SSE stream. Frontend must handle `EventSource` or `ReadableStream`. n8n cannot use this.

### How it works
```
User message
  → detectLanguage (Unicode check: km/zh/en)
  → validateInput (spam / bad words / too long / symbols / URLs / nonsense)
    └── REJECTED → return violation reply immediately (no GPT, no DB write)
  → upsert ai_chat_sessions (by session_key + user_id)
  → insert user msg → ai_chat_messages
  → isGreeting? → return greeting reply (no vector search, no GPT)
  → detectRag2Intent (regex → 1-3 collection targets, topK per target)
      "list all doctors" → topK boosted 6 → 20
      no match → fallback: [faqs:4, departments:3, branches:3, other:3]
  → [parallel]:
      embedQuery (text-embedding-3-small → 1536-float vector)
      fetchHistory (last N messages from ai_chat_messages)
  → parallelSearch (per intent target):
      match_ai_rag2_documents RPC (filter: source_collection + locale)
      if locale=km/zh and results < 3 → fallback to locale=en
      dedup + sort by cosine similarity → top 15 chunks
  → buildMessages:
      [system] Orienda identity + tone + language rules + answer rules
      [user]   PREVIOUS CONVERSATION + RETRIEVED CONTEXT + CURRENT MESSAGE + [detected language]
  → GPT-4.1-mini (temp: 0.3, max_tokens: 800)
  → save reply → ai_chat_messages
  → return { output }
```

### Content sources (3 ways content gets into AI)

| Source | How | Collections |
|---|---|---|
| Payload CMS publish | webhook → `/api/rag2/ingest` → auto-embed | doctors, departments, branches, service_packages, news, health_tips, careers, doctor_talks, promotions, faqs |
| Admin: Static Docs | Admin panel → type/upload → Save & Embed | about, contact, policy, brand |
| Admin: Upload File | Admin panel → upload PDF/DOCX/TXT | other |
| Admin: Price Lists | Admin panel → import Excel | price |

### All doc types / source_collections (16)
```
doctors          departments      branches         service_packages
news             health_tips      careers          doctor_talks
promotions       faqs             price
about            contact          policy           brand
other
```

### DB tables
| Table | Purpose |
|---|---|
| `ai_rag2_documents` | All embeddings (vectors live here) |
| `ai_rag2_uploads` | Uploaded file records |
| `ai_static_docs` | Static doc content (about/contact/policy/brand) |
| `price_lists` | Price list rows |
| `ai_chat_sessions` | One row per conversation |
| `ai_chat_messages` | All messages (user + assistant + thumbs feedback) |
| `ai_orienda_documents` | RAG1 legacy table (270 chunks, do not delete) |

### Special auto-generated chunks
- `source_id = 'doctors-summary'` — rebuilt after every doctor publish/delete/unpublish. Content: "Orienda has N doctors: 1. Dr. X — Specialty ...". Lets AI accurately count all doctors.

### Locale behavior
- Each Payload record embedded in 3 locales: en, km, zh
- Search filters by user's detected locale first
- If results < 3 → fallback to en results (fills gaps)

### Webhook (Payload → RAG2)
```
POST /api/rag2/ingest
Headers: X-Payload-Signature: <HMAC-SHA256>
Body: { event: "published" | "deleted", collection: "doctors", docId: 42, timestamp: "..." }
```
Fires automatically when admin publishes or deletes a Payload record.

---

## Current Flow (Active)

```
Frontend chat widget
    │
    ▼  POST /api/ai-chat  { message, session_key, locale, user_id }
    │
    ▼  POST /api/rag2     (internal proxy, same server)
    │
    ├── validate + session
    ├── intent detect → which collections to search
    ├── embed query + fetch history (parallel)
    ├── vector search → ai_rag2_documents
    ├── GPT-4.1-mini
    └── { output }  → back to frontend

Payload CMS admin publishes doctor
    │
    ▼  POST /api/rag2/ingest  (webhook)
    │
    ├── embed in 3 locales → ai_rag2_documents
    └── rebuild doctors-summary chunk
```

---

## Other Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/ai-chat` | Load user's chat history (sessions + messages + thumbs) |
| `DELETE /api/ai-chat` | Delete one session (user-initiated) |
| `POST /api/ai-chat/feedback` | Rate a message: `{ message_id, thumbs: "up"\|"down"\|null }` |
| `POST /api/rag2/cleanup` | Admin: delete sessions older than N days `{ days: 30 }` |
| `POST /api/rag1` | Legacy RAG1 — still works, not used |

---

## What We Are NOT Using Anymore

- n8n for AI logic → removed. n8n webhook URL (`https://n8n.new-wave.io/webhook/orienda_ai_agent`) no longer called.
- RAG1 (`/api/rag1`) → still in code, not called by anything.
- `ai_orienda_documents` table → RAG1 data, kept but not searched by RAG2.
