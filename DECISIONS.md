# StateSense — Decision Log

Newest at top. Each entry: date · decision · why · alternatives considered.

Use this to record decisions as they're made, so future sessions (and future Theo) understand *why* the project looks the way it does.

---

## 2026-06-13 · Launch polish — landing, branding, mobile (no architecture change)

A craft pass on the live site. No stack/scope/architecture changes; recording the few choices a future session would otherwise have to reverse-engineer.

- **Landing rebuilt.** Dot-grid hero (pseudo-element so the mask doesn't bleed onto the CTAs), "No signup" USP (not "costs cents"), value props with icons, "How it works" as a horizontal timeline (light-gray numbered nodes on a line, node-center to node-center via 12.5% insets), and a dark CTA *card* (contained on desktop, full-bleed on mobile) instead of a bordered section. Copy de-vendored ("API key", not "Anthropic") and de-em-dashed.
- **Sticky header with scroll-triggered border.** `SiteHeader` is now a client component; `border-b` is always reserved (transparent) and fades to the border tone past 4px scroll — avoids the 1px layout shift a toggled border would cause.
- **Branding via static assets, not generated routes.** `app/opengraph-image.png` (custom, replaced the earlier `ImageResponse` route) and an S-monogram `app/icon.tsx` + `app/apple-icon.tsx`. StateSense is wordmark-only; the "S" is a favicon device only, not a brand mark. `metadataBase` reads `NEXT_PUBLIC_SITE_URL` (falls back to the vercel.app URL).
- **GOTCHA — container padding ↔ full-bleed.** Bumped container side padding 1rem → 1.5rem (mobile) / 2rem (lg) for breathing room. The CTA card's full-bleed depends on this exact value: it uses `-mx-6` to cancel the 1.5rem mobile padding. If container padding changes again, update that negative margin or the card won't reach the viewport edge.
- **Sample screens de-watermarked.** `public/sample/resend/screen-N.png` were carrying the Mobbin footer; replaced with Theo's crops (index-preserving, so the hand-authored sample analysis still maps to the right screens). Slightly irregular heights (~1920×1200); display is driven by `h-auto w-full` so it doesn't matter.
- **PDF stayed print-to-PDF** (decided 05-27); the `@react-pdf` dependency remains removed.

---

## 2026-05-27 · v2 direction — verification layer, not Figma-handoff tool

**Decision:** Captured a strategic reframe in `docs/STRATEGY.md` rather than acting on it now. Trigger: the question "if coding agents already handle edge cases, what's StateSense for?"

**The short version:**
- Screen-scope heuristics partially overlap with what coding agents emit; flow-scope and intent-scope do not, and intent grows in value.
- The real shift is generation up / human review down → verification becomes the bottleneck → a systematic checker is more useful, not less.
- The moat is the same original bet: curated library > naive prompt to the same model. **Before any v2 investment, run the comparison** (StateSense vs. "find the gaps" prompt on the same flow). That experiment gates everything.
- The product's *job* holds; the *packaging* (standalone webapp) is the vulnerable part. Likely v2 = embed the audit in the agent loop as a Claude skill / MCP server. The pipeline already lives in `lib/`, well-positioned for this.

Full reasoning in `docs/STRATEGY.md`.

---

## 2026-05-27 · Build → polish → deploy — consolidated decisions

Captures the calls made while building the app and iterating on Theo's feedback. The app is now live at **statesense.vercel.app** (GitHub: tfred-d/statesense).

**IP-protection removals (don't leak the library to users):**
- **Heuristic-focus selector cut entirely.** It exposed all 21 category names. `applies_when` pre-filtering already runs server-side, so a manual scope wasn't needed. (This was hard-cut #1 anyway.)
- **`skipped_heuristics` no longer surfaced.** Stripped from the `/api/audit` response, the UI, and all exports. It revealed heuristic IDs + category slugs. Field stays on the schema for possible future server-side telemetry. (Reverses PRD §8's "skipped heuristics are surfaced" principle.)
- **JSON export sanitized** to mirror the Markdown content — no `heuristic_id`, `audit_id`, or `context_tags_detected`.
- **Coverage score removed from the UI.** Arbitrary number that drove no action. Still computed in the schema; just not shown.

**PDF: reversed @react-pdf → browser print-to-PDF.** @react-pdf generated overlapping, unreadable output and is a fragile ~500KB dependency. Replaced with `window.print()` + print styles (`print:hidden` on chrome, `print:break-inside-avoid` on cards, a print-only title). More reliable, user controls the output, dependency removed from package.json + lockfile.

**Voice input added — overrides the original PRD non-goal.** Web Speech API dictation on the context field, feature-detected (Chrome/Edge/Safari yes, Firefox no). PRD §3 had listed voice input as a non-goal; it was cheap to add via the browser API and supports the "always give context" requirement.

**Feature context is now required (min ~20 chars), was optional.** A PRD upload satisfies it, or a one-liner. Activates intent-scope reliably and prevents thin audits.

**Analytics: Cloudflare Web Analytics, not Vercel's built-in.** Both are cookieless and free-at-our-scale; neither risks the $0 rule (Vercel Hobby caps but never bills). Chose Cloudflare for the genuinely unlimited free tier. The integration is env-driven (`NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`); the component no-ops without a token. Required two CSP fixes: allow `static.cloudflareinsights.com` (script) **and** apex `cloudflareinsights.com` (the RUM data POST).

**Microphone Permissions-Policy fix.** The header shipped `microphone=()` (deny-all), which blocked voice before the browser could prompt. Changed to `microphone=(self)`.

**UX iterations (from Theo's live testing):**
- Progressive (timed, not live) phase labels during the audit wait, replacing a static skeleton caption.
- "Audited" inputs summary above results — screen thumbnails (click to enlarge) + collapsible context.
- Shared `ScreenLightbox` (click-to-enlarge + prev/next + arrow keys) used by both the sample page and the audit results.
- Sample audit page at `/sample` (Resend flow, 11 hand-crafted findings) as the landing proof.
- Landing copy tightened + de-vendored ("API key", not "Anthropic"); "No signup" USP instead of "Costs cents"; icons + subtle hero dot-grid; darker body contrast.
- Em dashes scrubbed from copy + an explicit no-em-dash rule added to the system prompt (AI tell).
- "Built by Theophilus Fredrick" on /about; custom 1200×630 og:image.

**Deferred to post-launch:** per-session audit history. Storing audits means storing base64 screens (multi-MB), which exceeds localStorage limits — needs IndexedDB + a history UI. Real fast-follow, wrong thing to rush.

**Stack cleanup:** dropped `@react-pdf/renderer` (and `transpilePackages` config). shadcn-style primitives written directly rather than via the CLI.

---

## 2026-05-25 · Phase 2 + Phase 3 built — implementation choices

**Decision:** Built the entire Next.js pipeline in one sweep — landing, audit, results, exports, error states, static pages — in parallel with (not after) the quality gate. The two manual audits we ran in conversation suggested the library is in good shape, and the user explicitly authorized the parallel build.

**Key implementation choices:**

1. **shadcn-style primitives, no CLI install.** Wrote the few primitives we need (Button, Input, Textarea, Card, Label, Badge, Separator, Dialog, Select) directly in `components/ui/`. They match the shadcn shape so Theo can `shadcn add <name>` later without breaking anything. Saves an install step and a generated boilerplate footprint.

2. **No streaming for v1.** API route awaits the full Anthropic response, returns the parsed `AuditResult`. The browser renders `AuditSkeleton` during the wait. Streaming + tool_use JSON is fiddly; with concise output + prompt caching, audits land in ~10–15s.

3. **API key flows through our route, not client-direct to Anthropic.** Two reasons: (a) keeps the ~22K-token system prompt server-side, (b) avoids the SDK's `dangerouslyAllowBrowser` flag. Cost: the user's key transits TLS to us as a header. Mitigation: we don't log headers, no third-party analytics on the audit page, strict CSP.

4. **`lib/` is canonical, `scripts/` reuses it.** Deleted `scripts/{types,prompt,schema}.ts` and pointed `scripts/audit.ts` at `lib/`. Single source of truth for the system prompt and tool schema across CLI and API route.

5. **`focus_categories` filters the system prompt before sending.** When the user scopes the audit to specific categories, we filter the heuristics array and the examples object before assembling the prompt. The cache only memoizes the full-library prompt; focus-filtered prompts skip the cache (they're per-request). Trade-off: scoped audits cost more per call but produce focused results.

6. **PDF parsing via dynamic import.** `lib/pdf.ts` lazy-loads `pdfjs-dist` only when a user uploads a PDF. The worker is loaded via Next.js's `?url` query, no separate route needed. Cuts ~500KB from the initial bundle.

7. **Strict-mode TypeScript everywhere.** `tsconfig.json` has `strict: true`, no `any` snuck in, all error paths typed. Theo can run `npm run typecheck` to verify.

8. **Security headers in `next.config.ts`.** CSP allows the Cloudflare Web Analytics beacon and nothing else third-party. X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy cuts camera/mic/geo.

9. **No analytics on the audit flow.** Cloudflare Web Analytics fires on landing, privacy, FAQ, about. The `/audit` page intentionally has no third-party scripts (per CSP) so the key + screens never share a runtime with any beacon.

10. **All ~12 PRD §F6 error states have a typed `ErrorKind`** in `lib/types.ts`, a mapped `Icon` in `error-display.tsx`, and concrete copy. No generic "Something went wrong" fallback.

**Files added (Phase 2 + 3):** ~35 files across `app/`, `components/`, `components/ui/`, `lib/`. Plus updates to `package.json` (Next/React/Radix/PDF/Tailwind deps), `tsconfig.json` (Next config), `.env.example` (Cloudflare token), `.gitignore`. CLI duplicates in `scripts/` removed.

**Pending Theo:** `npm install` to fetch deps, then `npm run dev` for the first local boot. After that: run the CLI quality gate on samples/linear and samples/resend, compare to the manual audits we did, iterate the prompt if needed.

---

## 2026-05-25 · Phase 1 CLI scaffolded — implementation choices

**Decision:** Built the Phase 1 quality-gate CLI ahead of Theo's next token window. Choices made along the way:

1. **TypeScript + tsx**, not plain Node JS. The Phase 2 Next.js app will be TS — sharing types between the CLI and the API route means `Heuristic`, `Finding`, `AuditResult` etc. are defined once in `scripts/types.ts` and reusable. `tsx` is used as the runner so there's no separate compile step for the CLI.

2. **CLI lives in `scripts/`**, not `cli/` or `src/cli/`. Matches the `npm run audit` script in package.json and keeps the layout flat. Phase 2 will add `app/` (Next.js) alongside, no conflict.

3. **System prompt assembled at runtime, not pre-bundled.** `scripts/prompt.ts` reads `heuristics.json`, `examples.json`, and `FINDING_VOICE.md` from disk each call. Avoids stale bundling, lets Theo edit any of the three files and see the effect immediately. The cost is a few ms per audit — negligible against a ~10s Sonnet call.

4. **Cached system prompt structured as a single text block** with `cache_control: { type: "ephemeral" }`. Default 5-min TTL per the locked decision. The heuristics + examples + voice rules are ~22K tokens of cacheable static content; the user message (screens + context) is the per-audit variable.

5. **Tool-use forced via `tool_choice: { type: "tool", name: "submit_audit" }`.** Eliminates the risk of the model emitting prose before/after the tool call. Pairs with the schema's `required` fields to guarantee `element_anchor` + `screen_refs` are present.

6. **CLI accepts flat OR `screens/`-subfolder layouts.** Current samples are flat. The samples/README.md aspirational structure has a subfolder. Both work — the CLI globs whichever exists. No restructuring needed.

7. **`context.md` is optional.** If present, it's appended to the user message and the model is told the intent scope is active. If absent, intent-scope heuristics are skipped entirely. Both Linear and Resend flows got real context.md files written from the in-conversation audits.

**Not yet decided / pending Theo's hand:**
- First end-to-end CLI run (needs `npm install` + an Anthropic key in `.env`)
- 3 more sample flows
- `expected_findings.md` + `rating.md` for each flow
- Tuning the prompt based on what the first runs surface

**Files added:** `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`, `scripts/types.ts`, `scripts/schema.ts`, `scripts/prompt.ts`, `scripts/audit.ts`, `samples/linear/context.md`, `samples/resend/context.md`. `samples/README.md` updated to note flat-or-subfolder.

---

## 2026-05-25 · Build-readiness decisions — five stack calls, all $0

**Context:** Before code starts, a full cross-file consistency review (PRD, STATE, PROGRESS, heuristics docs) surfaced remaining ambiguities. Locked five decisions to prevent drift during the build. All chosen against the hard $0 recurring-cost rule.

**Decisions:**

1. **Analytics → Cloudflare Web Analytics** (not Plausible). Plausible Cloud isn't free — 30-day trial then $9+/mo, which would break the cost rule. Cloudflare Web Analytics is free, cookieless, privacy-friendly, needs no cookie banner, and reads no page state (safer for an app where the API key lives in localStorage).

2. **Structured output → tool-use with `input_schema`** (not free-form JSON + parse). Anthropic doesn't have an OpenAI-style "strict JSON" flag; the reliable enforcement path is tool calls with a typed schema, which the SDK validates and retries on malformed input. PRD §8 wording corrected — earlier draft inaccurately described it as "the API rejects findings."

3. **Prompt cache → default 5-minute TTL** (not 1-hour beta). 1-hour cache costs ~2× to write. The modal user runs one audit per session; the extra write cost would outweigh the rare cross-session reuse. Revisit once usage data shows whether multi-audit sessions are common.

4. **No streaming for v1.** Hard-cut #3 promoted to a real cut. Audits should run <15s with prompt caching; tool-use streaming is harder to parse incrementally than text streaming, and the loading-state skeleton scaffold covers the perceived-performance need. May return in v1.5 if latency data justifies the complexity.

5. **Key validation → Haiku 4.5 ping** (not format-only, not Sonnet). Sub-cent cost, real auth check. Format-only validation would let bad keys reach the first audit and waste a real call's cost on the error. Sonnet would cost a few cents per validation — unnecessary.

**Effect on docs:** PRD §F1, §F3, §F6, §7, §8, §9, §11, §13 updated. CLAUDE.md cost line and scope language updated (week → phase). README.md target-ship date dropped. PROGRESS.md reorganized around phases instead of calendar weeks. Heuristic count discrepancies in `heuristics/README.md` fixed (validation, information-hierarchy, flow-coherence cells were stale; scopes table and total recomputed from 51/5/62 → 53/6/65).

**Alternatives considered:**
- **Plausible Cloud at $9/mo.** Rejected — breaks $0 rule.
- **Self-hosted Plausible / Umami.** Rejected — requires a server, ops > $0.
- **Free-form JSON output.** Rejected — model occasionally emits prose around the JSON, requiring fragile cleanup logic.
- **1-hour prompt cache.** Rejected for v1; revisit when usage data exists.
- **Streaming.** Deferred to v1.5 — non-streaming UX ships first; revisit with real latency numbers.
- **Format-only key validation.** Rejected — saves <$0.01 but degrades the UX of bad-key handling.

---

## 2026-05-25 · Finding-voice concision rules

**Decision:** Added hard word caps to `heuristics/FINDING_VOICE.md` (Rule 9) and embedded them in `heuristics/examples.json` schema notes:

- `title` ≤ 8 words / ≤ 80 chars
- `description` ≤ 30 words (1–2 sentences)
- `suggestion` ≤ 20 words (1 sentence)
- Target: ~50 words per finding total; 12-finding audit reads in <90s

All 65 examples rewritten to the new shape. Output schema in PRD §8 updated to match.

**Why:** A real audit run produced findings that were text-heavy. Designers scan rather than read; long descriptions get skipped. Concision also cuts output tokens ~40%, which compounds for users on BYOK.

**Constraint:** Concision must not strip the anchor. The discipline is "if a sentence carries no new information beyond the title, delete it," not "shorten by removing specifics."

---

## 2026-05-24 · Few-shot examples + strict output schema (universal-wins set)

**Decision:** Add two pieces of model-output discipline that lift quality regardless of model tier:

1. **`heuristics/examples.json`** — a new file with one example finding per heuristic (65 examples), keyed by heuristic id. Loaded with the system prompt as few-shot references so the model has a concrete voice + specificity benchmark for each heuristic. **Not templates** — the schema_notes explicitly state they're pattern references, not structures to copy verbatim.

2. **Strict output schema in PRD §8** — `element_anchor` and `screen_refs` are now required fields on every finding. The model invokes strict-output mode; the API rejects findings missing these. This eliminates the failure mode where the model emits vague findings without anchors.

**File-structure decision:** Examples live in their own file (`examples.json`), not inside `heuristics.json`. Reasons:
- `heuristics.json` already at 65 entries; adding 4 more lines per entry compounds. Keeping it stable keeps edits small.
- Voice refinement happens more often than library structural change. Separating them lets each evolve at its own cadence.
- Schema concern (heuristic definitions) and presentation concern (example findings) are conceptually distinct.
- At audit time, the CLI joins them by id — trivial.

**Why these specifically and not the multi-step / two-pass / self-critique scaffolding:** Theo asked whether scaffolding helps or hurts strong models. Honest answer: examples and strict schema are universal wins (help every tier). Multi-step reasoning scaffolding, two-pass architecture, and self-critique are weak-model lifts that mildly hurt strong models (verbose output, wasted reasoning, latency, cost). Since v1 locks Sonnet 4.6, weak-model scaffolding is premature optimization for users we're not serving. Deferred to v1.5 if/when model selection is added.

**Constraint from this decision:** Examples must vary in length, scenario, and voice. Risk of over-specifying is that the model treats them as templates. Mitigations: schema_notes call them out as pattern references; examples span recipes, e-commerce, dashboards, signup, settings, messaging, editors, etc. — variety prevents context fixation.

---

## 2026-05-24 · Library refinement pass + finding-voice spec

**Decision:** After a critical self-review of v1.2.0 against five mental-test screen archetypes (landing page, dashboard, onboarding, settings, e-commerce PDP), three additions were made and a separate "finding voice" spec was written.

**Three additions to the library** (now at 65 heuristics total):

- `hierarchy.above-the-fold-value` (screen, recommendation, important) — Does the first viewport deliver the screen's primary value? Restoring a heuristic I'd cut earlier; the Julienne example proved it shouldn't have been cut.
- `flow.progress-indication` (flow, gap, important) — Show user's position in multi-step flows. Onboarding and checkout are common cases where this gap matters.
- `validation.required-vs-optional-signal` (screen, gap, important) — Distinguish required from optional form fields. Extremely common designer omission.

**Finding voice spec** — new file `heuristics/FINDING_VOICE.md`. Specifies how the model presents findings to users:
- Anchor every finding to a specific screen + specific element (quote visible copy)
- Natural UI language, not engineering jargon ("card", "field", "section" — not "component", "affordance", "primary CTA")
- Voice matches finding type (gap = imperative, recommendation = "Consider", question = "Is there a reason?")
- Suggestions are concrete (what to add and where, not "improve")
- Cross-screen findings name both screens; intent findings quote the PRD
- Heuristic IDs and category slugs never appear in user-facing text — internal only

**Why:** Theo flagged that even the best heuristics produce mediocre findings if the output voice is jargon-heavy and vague. The voice spec exists separately from the library because it governs presentation, not authoring — and will become the source-of-truth for the system prompt's voice section (Week 1/2 work).

**Self-review also surfaced fragile heuristics to watch at the quality gate** (no cuts yet — wait until samples show false-positive rates):
- `cognitive.density-and-scannability` — vaguest examples in the library
- `consistency.typography-and-spacing` — always-fires; risks generic findings
- `layout.element-overlap-integrity` — always-fires; risks misreading intentional layering

If the quality gate exposes these as noise generators, they get tightened or cut.

**Final v1.2.0 distribution:** 65 heuristics · 53 screen + 6 flow + 6 intent · 42 gap + 12 recommendation + 11 question · 8 critical + 49 important + 8 nice-to-have.

---

## 2026-05-24 · Heuristic library v1.2.0 — three scopes, tiered findings, pre-filtering

**Decision:** Major expansion of the library from 41 to 62 heuristics, with three structural changes:

1. **Three scopes** — every heuristic now has a `scope` field:
   - `screen` (51) — analyzes a single screen
   - `flow` (5) — analyzes across multiple screens (continuity, state preservation, visual system consistency)
   - `intent` (6) — compares the design against the uploaded PRD/context (stated features present, contradictions, journey coverage, constraints respected, user types served)

2. **Tiered finding voice** — every heuristic has a `default_finding_type`:
   - `gap` (directive: "Add X.") — provably absent, designer should add it
   - `recommendation` (suggestive: "Consider X.") — clear better answer in most cases
   - `question` (curious: "Is there a reason X?") — subjective or potentially intentional

3. **Context-tag filtering via `applies_when`** — every heuristic declares preconditions (e.g. `["has-forms"]`, `["flow-multistep"]`, `["prd-states-features"]`). At audit time the system intersects active context tags with each heuristic's `applies_when`; non-matching heuristics are excluded from the audit prompt entirely.

**Why:**
- The product's *inputs* are flow + PRD, but v1.1.0's heuristics were screen-by-screen only. Flow-level coherence and PRD-design alignment were missing — exactly the kind of finding a senior designer reviewing handoff produces. Theo flagged this with a recipe screenshot (Julienne) that exposed both gaps cleanly: v1.1.0 would have skipped 30+ of 41 heuristics on that screen and missed everything a designer would catch.
- Tiered findings let us safely expand into design-judgment territory. Asserting confidently on subjective things destroys credibility; phrasing them as questions opens dialogue and tolerates intentional design choices. This is also how a senior designer actually reviews work.
- Pre-filtering via `applies_when` prevents the model from force-fitting irrelevant heuristics to appear useful. The quality benefit is larger than the token saving (which prompt caching already minimized).

**Net additions in v1.2.0:**
- 10 screen-scope design-judgment heuristics across 7 new categories (information-hierarchy, affordance-clarity, visual-consistency, content-completeness, cognitive-load, mode-and-context, layout-integrity)
- 5 flow-scope heuristics in `flow-coherence`
- 6 intent-scope heuristics in `prd-alignment`
- Output schema in PRD §8 updated: each finding now includes `scope` and `finding_type`
- UI implication: results group by scope first (Gaps in PRD / Flow / Screens), tier as label within

**Final distribution:** 62 heuristics · 51 screen + 5 flow + 6 intent · 40 gap + 11 recommendation + 11 question · 8 critical + 46 important + 8 nice-to-have.

**Alternatives considered:**
- Add screen-level design-judgment without flow/intent. Rejected — the product input is flow + PRD; ignoring those scopes leaves the biggest value gap unaddressed.
- Three separate JSON files (screen, flow, intent). Rejected — single source of truth is cleaner; `scope` field handles the distinction.
- Filter heuristics by removing them from the system prompt per audit. Rejected — that breaks prompt caching. Instead: full library stays in cached system prompt; runtime user-message instruction specifies which IDs to apply.

**Supersedes:** v1.1.0.

---

## 2026-05-24 · Workflow — defer state-file updates to end-of-session sweep

**Decision:** During a working session, only the artifact (heuristics, code, mockups) is written. STATE.md, PROGRESS.md, DECISIONS.md, and (when relevant) PRD.md are updated in a single batched sweep at the end of the session.

**Why:** Theo flagged that updating these files every turn was a recurring token sink — each turn produced 3 reads + 3 edits of state files that could have been one batched update. Deferring saves tokens and reduces noise in the conversation; the trade-off (slight delay before state is "consistent") is negligible for personal-project pace.

**Encoded in:** `CLAUDE.md` working agreement section.

**Alternatives considered:** Continue updating every turn. Rejected — measurable, recurring waste.

---

## 2026-05-24 · Heuristic library v1.1.0 — refocus on designer-actionable findings

**Decision:** Library refactored to ensure every heuristic produces a finding the designer can fix by adding or changing something visible in the design file. New top authoring principle: **"Designer-shown, not engineer-implemented."**

**What was cut (3):**
- `a11y.visible-focus` — focus rings are a browser default; designers usually don't (and shouldn't need to) design custom focus states. The only time this becomes designer-actionable is when they explicitly remove the ring without replacement, which can't be detected from a static screenshot. The heuristic would have produced false positives or required skipping on nearly every audit.
- `validation.timing` — when validation fires (on type, on blur, on submit) is an interaction behavior, not a designed visual state. It belongs in interaction specs or code review.
- `a11y.reduced-motion` — motion can't be observed in static screenshots; this heuristic almost always had to skip, producing low signal.

**What was added (3, new category `action-states`):**
- `actions.success-confirmation` — designer must show what the user sees AFTER a successful action. Commonly missed: designers end the flow at "submit".
- `actions.disabled-primary` — designer must mock the disabled state of primary CTAs, with what's needed to enable them.
- `actions.selected-active` — designer must mock the selected/active state for items in lists, tables, sidebars, tabs.

**Reframing applied to all surviving heuristics:** every `check` is now phrased as "has the designer drawn/included this state?", and every `bad_example` is phrased as "the state isn't in the design file — engineering improvises." This keeps findings actionable for the designer specifically.

**Why:** Theo's review caught drift in v1.0.0 — several heuristics were really engineering or platform-default concerns dressed up as design audits. StateSense is for designers; findings have to result in the designer adding to or correcting the design, not in the engineer changing a config.

**Alternatives considered:**
- Keep cut heuristics but lower their default severity. Rejected — even rare false positives degrade the credibility of a tool that's meant to produce sharp findings.
- Add more heuristics in the new `action-states` category (hover states, pressed states, in-progress multi-step indicators, required-vs-optional field markers). Deferred — these are candidates for future passes; v1.1.0 stays at three high-value action-state heuristics to avoid bloat before the quality gate runs.

---

## 2026-05-24 · Heuristic schema — split `prompt_fragment` into `trigger` + `check`; add `default_severity`

**Decision:** Locked schema for `heuristics.json` is: `id`, `category`, `platforms`, `title`, `trigger`, `check`, `good_example`, `bad_example`, `default_severity`, optional `notes`. The planned `prompt_fragment` field is split into `trigger` (when the heuristic applies) and `check` (what gap is being looked for).

**Why:**
- Splitting forces authoring discipline — heuristics with a fuzzy `prompt_fragment` tended to be vague on both fronts. Forcing the author to write a precondition separate from the question being asked produces sharper heuristics.
- Helps the model decide whether to skip a heuristic on a given screen (anchor-or-skip enforcement is cleaner when the trigger is its own field).
- `default_severity` gives the model a starting point per heuristic; it can still adjust per finding based on context.
- `notes` is for author context only and is excluded when assembling the prompt.

**Alternatives considered:** Keep a single `prompt_fragment` field for simpler prompt assembly. Rejected — the cost of slightly more complex assembly is dwarfed by the authoring-quality gain.

---

## 2026-05-24 · Heuristic library v1.0.0 authored — 41 heuristics across 11 categories

**Decision:** Library v1 contains 41 heuristics. Distribution: Loading & latency (5), Empty (4), Error (4), Auth (4), Validation (4), Connectivity (4), Data variability (4), Concurrency (2), Recovery (3), Accessibility (4), Edge counts (3). All `platforms: ["web"]`.

**Why:**
- Hit the PRD target band of 30–50 heuristics without padding. Stopped adding when the next candidate either overlapped an existing heuristic or felt generic.
- Uneven category distribution is honest: Concurrency has fewer sharp heuristics worth shipping than e.g. Loading; forcing parity would have weakened the library.
- All web-only for now; broadening to mobile happens when the iOS/Android libraries come online, not by retroactively tagging existing entries.

**Alternatives considered:** Aim for 50 to look comprehensive — rejected because filler heuristics produce filler findings, which is exactly the credibility risk the quality gate exists to prevent.

**Superseded by:** 2026-05-24 · Heuristic library v1.1.0 — refocus on designer-actionable findings.

---

## 2026-05-04 · Project scaffolding structure

**Decision:** Root holds `CLAUDE.md`, `README.md`, `STATE.md`, `PROGRESS.md`, `DECISIONS.md`. `docs/` holds PRD and historical outline. `heuristics/` holds the library. `samples/` holds test design flows. No `app/` folder yet — created in week 2 when Next.js work starts.

**Why:** `CLAUDE.md` must be at root to auto-load. The other top-level files are quick references for cold-starting a session — burying them inside `docs/` would add friction. Empty preempted folders (e.g. `app/`) are noise; create them when needed.

**Alternatives considered:** Single `docs/` folder for everything. Rejected because `CLAUDE.md` placement forces a root-level pattern, and the cold-start files benefit from being adjacent to it.

---

## 2026-05-04 · No shareable audit links in v1

**Decision:** Exports limited to Markdown, PDF, and JSON. No "share this audit" link.

**Why:** Shareable links require storing audit content on a server, which contradicts the "screens never stored" privacy promise. Users can share by exporting and pasting/sending the file.

**Alternatives considered:** Scope the privacy promise to "screens never stored, only text findings stored when shared." Rejected as a muddier story for v1; cleaner to defer shareable links until the privacy stance can support them with explicit opt-in.

---

## 2026-05-04 · No native Notion / Linear / Jira integrations in v1

**Decision:** Markdown + PDF + JSON exports only.

**Why:** Each native integration is 1–3 days of OAuth setup + API mapping. Markdown covers ~90% of actual user need ("paste this into my tool"). Build the most-requested integration in v2 once we know which one matters.

**Alternatives considered:** Build Notion first as the most popular target. Rejected to preserve timeline; if Notion is the obvious winner from user feedback, it's the first v2 candidate.

---

## 2026-05-04 · v1 covers Responsive Web only; mobile is "Coming soon"

**Decision:** Heuristic library v1 covers Responsive Web. iOS / Android shown in the platform selector but disabled with a "Coming soon" label.

**Why:** A single platform with a strong heuristic library beats three platforms with a thin one. Mobile becomes a stretch goal in week 1 if the quality gate passes early; otherwise it's post-launch.

**Alternatives considered:** Cover all three platforms from day one. Rejected — doubles library effort during the riskiest week of the project.

---

## 2026-05-04 · BYOK-only for v1 (no hosted free tier)

**Decision:** Users supply their own Anthropic API key. StateSense fronts no inference cost.

**Why:** Keeps StateSense's recurring cost at $0, which was a hard constraint. BYOK adds friction at signup, but it's acceptable for v1; a hosted free tier can layer in later if traction warrants and budget allows.

**Alternatives considered:** Free tier (e.g. 3 audits/wk) on StateSense's bill, then BYOK after. Rejected to preserve the $0 cost rule.

---

## 2026-05-04 · Stack — Next.js + Tailwind + shadcn + Anthropic Sonnet 4.6

**Decision:** Next.js 15 (App Router) on Vercel, Tailwind + shadcn/ui, Anthropic SDK with Claude Sonnet 4.6 and prompt caching enabled. No database (`localStorage` only for v1).

**Why:** Single deployment, generous free tier, strong AI-codegen support — important for a non-coder builder on a 3-week clock. Sonnet 4.6 is the right cost/capability fit for vision + reasoning. Prompt caching cuts repeat-audit cost ~80% by reusing the heuristic library system prompt.

**Alternatives considered:**
- Original outline named "Claude 3.5 Sonnet" — outdated as of 2026; superseded.
- React + a separate hosting provider — works, but more moving parts.
- Adding a database — unnecessary for v1; introduces ops + cost.

---

## 2026-05-04 · Heuristic library is the product's defensible IP

**Decision:** The hand-authored heuristic library — taxonomy, prompt fragments, good/bad examples — is the asset to invest in. A quality gate (≥70% findings rated specific + accurate + actionable on 5 sample flows) blocks all UI work in week 2.

**Why:** Anyone can wrap Claude with a generic "find missing states" prompt. The opinionated, structured heuristic taxonomy is what makes StateSense useful and hard to replicate. If the library is weak, no UI saves the product — which is why the gate must come before UI investment.

**Alternatives considered:** Lean on the model alone with a thin prompt. Rejected — first-impression credibility ceiling is too low; one hallucinated finding closes the tab.
