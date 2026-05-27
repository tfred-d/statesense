# StateSense — Current State

**Last updated:** 2026-05-27
**Current phase:** v1 feature-complete and deployed. Awaiting friendly-user testing.
**Live:** https://statesense.vercel.app · **Repo:** github.com/tfred-d/statesense

## Where we are

The full product is built, deployed, and public. Heuristic library v1.2.0 locked (65 heuristics, 3 scopes, web-only). The Next.js app runs the audit end-to-end: BYOK key entry, screen upload, required feature context (typed / PDF / voice), Sonnet 4.6 audit via tool-use + prompt caching, results grouped by scope, exports (Markdown / print-to-PDF / JSON). Cloudflare Web Analytics wired (cookieless). All PRD §F6 error states handled.

The formal CLI quality gate (5 sample flows, scored) was **not** run — Theo validated quality by testing the live app against the in-conversation benchmark audits instead, and judged it good enough to proceed. CLI remains available for regression testing.

## Project shape

```
app/
  api/audit/route.ts        Sonnet 4.6 audit; tool-use; prompt-cached; strips skipped_heuristics
  api/validate-key/route.ts Haiku 4.5 ping to verify a BYOK key
  page.tsx                  Landing (hero, value props, how-it-works, CTA)
  audit/page.tsx            → AuditPageShell (key button in header + form)
  sample/page.tsx           Sample audit (Resend flow) — landing proof
  privacy/ faq/ about/      Static pages
  opengraph-image.png       Custom 1200×630 social card
lib/
  types.ts                  Shared types (PRD §8)
  system-prompt.ts          Assembles heuristics + examples + voice; no-em-dash rule
  audit-schema.ts           Tool-use input_schema
  storage.ts                localStorage helpers + key shape check
  key-validation.ts         Client → /api/validate-key
  pdf.ts                    Client-side PDF text extraction (pdfjs-dist)
  export-markdown.ts        Markdown export (JSON export inlined in export-menu)
  anthropic-errors.ts       Maps SDK errors → app error kinds
  sample-audit.ts           Hand-crafted Resend findings for /sample
components/
  ui/*                      shadcn-style primitives
  audit-page-shell.tsx      Owns apiKey state (header button + form)
  audit-form.tsx            Form orchestrator (state machine)
  api-key-gate.tsx          Button + modal for key entry / remove
  screen-uploader.tsx  context-input.tsx (PDF + voice)  platform-selector.tsx
  audit-skeleton.tsx        Progressive (timed) phase labels
  audit-inputs-summary.tsx  "Audited" thumbnails + context, above results
  results-view.tsx  finding-card.tsx  export-menu.tsx  error-display.tsx
  screen-lightbox.tsx       Shared click-to-enlarge + prev/next + arrow keys
  sample-screens.tsx  site-header.tsx  site-footer.tsx  cf-analytics.tsx
scripts/audit.ts            CLI for quality-gate / regression runs (imports lib/)
heuristics/                 Library + voice spec + examples + summary
samples/linear/ samples/resend/   Sample flows with context.md
docs/PRD.md  docs/STRATEGY.md  docs/outline.md
```

Removed during build: `focus-selector`, `skipped-list`, `coverage-pill`, `export-pdf` (and the `@react-pdf/renderer` dependency).

## Next concrete action

Nothing technical blocks sharing it. Remaining is validation + the v2 question:

1. **Verify the Cloudflare beacon** — Network tab, confirm both `beacon.min.js` and the `cloudflareinsights.com/cdn-cgi/rum` POST fire (the CSP fix unblocked the second).
2. **5–10 friendly-user tests** — real designers, real audits; watch for confusion.
3. **Mobile / Safari spot-check** — never rendered on a phone or in Safari.
4. **Dependency privacy sniff** — `npm ls`, confirm no analytics SDK loads on `/audit`.
5. **The v2 moat test** (see `docs/STRATEGY.md`): run a flow through StateSense vs. a naive "find the gaps" prompt to the same model. This decides whether v2 is worth building and in what form.

## Recent decisions (full rationale in DECISIONS.md)

- **v2 direction** (05-27): verification layer / agent-embedded skill, not a Figma-handoff webapp. Gate on the moat comparison. See `docs/STRATEGY.md`.
- **Build/polish/deploy** (05-27): IP guards (cut focus selector, hid skipped heuristics + coverage score, sanitized JSON); PDF → browser print-to-PDF (dropped @react-pdf); voice input added; context now required; Cloudflare analytics; live on Vercel.
- **Build-readiness lock** (05-25): tool-use structured output; 5-min cache; no streaming v1; Haiku 4.5 key validation; all for $0 cost.
- **Library v1.2.0** (05-24): three scopes, tiered findings, `applies_when` pre-filter.
- Stack: Next.js 15 + Tailwind + shadcn-style + Sonnet 4.6. BYOK only. Web-only v1.

## Open questions

- **The moat test** (now the top question) — is the curated library meaningfully better than asking the generating model "what did you miss?" See STRATEGY.md.
- Landing sample audit: shipped as a static hand-crafted audit at `/sample` (resolved — no live-demo cost).
- Re-run / history: deferred post-launch (needs IndexedDB).

## Blockers

None.

## Cold-start checklist

1. Read `CLAUDE.md`
2. Read this file (`STATE.md`)
3. Read `PROGRESS.md`
4. Skim recent `DECISIONS.md` entries
5. For v2 thinking: `docs/STRATEGY.md`
6. `docs/PRD.md` only for original-spec detail (note: several deltas — see DECISIONS.md)

## Notes for future sessions

- Update this file at the end of any session that moves the project forward. Keep it short; history goes to `DECISIONS.md`.
- The app is live. Any push to `main` auto-deploys via Vercel. Binary-file pushes may need `git -c http.postBuffer=524288000 push`.
