# RAG Pipeline — Replace n8n with In-Code AI Chat

**Date:** 2026-06-25  
**Status:** Approved  
**Scope:** Replace n8n webhook with inline RAG inside existing Next.js route

---

## Problem

`POST /api/ai-chat` currently forwards messages to n8n at `n8n.new-wave.io`. n8n requires self-hosted infra. Goal: eliminate n8n entirely, run RAG directly in the route handler.

---

## Architecture

Modify **existing** `src/app/api/ai-chat/route.ts` POST handler only.  
Add utilities in `src/lib/rag/`.  
No new routes. No frontend changes. Same response format.

```
POST /api/ai-chat
  { message, session_key, locale, user_id }
         │
         ├─ [keep] Validate input (message required)
         ├─ [keep] Upsert ai_chat_sessions
         ├─ [keep] Insert user msg → ai_chat_messages
         │
         ├─ [NEW] detect-language     → "km" | "zh" | "en"
         ├─ [NEW] fetch-history       → last 10 rows ai_chat_messages WHERE session_id
         ├─ [NEW] detect-intent       → doc_types[] from keyword map
         ├─ [NEW] embed query         → OpenAI text-embedding-3-small (1536d)
         ├─ [NEW] parallel VS search  → match_ai_orienda_documents per doc_type
         ├─ [NEW] merge results       → top 15 chunks by similarity
         ├─ [NEW] build prompt        → system + history + chunks + message
         ├─ [NEW] chat completion     → gpt-4.1-mini → reply string
         │
         ├─ [keep] Insert AI reply → ai_chat_messages
         └─ [keep] Return { output: reply }
```

---

## New Files

```
src/lib/rag/
  detect-language.ts    regex: km (ក-៿) / zh (一-鿿) / en default
  detect-intent.ts      keyword map → doc_types[] (see below)
  fetch-history.ts      query ai_chat_messages, format as "User: ...\nAssistant: ..."
  vector-search.ts      embed + call match_ai_orienda_documents RPC
  build-prompt.ts       system prompt + history block + context chunks + user message
```

---

## Intent Classifier (keyword map, no AI call)

| Keywords (en/km/zh) | doc_types |
|---|---|
| doctor / គ្រូពេទ្យ / 医生 | `["doctor"]` |
| price / តម្លៃ / 价格 / cost / fee / ថ្លៃ | `["price"]` |
| package / promotion / ជាង / ប្រូម៉ូសិន | `["promotion_package"]` |
| service / សេវា / 服务 | `["service"]` |
| department / ឯកទេស / 科室 / specialist | `["department"]` |
| contact / phone / លេខ / ទូរស័ព្ទ / 电话 | `["contact"]` |
| branch / location / សាខា / ទីតាំង / 地址 | `["branch"]` |
| faq / question / ⁇ | `["faq"]` |
| about / orienda / hospital / មន្ទីរពេទ្យ | `["about"]` |
| policy / rule / គោលការណ៍ | `["policy"]` |
| brand / 品牌 | `["brand"]` |
| *(no match)* | `["faq", "about", "service"]` |

Multi-match allowed: "price of doctor" → `["price", "doctor"]`.

---

## TopK per doc_type

| doc_type | topK |
|---|---|
| doctor | 6 |
| price | 8 |
| promotion_package | 8 |
| service | 6 |
| department | 5 |
| faq | 6 |
| contact | 4 |
| branch | 4 |
| about | 4 |
| policy | 4 |
| brand | 3 |

---

## Supabase Vector Search

Uses existing `match_ai_orienda_documents` RPC on client Supabase (`NEXT_PUBLIC_SUPABASE_URL`).  
Calls with `createServiceClient()` (existing utility, uses `SUPABASE_SERVICE_ROLE_KEY`).

```sql
-- Already deployed, no SQL changes needed
SELECT id, content, metadata, similarity
FROM match_ai_orienda_documents(query_embedding, match_count, filter)
-- filter: {"doc_type": "<type>"}
```

---

## System Prompt Rules (mirrors n8n)

- LANGUAGE: reply in detected language only (km/zh/en). No mixing.
- TOOL ROUTING: answered from retrieved context. If no context → "I don't have that info."
- ANSWER: concise, factual, cite doc if relevant.
- BRANCH: ORD1 = clinic, ORD2 = hospital. Price only for ORD2.
- CONTACT: Hotline 16 593 789 / 12 593 789.

---

## Models

| Use | Model |
|---|---|
| Embedding | `text-embedding-3-small` (1536d) |
| Chat | `gpt-4.1-mini` |

---

## New Dependency

```bash
npm install openai
```

---

## New Env Var

```bash
# .env.local
OPENAI_API_KEY=sk-proj-...
```

Existing vars reused — no new Supabase config needed.

---

## Out of Scope

- Streaming responses (frontend refactor needed — future task)
- Re-embedding docs (already embedded with text-embedding-3-small in Supabase)
- Google Gemini swap (possible later, swap agent only — keep OpenAI for embeddings)

---

## Success Criteria

1. `POST /api/ai-chat` returns `{ output: reply }` without calling n8n
2. Response language matches input language (km/zh/en)
3. Retrieved context comes from correct doc_type(s) for the query
4. Session history injected into prompt for multi-turn conversations
5. Existing GET and DELETE handlers unchanged
