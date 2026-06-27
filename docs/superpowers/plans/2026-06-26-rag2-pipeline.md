# RAG2 Pipeline — Implementation Record

> Status: **COMPLETE** as of 2026-06-27
> Branch: `pheaktra-supabase` (merged from `rag2-fei`)
> Full dev guide: `/docs/RAG-DEV-GUIDE.md`

---

## What Was Built

A complete admin-driven RAG pipeline for the Orienda AI chatbot.

Three ways content gets into the AI:
1. **Payload CMS auto-ingest** — publish a record → webhook → auto-embeds
2. **Static Docs** — admin types/uploads content for about/contact/policy/brand
3. **File Upload** — admin uploads any PDF/DOCX/TXT file → extracted + embedded

All embeddings land in `public.ai_rag2_documents` (vector table in Supabase).
Chat endpoint: `POST /api/rag2` — locale-aware, session-aware, intent-aware.

---

## What Was Completed

### Core RAG2 Pipeline
- [x] `public.ai_rag2_documents` table + RPC + indexes
- [x] `public.ai_rag2_uploads` table (with title, description, error columns)
- [x] `public.ai_static_docs` table
- [x] `public.price_lists` table
- [x] `src/lib/rag2/chunk-text.ts`
- [x] `src/lib/rag2/verify-webhook.ts`
- [x] `src/lib/rag2/detect-intent.ts` (doctors, departments, branches, service-packages, news, health-tips, careers, doctor-talks, promotions, faqs, about, contact, policy, brand, price, other)
- [x] `src/lib/rag2/ingest-record.ts`
- [x] `src/lib/rag2/vector-search.ts` (locale fallback: km/zh → en)
- [x] `src/lib/rag2/format/` — 10 formatters + index

### API Routes
- [x] `POST /api/rag2` — chat endpoint (GPT-4.1-mini + vector search + session history)
- [x] `POST /api/rag2/ingest` — Payload webhook receiver (HMAC verified)
- [x] `POST /api/rag2/upload` — legacy secret-protected file upload
- [x] `POST /api/admin/ai-upload` — admin file upload (session auth)
- [x] `DELETE /api/admin/ai-upload/[id]` — delete upload + storage file + embeddings
- [x] `PUT /api/admin/ai-static-docs` — save + embed static doc
- [x] `POST /api/admin/ai-static-docs/extract` — extract text from file (no embed)
- [x] `POST/GET /api/admin/ai-price-lists` — price list CRUD
- [x] `POST /api/admin/ai-price-lists/import` — bulk Excel import
- [x] `GET /api/admin/ai-price-lists/template` — blank Excel template

### Admin Panel (Payload CMS custom views)
- [x] **Upload File page** — upload PDF/DOCX/TXT/MD with title+description, status tracking, inline preview modal, delete with storage cleanup
- [x] **Static Docs page** — tabs (About/Contact/Policy/Brand), per-locale, edit/save/embed, "Append from file" button, leave-guard
- [x] **Price Lists page** — price CRUD + import + template download
- [x] **AI Chat Bot sidebar group** — above Systems in nav

### UI / Navigation Fixes
- [x] Sidebar collapse/expand toggle (portal to body, z-index 21)
- [x] Toggle hidden behind all overlays (CSS `:has()` — Payload modals, drawers, custom modals)
- [x] All custom modals (ConfirmModal, FilePreviewModal) portal to body to fix stacking context
- [x] Active route state persists on collection sub-pages
- [x] Sidebar scroll position preserved across navigation

### Supabase Storage
- [x] Bucket `ai-docs` created (public)
- [x] RLS policies: service role full access + public read
- [x] Filename sanitization (spaces → underscores, safe chars only)
- [x] `getPublicUrl()` used for URL generation (not manual concatenation)

### Embedding Behavior
- [x] Static docs: delete-then-reinsert on every save (no stale embeddings)
- [x] File upload: chunk text (1000 chars / 200 overlap) → embed each chunk separately
- [x] Scanned PDF fallback: embed title+description if no text extractable
- [x] Delete upload → cleans up embeddings + DB record + storage file

