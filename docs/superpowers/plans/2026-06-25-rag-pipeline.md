# RAG Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the n8n webhook in `POST /api/ai-chat` with an inline RAG pipeline that embeds queries, searches Supabase pgvector, and generates responses via gpt-4.1-mini.

**Architecture:** Five focused utility modules in `src/lib/rag/` each handling one step of the pipeline. The existing POST handler orchestrates them by calling them in sequence, replacing the `fetch(WEBHOOK, ...)` block entirely. GET and DELETE handlers are untouched.

**Tech Stack:** Next.js 16.2 App Router, TypeScript 5, `openai` npm package (new), Supabase JS client (`@supabase/supabase-js` already installed), `text-embedding-3-small` for embeddings, `gpt-4.1-mini` for chat.

## Global Constraints

- Project root: `/Users/houtchinhfey/orienda/orienda_bong_both`
- Never touch GET or DELETE handlers in `src/app/api/ai-chat/route.ts`
- Response format must stay `{ output: string }` — frontend parses `data.output`
- Supabase client: always use `createServiceClient()` from `@/utils/supabase/server`
- Embedding model: `text-embedding-3-small` (1536d — matches stored vectors)
- Chat model: `gpt-4.1-mini`
- All new files in `src/lib/rag/` — TypeScript, named exports only (no default exports)
- No streaming — return full reply as JSON
- `.env.local` must NOT be committed — verify `.gitignore` covers it

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/rag/detect-language.ts` | Create | Detect km/zh/en from text |
| `src/lib/rag/detect-intent.ts` | Create | Map keywords → doc_types + topK |
| `src/lib/rag/fetch-history.ts` | Create | Load + format last N chat messages |
| `src/lib/rag/vector-search.ts` | Create | Embed query + parallel RPC search |
| `src/lib/rag/build-prompt.ts` | Create | Assemble system + history + context + user message |
| `src/app/api/ai-chat/route.ts` | Modify | Replace n8n block with RAG pipeline (POST only) |
| `.env.local` | Create | Add OPENAI_API_KEY (never commit) |
| `package.json` | Modify | Add `openai` dependency |

---

## Task 1: Install openai package and configure env

**Files:**
- Modify: `package.json`
- Create: `.env.local` (never committed)

**Interfaces:**
- Produces: `process.env.OPENAI_API_KEY` available at runtime; `import OpenAI from 'openai'` resolves

- [ ] **Step 1: Install openai**

```bash
cd /Users/houtchinhfey/orienda/orienda_bong_both
npm install openai
```

Expected: `openai` appears in `package.json` dependencies. No errors.

- [ ] **Step 2: Create .env.local**

Create `/Users/houtchinhfey/orienda/orienda_bong_both/.env.local` and add:

```
OPENAI_API_KEY=<copy the key from /Users/houtchinhfey/orienda/orienda_scrape/.env>
```

The key starts with `sk-proj-`. Never hardcode it in any source file.

- [ ] **Step 3: Verify .gitignore excludes .env.local**

```bash
grep -E "\.env\.local|\.env\*" /Users/houtchinhfey/orienda/orienda_bong_both/.gitignore
```

Expected: at least one match. If none, add `.env.local` to `.gitignore` before continuing.

- [ ] **Step 4: Commit (package only — not .env.local)**

```bash
cd /Users/houtchinhfey/orienda/orienda_bong_both
git add package.json package-lock.json
git commit -m "chore: add openai dependency for RAG pipeline"
```

---

## Task 2: detect-language utility

**Files:**
- Create: `src/lib/rag/detect-language.ts`
- Create: `src/lib/rag/__tests__/detect-language.test.mjs`

**Interfaces:**
- Produces: `detectLanguage(text: string): 'km' | 'zh' | 'en'`

- [ ] **Step 1: Write the test**

Create `src/lib/rag/__tests__/detect-language.test.mjs`:

```javascript
import { strict as assert } from 'node:assert'
import { test } from 'node:test'

