# Admin Panel Build Progress

## Status: COMPLETE - Build passing

## What was built

### Core Libraries (`app/lib/admin/`)
- [x] `auth.ts` — Hardcoded login (Admin / Popyourcherry), cookie-based sessions
- [x] `neo4j-http.ts` — Neo4j HTTP API client with response parser
- [x] `llm.ts` — OpenAI client (lazy-init), JSON extractor (handles code blocks, brace matching)
- [x] `prompts.ts` — Full bursary & college extraction prompts with SA-specific defaults, tag instructions, merge prompt
- [x] `gcs.ts` — Google Cloud Storage upload/download utilities

### API Routes (`app/api/admin/`)
- [x] `auth/route.ts` — POST login/logout
- [x] `neo4j/route.ts` — Generic Cypher query proxy
- [x] `scrape/route.ts` — URL text extraction (Readability + linkedom)
- [x] `parse/bursary/route.ts` — LLM bursary extraction
- [x] `parse/college/route.ts` — LLM college extraction
- [x] `upload/logo/route.ts` — Logo upload to GCS (sharp: resize, PNG convert)
- [x] `upload/hero/route.ts` — Hero image upload (sharp: 1200px, JPEG q80)
- [x] `upload/campus-photo/route.ts` — Gallery photo upload + manifest update
- [x] `bursaries/route.ts` — GET list, POST create (with dual property consistency)
- [x] `bursaries/[id]/route.ts` — GET single, PUT update, DELETE
- [x] `colleges/route.ts` — GET list (with faculty/degree counts), POST create (with cascading dept/qual creation)
- [x] `colleges/[name]/route.ts` — GET single (with departments), DELETE (cascading)

### Admin Pages (`app/admin/`)
- [x] `layout.tsx` — Dark theme admin shell with sidebar nav, auth guard, logout
- [x] `login/page.tsx` — Login form (username + password)
- [x] `page.tsx` — Dashboard (stats cards, quick actions, bursary table)
- [x] `bursaries/page.tsx` — Bursary list (search, status filter, clickable rows)
- [x] `bursaries/new/page.tsx` — New bursary (paste/URL modes, tag selection, AI extraction, JSON review)
- [x] `bursaries/[id]/page.tsx` — Edit bursary (full structured form: general, funder, eligibility, application, obligations, renewal)
- [x] `colleges/page.tsx` — College list (search, type filter, uni/college toggle)
- [x] `colleges/new/page.tsx` — New college (paste/URL, AI extraction, JSON review)
- [x] `colleges/[name]/page.tsx` — Edit college (institution details, images with upload, departments accordion)

### Config changes
- [x] `layout.tsx` — Main layout passes through for `/admin` routes
- [x] `.env.local` — Added `NEO4J_URL` for HTTP API
- [x] `types/linkedom.d.ts` — Type declarations for linkedom

### Dependencies added
- openai, @google-cloud/storage, sharp, @mozilla/readability, linkedom