---

## Architecture Summary

```
Payload CMS publish/delete
    └─► POST /api/rag2/ingest (HMAC verified)
            └─► ingest-record.ts
                    ├─► SQL query on payload.* schema
                    ├─► format text (format/{collection}.ts)
                    ├─► OpenAI embed (×3 locales)
                    └─► upsert ai_rag2_documents

Admin → Upload File page
    └─► POST /api/admin/ai-upload
            ├─► Supabase Storage upload (ai-docs bucket)
            ├─► extract text (pdf-parse / mammoth)
            ├─► chunk + embed
            └─► insert ai_rag2_documents (source_collection='other')

Admin → Static Docs page
    └─► PUT /api/admin/ai-static-docs
            ├─► upsert ai_static_docs
            ├─► delete old ai_rag2_documents rows
            └─► insert new embedding (if content non-empty)

Admin → Price Lists page
    └─► POST /api/admin/ai-price-lists
            └─► insert price_lists + embed → ai_rag2_documents (source_collection='price')

User chat message
    └─► n8n webhook
            └─► POST /api/rag2
                    ├─► detect locale + intent
                    ├─► embed message
                    ├─► match_ai_rag2_documents RPC (locale + source_collection filter)
                    ├─► GPT-4.1-mini
                    └─► ai_chat_messages insert
```

---

## Key Technical Decisions

**Why portal for custom modals?**
Payload's admin layout has ancestors with `overflow:hidden` which creates CSS stacking contexts. Modals rendered inside the React tree get their z-index trapped. Portal to `document.body` puts them in root stacking context where `z-index:9999` actually wins over the toggle at `z-index:21`.

**Why delete-before-reinsert for static docs?**
If admin clears content and saves empty, the old embedding would remain and the AI would still answer from it. Always deleting first means empty save = embedding gone.

**Why store title+description in uploads?**
Scanned PDFs have no extractable text. The description becomes the embedding content so the AI can find the document even if it can't read it.

**Why sanitize filenames before storage upload?**
Supabase Storage URLs with spaces (`%20`) break the `getPublicUrl()` return value and cause 404 in some browsers/iframes. Replacing spaces with underscores makes URLs safe.

---

## Pending / Future Work

| Item | Priority | Notes |
|---|---|---|
| Run SQL migration for title/description/error columns | HIGH | `supabase/migrations/add_upload_title_description.sql` |
| Bulk re-publish Payload records to seed ai_rag2_documents | HIGH | Do once after deploy — triggers webhook per record |
| AI Agent for intelligent chat | NEXT | Multi-tool agent replacing simple RAG search |
| Switch frontend from n8n → direct `/api/rag2` | LOW | n8n works, switching is optional |
| OCR for scanned PDFs | LOW | Use description fallback for now; full OCR requires self-hosted server (not Vercel) |

---

## Files Changed (from rag2-fei → pheaktra-supabase)

Key files added/modified:

```
src/app/api/admin/ai-upload/route.ts
src/app/api/admin/ai-upload/[id]/route.ts
src/app/api/admin/ai-static-docs/route.ts
src/app/api/admin/ai-static-docs/extract/route.ts
src/app/api/admin/ai-price-lists/route.ts
src/app/api/admin/ai-price-lists/[id]/route.ts
src/app/api/admin/ai-price-lists/import/route.ts
src/app/api/admin/ai-price-lists/template/route.ts
src/payload/admin/components/ai-chat-bot/AIChatBotUpload.tsx
src/payload/admin/components/ai-chat-bot/AIChatBotUploadView.tsx
src/payload/admin/components/ai-chat-bot/AIChatBotStaticDocs.tsx
src/payload/admin/components/ai-chat-bot/AIChatBotStaticDocsView.tsx
src/payload/admin/components/ai-chat-bot/AIChatBotPriceLists.tsx
src/payload/admin/components/navigation/OriendaPayloadNavClient.tsx
src/payload/admin/components/providers/OriendaAdminStyle.tsx
src/payload/admin/components/ui/ConfirmModal.tsx
supabase/migrations/add_upload_title_description.sql
```