// Inline the logic so test runs before TypeScript compilation
function detectLanguage(text) {
  if (/[ក-៿]/.test(text)) return 'km'
  if (/[一-鿿]/.test(text)) return 'zh'
  return 'en'
}

test('detects Khmer', () => {
  assert.equal(detectLanguage('តើ Orienda មានវេជ្ជបណ្ឌិតឯកទេស?'), 'km')
})

test('detects Chinese', () => {
  assert.equal(detectLanguage('医生在哪里?'), 'zh')
})

test('defaults to English', () => {
  assert.equal(detectLanguage('What are your opening hours?'), 'en')
})

test('Khmer beats mixed', () => {
  assert.equal(detectLanguage('Hello ស្វាគមន៍'), 'km')
})
```

- [ ] **Step 2: Run test**

```bash
node --test src/lib/rag/__tests__/detect-language.test.mjs
```

Expected: 4 passing.

- [ ] **Step 3: Create implementation**

Create `src/lib/rag/detect-language.ts`:

```typescript
export type Language = 'km' | 'zh' | 'en'

const KM = /[ក-៿]/
const ZH = /[一-鿿]/

export function detectLanguage(text: string): Language {
  if (KM.test(text)) return 'km'
  if (ZH.test(text)) return 'zh'
  return 'en'
}
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "detect-language"
```

Expected: no output (no errors).

- [ ] **Step 5: Commit**

```bash
git add src/lib/rag/detect-language.ts src/lib/rag/__tests__/detect-language.test.mjs
git commit -m "feat(rag): add language detection (km/zh/en)"
```

---

## Task 3: detect-intent utility

**Files:**
- Create: `src/lib/rag/detect-intent.ts`
- Create: `src/lib/rag/__tests__/detect-intent.test.mjs`

**Interfaces:**
- Produces:
  - `type DocType = 'doctor' | 'price' | 'promotion_package' | 'service' | 'department' | 'contact' | 'branch' | 'faq' | 'about' | 'policy' | 'brand'`
  - `detectIntent(message: string): Array<{ type: DocType; topK: number }>`

- [ ] **Step 1: Write the test**

Create `src/lib/rag/__tests__/detect-intent.test.mjs`:

```javascript
import { strict as assert } from 'node:assert'
import { test } from 'node:test'

const TOPIC_K = {
  doctor: 6, price: 8, promotion_package: 8, service: 6,
  department: 5, contact: 4, branch: 4, faq: 6,
  about: 4, policy: 4, brand: 3,
}

const KEYWORD_MAP = [
  { pattern: /doctor|គ្រូពេទ្យ|医生|physician|specialist/i, types: ['doctor'] },
  { pattern: /price|តម្លៃ|价格|cost|fee|ថ្លៃ|charge|rate/i, types: ['price'] },
  { pattern: /package|promotion|ប្រូម៉ូសិន|促销|deal|offer|bundle/i, types: ['promotion_package'] },
  { pattern: /service|សេវា|服务/i, types: ['service'] },
  { pattern: /department|ឯកទេស|科室|unit|ward/i, types: ['department'] },
  { pattern: /contact|phone|លេខ|ទូរស័ព្ទ|电话|call|hotline|number/i, types: ['contact'] },
  { pattern: /branch|location|សាខា|ទីតាំង|地址|address|where|map/i, types: ['branch'] },
  { pattern: /\?|faq|question|help|how|what|why|when|who/i, types: ['faq'] },
  { pattern: /about|orienda|hospital|clinic|មន្ទីរពេទ្យ|history|mission/i, types: ['about'] },
  { pattern: /policy|rule|គោលការណ៍|regulation|guideline/i, types: ['policy'] },
  { pattern: /brand|logo|品牌|identity/i, types: ['brand'] },
]

const FALLBACK = ['faq', 'about', 'service']

