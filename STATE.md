# StateSense — Current State

**Last updated:** 2026-05-25
**Current phase:** Phase 2 — full pipeline built. Ready for `npm install` + first dev run.

## Where we are

PRD complete and cross-checked. **Heuristic library v1.2.0** locked — 65 heuristics, 3 scopes, all `platforms: ["web"]`. Voice + concision rules in `FINDING_VOICE.md`. Per-heuristic examples in `examples.json`. PRD §8 strict output enforced via tool-use `input_schema`.

**Phase 1 CLI:** `scripts/audit.ts` runs audits from the terminal against Sonnet 4.6 with tool-use + prompt caching. Imports from `lib/` (canonical) — no duplication.

**Phase 2 Next.js app built (2026-05-25):** 15-route app with Tailwind + shadcn-style UI, BYOK key entry, screen uploader (drag-drop, 1–6 files), PDF context parser (pdfjs-dist), audit API route, results view with thumbs/dismiss/exports (Markdown, PDF, JSON). Security headers, Cloudflare Web Analytics, all PRD §F6 error states wired.

## Project shape

```
app/                       Next.js pages + API routes
  api/audit/route.ts       Sonnet 4.6 audit, tool-use, prompt-cached
  api/validate-key/        Haiku 4.5 ping to verify a BYOK key
  page.tsx                 Landing
  audit/page.tsx           Main flow (form → run → results)
  privacy/, faq/, about/   Static pages
lib/                       Canonical app code
  types.ts                 Shared types (PRD §8)
  system-prompt.ts         Assembles heuristics + examples + voice
  audit-schema.ts          Tool-use input_schema
  storage.ts               localStorage helpers + key validation
  pdf.ts                   Client-side PDF text extraction
  export-markdown.ts       Markdown export
  export-pdf.tsx           @react-pdf/renderer export
  anthropic-errors.ts      Maps SDK errors → app error kinds
components/                React components
  ui/*                     shadcn-style primitives
  audit-form.tsx           Form orchestrator (state machine)
  api-key-gate.tsx, screen-uploader.tsx, context-input.tsx,
  focus-selector.tsx, results-view.tsx, finding-card.tsx,
  skipped-list.tsx, export-menu.tsx, audit-skeleton.tsx,
  error-display.tsx, coverage-pill.tsx
scripts/audit.ts           CLI for quality-gate runs (imports from lib/)
heuristics/                Library + voice spec + examples
samples/linear/, samples/resend/   Sample flows with context.md
```

## Next concrete action

**To run the app:**
1. `npm install`
2. Copy `.env.example` to `.env`. The `ANTHROPIC_API_KEY` line is only used by the CLI; the web app gets its key from the browser at runtime. `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` can stay empty for local dev.
3. `npm run dev` → open http://localhost:3000

**To run the CLI quality gate (validates library quality before relying on it):**
1. `npm run audit -- samples/linear`
2. `npm run audit -- samples/resend`
3. Compare each `actual_findings.json` to the manual audits we did in conversation. Tune `lib/system-prompt.ts` if needed.

**Still to do before launch:**
- Collect 3 more sample flows for the formal gate
- Write `expected_findings.md` + `rating.md` per flow
- Friendly-user tests (5–10)
- Final privacy review of every dependency
- Set up Cloudflare Web Analytics, paste token into `.env`
- Domain, og image, sitemap, robots

## Recent decisions

- **Build-readiness lock** (2026-05-25): analytics = Cloudflare Web Analytics; structured output = tool-use `input_schema`; cache TTL = default 5-min; no streaming for v1; key validation = Haiku 4.5 ping. All chosen to preserve $0 recurring cost.
- **Finding concision** (2026-05-25): caps added to FINDING_VOICE.md and examples.json — title ≤8 words, description ≤30 words, suggestion ≤20 words.
- **Library v1.2.0** (2026-05-24): three scopes (screen/flow/intent), tiered findings (gap/recommendation/question), context-tag filtering via `applies_when`. 21 new heuristics. Output schema in PRD §8 updated.
- **Workflow rule** (2026-05-24): mid-session writes are artifact-only; state-file sweep at end of session.
- **Library v1.1.0** (2026-05-24): refocus on designer-actionable findings. Principle: "Designer-shown, not engineer-implemented."
- Stack locked: Next.js + Tailwind + shadcn + Anthropic Sonnet 4.6
- BYOK only for v1 (no hosted free tier — preserves $0 cost)
- v1 = Responsive Web; mobile selectors visible but disabled
- Exports = Markdown + PDF + JSON (no Notion/Linear/Jira; no shareable links)
- Heuristic library treated as product IP; quality gate blocks UI work in phase 2

See `DECISIONS.md` for full rationale.

## Open questions

- **Landing page sample audit** — live demo (small recurring cost) vs. static screenshots. PRD §14.
- **Heuristic library format** — JSON file in repo vs. external editable source. Default to JSON; revisit if iteration speed becomes the bottleneck. PRD §14.
- **Re-run with same inputs** — cache and let users compare runs? Defer unless asked during user testing. PRD §14.

## Blockers

None.

## Cold-start checklist

If you're returning to this project after a break:
1. Read `CLAUDE.md`
2. Read this file (`STATE.md`)
3. Read `PROGRESS.md` to see where in the timeline we are
4. Skim recent entries in `DECISIONS.md`
5. Open `docs/PRD.md` only if you need spec details

If you're picking up mid-phase-1: most recent heuristics work lives in `heuristics/`. Check `PROGRESS.md` for the current task in progress.

## Notes for future sessions

- This file should be updated at the end of any working session that moves the project forward.
- Keep it short — long status reports become noise. If something belongs in history, write it to `DECISIONS.md` instead.
