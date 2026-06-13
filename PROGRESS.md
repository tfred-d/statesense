# StateSense — Progress Tracker

**Launch target:** None — moving at the maintainer's pace. Sequence > calendar.
**Status:** v1 feature-complete and deployed to https://statesense.vercel.app

Update by checking items as they complete. Keep notes per phase brief; full rationale goes in `DECISIONS.md`.

## Phase 0 — Planning (done)

- [x] Critique outline
- [x] Resolve open product questions (distribution, BYOK, exports, scope, privacy)
- [x] Write PRD (`docs/PRD.md`)
- [x] Set up project scaffolding

## Phase 1 — Heuristic library + prompt (done)

### Library authoring (v1.2.0)
- [x] Lock schema (scope, applies_when, default_finding_type)
- [x] Author 65 heuristics — 53 screen + 6 flow + 6 intent, 21 categories
- [x] SUMMARY.md, FINDING_VOICE.md, examples.json (65, with ≤8/≤30/≤20 word caps)
- [x] Strict output schema in PRD §8 (element_anchor + screen_refs via tool-use)
- [x] Cross-file consistency review + build-readiness decisions
- [x] Theo reviewed and approved the library

### Prompt + CLI
- [x] System prompt (`lib/system-prompt.ts`) — anchor-or-skip, tool-use JSON, no-em-dash rule
- [x] CLI (`scripts/audit.ts`), tool-use schema (`lib/audit-schema.ts`)
- [x] Node/TS scaffold; CLI + app share `lib/` as canonical source

### Quality gate
- [x] Two sample flows with context.md (`samples/linear/`, `samples/resend/`)
- [~] **Formal 5-flow scored gate NOT run.** Superseded by live-app validation against the in-conversation benchmark audits (Theo's call — judged good enough to proceed). CLI retained for future regression runs. 3 more sample flows + per-flow `expected_findings.md` / `rating.md` remain available if a rigorous gate is wanted later.

## Phase 2 — Core app (done)

- [x] Next.js 15 + Tailwind + shadcn-style UI (primitives written directly)
- [x] Security headers (CSP, Permissions-Policy mic=self, X-Frame-Options, etc.)
- [x] BYOK key entry as button + modal (`api-key-gate.tsx`, `lib/storage.ts`)
- [x] Key validation — Haiku 4.5 ping via `/api/validate-key`
- [x] Audit UI: platform selector (web only), screen uploader (1–6, drag-drop), required context (text / PDF / voice)
- [x] ~~Heuristic-focus selector~~ — built, then **removed** (exposed category names = IP leak; server-side `applies_when` handles scoping)
- [x] `/api/audit` with tool-use + prompt caching; strips `skipped_heuristics` from response
- [x] Results: grouped by scope → severity, thumbs, audited-inputs summary, click-to-enlarge lightbox
- [x] ~~Coverage score / skipped-heuristics list~~ — **removed** from UI + exports (arbitrary / IP leak); coverage still computed in schema
- [x] All PRD §F6 error states (typed ErrorKind + icons + concrete copy)
- [x] Vercel deploy — live, auto-deploys on push to `main`

## Phase 3 — Polish, exports, launch

- [x] Markdown export (copy to clipboard)
- [x] PDF export — **browser print-to-PDF** (dropped @react-pdf; print styles strip chrome)
- [x] JSON export (sanitized — no heuristic IDs / internal fields)
- [x] Landing page (icons, hero dot-grid, "No signup" USP, de-vendored copy)
- [x] Sample audit page `/sample` (Resend flow, click-to-enlarge, Mobbin credit)
- [x] Privacy / FAQ / About (+ "Built by Theophilus Fredrick")
- [x] Custom og:image (1200×630)
- [x] Progressive audit loading state (timed phases)
- [x] Cloudflare Web Analytics integration (code; cookieless) — service connected by Theo
- [x] Custom og:image (1200×630, static PNG) + S-monogram favicon / apple-icon
- [x] Landing polish pass (timeline, dark CTA card, sticky header w/ scroll border, balanced copy, mobile padding)
- [x] Sample screens de-watermarked (Mobbin crop)
- [ ] Verify Cloudflare beacon actually fires (Network tab: beacon.min.js + the RUM POST)
- [ ] 5–10 friendly-user tests
- [ ] Mobile / Safari spot-check
- [ ] Final dependency privacy sniff (`npm ls`; confirm no analytics on `/audit`)
- [ ] robots.txt + sitemap (optional for launch)
- [ ] Custom domain (optional — on vercel.app for now)

## v2 — see `docs/STRATEGY.md`

- [ ] **Moat test first:** StateSense vs. naive "find the gaps" prompt on the same flow. Gates everything.
- [ ] If it passes: prototype the **agent-embedded form factor** (Claude skill / MCP server) — pipeline already in `lib/`
- [ ] Reposition copy toward "before you ship" (verification layer)

## Hard-cuts list (applied / remaining)

1. ~~Heuristic-focus selector~~ — **cut** (also an IP win)
2. ~~"Dismiss finding" action~~ — **cut** (thumbs-down is the feedback path)
3. ~~PDF export via heavy lib~~ — replaced with print-to-PDF (kept the capability, dropped the dependency)
4. Landing live sample audit → shipped as a static hand-crafted `/sample` (no recurring cost)

## Post-launch backlog

- iOS + Android heuristic libraries
- **Agent-embedded audit (Claude skill / MCP)** — likely the real v2 distribution play; see STRATEGY.md
- Figma plugin (lesser alternative now)
- Hosted free tier (StateSense pays for first N audits)
- Notion / Linear / Jira native export
- Custom heuristics — let teams add their own
- Shareable audit links (needs server storage; revisit privacy model)
- Per-session audit history (needs IndexedDB — base64 screens exceed localStorage)
- Comparison mode: re-run after design changes, diff findings