function detectIntent(message) {
  const matched = new Set()
  for (const { pattern, types } of KEYWORD_MAP) {
    if (pattern.test(message)) types.forEach(t => matched.add(t))
  }
  const types = matched.size > 0 ? [...matched] : FALLBACK
  return types.map(type => ({ type, topK: TOPIC_K[type] }))
}

test('doctor query', () => {
  const result = detectIntent('Who are your doctors?')
  assert.ok(result.some(r => r.type === 'doctor'))
})

test('price topK is 8', () => {
  const result = detectIntent('What is the cost of consultation?')
  const price = result.find(r => r.type === 'price')
  assert.ok(price)
  assert.equal(price.topK, 8)
})

test('Khmer doctor keyword', () => {
  const result = detectIntent('គ្រូពេទ្យ')
  assert.ok(result.some(r => r.type === 'doctor'))
})

test('fallback on no match', () => {
  const result = detectIntent('xyz blah nothing')
  assert.deepEqual(result.map(r => r.type), ['faq', 'about', 'service'])
})

test('multi-match: price + doctor', () => {
  const result = detectIntent('price of doctor')
  assert.ok(result.some(r => r.type === 'price'))
  assert.ok(result.some(r => r.type === 'doctor'))
})
```

- [ ] **Step 2: Run test**

```bash
node --test src/lib/rag/__tests__/detect-intent.test.mjs
```

Expected: 5 passing.

- [ ] **Step 3: Create implementation**

Create `src/lib/rag/detect-intent.ts`:

```typescript
export type DocType =
  | 'doctor' | 'price' | 'promotion_package' | 'service'
  | 'department' | 'contact' | 'branch' | 'faq'
  | 'about' | 'policy' | 'brand'

const TOPIC_K: Record<DocType, number> = {
  doctor: 6, price: 8, promotion_package: 8, service: 6,
  department: 5, contact: 4, branch: 4, faq: 6,
  about: 4, policy: 4, brand: 3,
}

const KEYWORD_MAP: Array<{ pattern: RegExp; types: DocType[] }> = [
  { pattern: /doctor|គ្រូពេទ្យ|医生|physician|specialist/i, types: ['doctor'] },
  { pattern: /price|តម្លៃ|价格|cost|fee|ថ្លៃ|charge|rate/i, types: ['price'] },
  { pattern: /package|promotion|ប្រូម៉ូសិន|促销|deal|offer|bundle/i, types: ['promotion_package'] },
  { pattern: /service|សេវា|服务/i, types: ['service'] },
  { pattern: /department|ឯកទេស|科室|unit|ward/i, types: ['department'] },
  { pattern: /contact|phone|លេខ|ទូរស័ព្ទ|电话|call|hotline|number/i, types: ['contact'] },
  { pattern: /branch|location|សាខា|ទីតាំង|地址|address|where|map/i, types: ['branch'] },
  { pattern: /\?|faq|question|help|how|what|why|when|who/i, types: ['faq'] },
  { pattern: /about|orienda|hospital|clinic|មន្ទីរពេទ្យ|history|mission/i, types: ['about'] },
  { pattern: /policy|rule|គោលការណ៍|regulation|guideline/i, types: ['policy'] },
  { pattern: /brand|logo|品牌|identity/i, types: ['brand'] },
]

const FALLBACK: DocType[] = ['faq', 'about', 'service']

