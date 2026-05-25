# StateSense — Progress Tracker

**Launch target:** None — moving at the maintainer's pace. Sequence > calendar.

Update by checking items as they complete. Keep notes per phase brief; full rationale goes in `DECISIONS.md`.

## Phase 0 — Planning (done)

- [x] Critique outline
- [x] Resolve open product questions (distribution, BYOK, exports, scope, privacy)
- [x] Write PRD (`docs/PRD.md`)
- [x] Set up project scaffolding (CLAUDE.md, STATE.md, this file, DECISIONS.md, folders)

## Phase 1 — Heuristic library + quality gate

**Goal:** prove the heuristic library + system prompt produce sharp findings before any UI is built.

### Library authoring (v1.2.0)
- [x] Lock heuristic schema (with scope, applies_when, default_finding_type)
- [x] Author screen-scope heuristics — 53 across 19 categories
- [x] Author flow-scope heuristics — 6 (flow-coherence)
- [x] Author intent-scope heuristics — 6 (prd-alignment)
- [x] Generate SUMMARY.md for fast review
- [x] Update output schema in PRD §8 (scope + finding_type per finding)
- [x] Critical self-review pass + 3 additions (above-the-fold-value, progress-indication, required-vs-optional-signal)
- [x] Write FINDING_VOICE.md — output language spec
- [x] Author examples.json — 65 example findings, one per heuristic, in a separate file to keep heuristics.json stable
- [x] Add strict output schema to PRD §8 — required fields including element_anchor
- [x] Tighten examples.json + add concision rules to FINDING_VOICE.md (≤8/≤30/≤20 word caps)
- [x] Cross-file consistency review + lock build-readiness decisions (analytics, structured output, cache TTL, streaming, key validation)
- [ ] **Theo reviews v1.2.0 library** — edits, cuts, additions

### Prompt + CLI
- [x] Design v1 system prompt (`lib/system-prompt.ts`) — anchor-or-skip; tool-use JSON; loads heuristics + examples + voice spec
- [x] Build CLI script (`scripts/audit.ts`) — runs audit against image + text inputs, writes `actual_findings.json`
- [x] Validate JSON output schema via tool-use `input_schema` (`lib/audit-schema.ts`)
- [x] Set up Node/TypeScript scaffold (`package.json`, `tsconfig.json`, `.env.example`, `.gitignore`)
- [x] Refactor: CLI and Next.js app share `lib/` as the canonical source for prompt + schema + types
- [ ] First end-to-end CLI run (needs `npm install` + Anthropic key in `.env`)

### Quality gate
- [x] Sample flow 1 — `samples/linear/` (Linear AI Chat, 4 screens, context.md ✓)
- [x] Sample flow 2 — `samples/resend/` (Resend Sent Email Details, 6 screens, context.md ✓)
- [ ] Sample flow 3 — form-with-validation (signup / settings / payment form)
- [ ] Sample flow 4 — payment or transaction flow
- [ ] Sample flow 5 — content creation (compose / editor / publishing)
- [ ] For each flow: write `expected_findings.md` (hand-judged ground truth)
- [ ] Run audits via CLI; rate each finding for specific / accurate / actionable in `rating.md`
- [ ] Iterate prompt + library until ≥70% pass
- [ ] **🚦 EXIT GATE — UI work blocked until this passes**

## Phase 2 — Core app

- [x] Next.js 15 scaffold with Tailwind + shadcn-style UI (primitives written directly, no CLI install)
- [x] Security headers (CSP, X-Frame-Options, etc.) in `next.config.ts`
- [x] API key entry + `localStorage` handling (`components/api-key-gate.tsx`, `lib/storage.ts`)
- [x] Key validation — Haiku 4.5 ping via `/api/validate-key`
- [x] Audit page UI: platform selector (web only; iOS/Android disabled), screen uploader (drag-drop, 1–6), context input (textarea + client-side PDF)
- [x] Heuristic-focus selector (default: All, scopable by category)
- [x] API route `/api/audit` with tool-use + prompt caching wired
- [x] Results view: findings grouped by scope → severity, thumbs/dismiss/exports
- [x] Coverage score, skipped-heuristics list, audit summary
- [x] All PRD §F6 error states with typed ErrorKind + dedicated icons + concrete copy
- [ ] Vercel deploy (verify free tier + env vars)

## Phase 3 — Polish, exports, launch

- [x] Markdown export (copy to clipboard) — `lib/export-markdown.ts`
- [x] PDF export via `@react-pdf/renderer` — `lib/export-pdf.tsx`
- [x] JSON export (download)
- [x] Landing page — value props, how-it-works, CTA
- [x] Privacy / FAQ / About pages
- [x] Cloudflare Web Analytics integration (cookieless, no PII)
- [ ] 5–10 friendly-user tests; iterate on copy and findings rendering
- [ ] Final privacy review of every dependency (run after `npm install`)
- [ ] Launch checklist (domain, robots, sitemap, og image)
- [ ] **🚀 LAUNCH**

## Hard-cuts list (in order, if scope creeps)

1. Heuristic-focus selector (default to "All", remove the UI)
2. "Dismiss finding" action
3. PDF export (markdown + JSON ship)
4. Landing-page live sample audit (replace with static screenshots)

## Post-launch backlog (do not start before launch)

- iOS + Android heuristic libraries
- Figma plugin (likely v2 distribution play)
- Hosted free tier (StateSense pays for first N audits)
- Notion / Linear / Jira native export (build the most-requested first)
- Custom heuristics — let teams add their own
- Shareable audit links (with explicit opt-in storage)
- Comparison mode: re-run after design changes, diff findings