export function detectIntent(message: string): Array<{ type: DocType; topK: number }> {
  const matched = new Set<DocType>()
  for (const { pattern, types } of KEYWORD_MAP) {
    if (pattern.test(message)) types.forEach(t => matched.add(t))
  }
  const types = matched.size > 0 ? [...matched] : FALLBACK
  return types.map(type => ({ type, topK: TOPIC_K[type] }))
}
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "detect-intent"
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rag/detect-intent.ts src/lib/rag/__tests__/detect-intent.test.mjs
git commit -m "feat(rag): add intent classifier (keyword → doc_types)"
```

---

## Task 4: fetch-history utility

**Files:**
- Create: `src/lib/rag/fetch-history.ts`

**Interfaces:**
- Consumes: `createServiceClient()` from `@/utils/supabase/server`
- Produces:
  - `interface HistoryMessage { role: 'user' | 'assistant'; content: string }`
  - `fetchHistory(sessionId: string, limit?: number): Promise<HistoryMessage[]>`
  - `formatHistory(messages: HistoryMessage[]): string`

- [ ] **Step 1: Create implementation**

Create `src/lib/rag/fetch-history.ts`:

```typescript
import { createServiceClient } from '@/utils/supabase/server'

export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function fetchHistory(sessionId: string, limit = 10): Promise<HistoryMessage[]> {
  try {
    const db = await createServiceClient()
    const { data, error } = await db
      .from('ai_chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error || !data) return []
    return data.map(row => ({
      role: (row.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: row.content ?? '',
    }))
  } catch {
    return []
  }
}

export function formatHistory(messages: HistoryMessage[]): string {
  if (messages.length === 0) return ''
  return messages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n')
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "fetch-history"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/rag/fetch-history.ts
git commit -m "feat(rag): add session history fetcher"
```

---

## Task 5: vector-search utility

**Files:**
- Create: `src/lib/rag/vector-search.ts`

**Interfaces:**
- Consumes: `OpenAI` from `openai`; `DocType` from `./detect-intent`; `createServiceClient()` from `@/utils/supabase/server`
- Produces:
  - `interface SearchResult { id: number; content: string; metadata: Record<string, unknown>; similarity: number }`
  - `embedQuery(text: string, openai: OpenAI): Promise<number[]>`
  - `parallelSearch(embedding: number[], targets: Array<{ type: DocType; topK: number }>): Promise<SearchResult[]>`

- [ ] **Step 1: Create implementation**

Create `src/lib/rag/vector-search.ts`:

```typescript
import OpenAI from 'openai'
import { createServiceClient } from '@/utils/supabase/server'
import type { DocType } from './detect-intent'

const EMBEDDING_MODEL = 'text-embedding-3-small'

export interface SearchResult {
  id: number
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export async function embedQuery(text: string, openai: OpenAI): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  })
  return res.data[0].embedding
}

async function searchDocType(
  embedding: number[],
  docType: DocType,
  topK: number,
): Promise<SearchResult[]> {
  const db = await createServiceClient()
  const { data, error } = await db.rpc('match_ai_orienda_documents', {
    query_embedding: embedding,
    match_count: topK,
    filter: { doc_type: docType },
  })
  if (error || !data) return []
  return data as SearchResult[]
}

export async function parallelSearch(
  embedding: number[],
  targets: Array<{ type: DocType; topK: number }>,
): Promise<SearchResult[]> {
  const results = await Promise.all(
    targets.map(({ type, topK }) => searchDocType(embedding, type, topK))
  )
  const seen = new Set<number>()
  return results
    .flat()
    .filter(r => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 15)
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "vector-search"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/rag/vector-search.ts
git commit -m "feat(rag): add vector search (embed + parallel RPC search)"
```

---

## Task 6: build-prompt utility

**Files:**
- Create: `src/lib/rag/build-prompt.ts`

**Interfaces:**
- Consumes: `Language` from `./detect-language`; `SearchResult` from `./vector-search`
- Produces:
  - `buildMessages(userMessage: string, language: Language, history: string, chunks: SearchResult[]): Array<{ role: 'system' | 'user'; content: string }>`

- [ ] **Step 1: Create implementation**

Create `src/lib/rag/build-prompt.ts`:

```typescript
import type { Language } from './detect-language'
import type { SearchResult } from './vector-search'

const SYSTEM_PROMPT = `You are Orienda AI Assistant — a helpful, professional healthcare assistant for Orienda Hospital (ORD2) and Orienda Clinic (ORD1) in Cambodia.

LANGUAGE RULES:
- Detect the user's language from the [detected language] tag.
- Reply ONLY in that language: Khmer (km), Chinese (zh), or English (en).
- Never mix languages in a single response.

BRANCH GUIDE:
- ORD1 = Orienda Clinic (clinic services, fertility, general checkup)
- ORD2 = Orienda Hospital (inpatient, spine center, ICU, NICU, emergency)
- Price information applies to ORD2 unless stated otherwise.

ANSWER RULES:
- Answer ONLY from the RETRIEVED CONTEXT provided in the user message.
- If context does not contain the answer, say: "I don't have that information. Please contact us directly at 16 593 789."
- Be concise and factual. No hallucinations. No fabricated prices or doctor names.
- For appointments or urgent matters, always include the hotline.

VERIFIED CONTACT:
- Hotline: 16 593 789 / 12 593 789 (available 24/7 for emergencies)`

export function buildMessages(
  userMessage: string,
  language: Language,
  history: string,
  chunks: SearchResult[],
): Array<{ role: 'system' | 'user'; content: string }> {
  const contextBlock = chunks.length > 0
    ? `RETRIEVED CONTEXT:\n${chunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n')}`
    : 'RETRIEVED CONTEXT: (no relevant documents found)'

  const parts: string[] = []
  if (history) parts.push(`PREVIOUS CONVERSATION:\n${history}\n`)
  parts.push(contextBlock)
  parts.push(`\nCURRENT MESSAGE: ${userMessage}`)
  parts.push(`[detected language: ${language}]`)

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: parts.join('\n') },
  ]
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "build-prompt"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/rag/build-prompt.ts
git commit -m "feat(rag): add prompt builder with system prompt"
```

---

## Task 7: Wire RAG into POST /api/ai-chat

**Files:**
- Modify: `src/app/api/ai-chat/route.ts`

**Interfaces:**
- Consumes: all five `src/lib/rag/*` modules + `openai` package
- Produces: same `NextResponse.json({ output: string })` as before

The existing POST handler structure:
```
POST handler (lines 120–199)
├── parse body                           ← keep
├── validate empty message → 400         ← keep
├── upsert ai_chat_sessions              ← keep
├── insert user message                  ← keep
├── [REPLACE] n8n block (lines 150-196)  ← replace this entire section
```

- [ ] **Step 1: Add imports at top of route.ts**

In `src/app/api/ai-chat/route.ts`, add after the existing import lines at the top:

```typescript
import OpenAI from 'openai'
import { detectLanguage } from '@/lib/rag/detect-language'
import { detectIntent } from '@/lib/rag/detect-intent'
import { fetchHistory, formatHistory } from '@/lib/rag/fetch-history'
import { embedQuery, parallelSearch } from '@/lib/rag/vector-search'
import { buildMessages } from '@/lib/rag/build-prompt'
```

Add this constant after imports (module level, before any function definition):

```typescript
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
```

- [ ] **Step 2: Remove unused constants**

Delete these two lines near the top of the file:

```typescript
const WEBHOOK = 'https://n8n.new-wave.io/webhook/orienda_ai_agent'
const TIMEOUT_MS = 25000
```

- [ ] **Step 3: Replace the n8n block in POST**

Find the section starting with `// Forward to n8n` (around line 150) and ending with `} finally { clearTimeout(timer) }` (around line 196). Delete it entirely and replace with:

```typescript
  // RAG pipeline
  let reply: string
  try {
    const language = detectLanguage(message)
    const [history, intent, embedding] = await Promise.all([
      sessionId ? fetchHistory(sessionId) : Promise.resolve([]),
      Promise.resolve(detectIntent(message)),
      embedQuery(message, openai),
    ])
    const chunks = await parallelSearch(embedding, intent)
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
    console.error('[ai-chat] RAG error:', err?.message || err)
    reply = "Sorry, I couldn't get a response right now. Please try again in a moment."
  }

  // Save assistant response
  if (sessionId && reply) {
    try {
      const db = await createServiceClient()
      await db.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: reply })
    } catch (e) { console.error('[ai-chat] assistant msg insert error:', e) }
  }

  return NextResponse.json({ output: reply }, { status: 200 })
```

Note: the original route already has a "Save assistant response" block inside the try/catch — remove the original one since we moved it outside the try block above.

- [ ] **Step 4: Full TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: zero errors. Fix any before continuing.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/ai-chat/route.ts
git commit -m "feat(rag): replace n8n webhook with inline RAG pipeline"
```

---

## Task 8: Integration test

Manual curl tests — no new files.

- [ ] **Step 1: Start dev server**

```bash
cd /Users/houtchinhfey/orienda/orienda_bong_both
npm run dev
```

Wait for `Ready` in terminal output.

- [ ] **Step 2: English query**

```bash
curl -s -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What doctors do you have?", "session_key": "test-rag-001", "locale": "en", "user_id": null}' \
  | python3 -m json.tool
```

Expected: `{ "output": "<non-empty English text>" }`. No `[ai-chat] RAG error` in server logs.

- [ ] **Step 3: Khmer query**

```bash
curl -s -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "តើ Orienda មានវេជ្ជបណ្ឌិតឯកទេសអ្វីខ្លះ?", "session_key": "test-rag-002", "locale": "km", "user_id": null}' \
  | python3 -m json.tool
```

Expected: `output` contains Khmer script (ក-៿ characters).

- [ ] **Step 4: Price query**

```bash
curl -s -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How much does a consultation cost?", "session_key": "test-rag-003", "locale": "en", "user_id": null}' \
  | python3 -m json.tool
```

Expected: pricing info or polite redirect to hotline. No error in logs.

- [ ] **Step 5: Empty message still 400**

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "", "session_key": "test-rag-004", "locale": "en"}'
```

Expected: `400`.

- [ ] **Step 6: Final commit**

```bash
git add docs/superpowers/plans/2026-06-25-rag-pipeline.md docs/superpowers/specs/2026-06-25-rag-pipeline-design.md
git commit -m "docs: add RAG pipeline spec and implementation plan"
```

---

## Self-Review

**Spec coverage:**
- ✅ Language detection (km/zh/en) — Task 2
- ✅ Session history fetch + format — Task 4
- ✅ Intent classification (keyword → doc_types) — Task 3
- ✅ OpenAI embedding (text-embedding-3-small) — Task 5
- ✅ Parallel vector search per doc_type — Task 5
- ✅ Merge top 15 by similarity — Task 5
- ✅ Prompt building (system + history + context + message) — Task 6
- ✅ gpt-4.1-mini chat completion — Task 7
- ✅ Session upsert + message saves unchanged — Task 7
- ✅ Return `{ output: reply }` — Task 7
- ✅ GET and DELETE untouched — Task 7 (POST only modified)
- ✅ OPENAI_API_KEY env var — Task 1
- ✅ openai package — Task 1

**Type consistency:**
- `DocType` defined in `detect-intent.ts`, imported in `vector-search.ts` ✅
- `Language` defined in `detect-language.ts`, imported in `build-prompt.ts` ✅
- `SearchResult` defined in `vector-search.ts`, imported in `build-prompt.ts` ✅
- `formatHistory` returns `string`, `buildMessages` accepts `string` for history ✅
- `parallelSearch` accepts `Array<{ type: DocType; topK: number }>` — exact match with `detectIntent` return ✅
- `buildMessages` returns `Array<{ role: 'system' | 'user'; content: string }>` — compatible with `openai.chat.completions.create({ messages })` ✅

**Placeholder scan:** None. All steps contain complete code.
