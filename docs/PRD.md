# StateSense — Product Requirements Document

**Version:** v1.0 (launch scope)
**Author:** Theo
**Last updated:** 2026-05-04
**Target ship date:** None — sequence, not calendar. Phases gated by the quality milestone.

---

## 1. Overview

StateSense is a free, browser-based diagnostic tool that audits app designs for missing states and unhappy-path gaps before they reach engineering. A designer uploads 1–6 screens plus a feature description (typed or PDF), and the tool returns a structured, screen-anchored checklist of missing states, logic conflicts, and edge cases — graded by a curated library of UX and technical heuristics.

The product runs entirely in the user's browser using their own Anthropic API key (BYOK). Nothing is stored on StateSense's servers.

---

## 2. Problem

Designers naturally focus on the happy path: ideal data, fast network, authenticated user. Unhappy paths — network loss, expired sessions, validation errors, empty/partial data, race conditions, edge content — are routinely under-specified. The cost lands downstream:

- Designers redo work mid-sprint when devs surface gaps
- Developers improvise unspecified states, producing inconsistent UX
- Production bugs ship from edge cases nobody owned
- Handoff cycles balloon with back-and-forth clarification

Existing options are weak: general AI chat gives generic, unstructured answers; design-system state libraries help with components but not flow-level logic; design reviews catch some issues but depend on reviewer attention.

StateSense's wedge is a **curated, opinionated heuristic library** — applied consistently, every audit, anchored to specific screens.

---

## 3. Goals & Non-goals

### Goals (v1)
- Surface **specific, screen-anchored** gaps a designer can act on before handoff
- Reduce design-to-dev rework loops on covered features
- Run at $0 ongoing cost (BYOK; no server-side storage)
- Establish a credible heuristic library that becomes the product's defensible IP

### Non-goals (v1)
- iOS and Android heuristic libraries (visible in selector as "Coming soon")
- Figma plugin or Figma file import
- Persistent project history, accounts, or team features
- Shareable audit links
- Native Notion / Linear / Jira integrations
- Voice input
- Hosted free tier (StateSense paying for inference)
- Custom heuristics or heuristic editor

---

## 4. Target users

**Primary — Product designers** preparing handoff. They want to ship cleaner specs and stop being caught out by "what about when X?" questions.

**Secondary — Product managers** validating requirements coverage. They want to know the design fully expresses the PRD before a sprint commits.

**Tertiary — Engineers** doing pre-sprint review. They want a fast scan for missing designs before estimation.

v1 design and copy lead with the primary user. Secondary/tertiary follow naturally.

---

## 5. Core user flow

1. **Landing page** — value prop, sample audit, "Start an audit" CTA
2. **API key setup** (first run only) — BYOK flow with a "Why?" explainer covering cost, privacy, and where to get a key. Key stored in `localStorage`, never sent to StateSense servers
3. **New audit** — single-page workflow:
   - **Platform selector** — Responsive Web ✓ / iOS (Coming soon, disabled) / Android (Coming soon, disabled)
   - **Upload screens** — drag-drop or click, 1–6 images (PNG / JPG / WEBP), max 5MB each, in-order (sequence matters for flow analysis)
   - **Feature context** — one of: typed description, pasted text, PDF upload (parsed client-side via `pdfjs-dist`)
   - **Heuristic focus** (optional) — default "All categories." Power users can scope to specific categories (e.g. only Validation + Connectivity)
   - **Run audit** button
4. **Loading state** — single API call, ~10–30s. Skeleton results scaffold, not just a spinner
5. **Results view** — findings grouped by scope (PRD alignment → Flow → Screens), then by severity within each group. Each finding contains:
   - Scope (Screen / Flow / Intent) and finding type (Gap / Recommendation / Question)
   - Severity (Critical / Important / Nice-to-have)
   - Screen reference (which uploaded screen, plus a thumbnail)
   - Element anchor — the specific element being referenced
   - Description of the gap (≤30 words)
   - Concrete suggestion (≤20 words)
   - Thumbs up / thumbs down ("Was this useful?")
6. **Export** — Copy as Markdown / Download PDF / Download JSON
7. **Re-run / new audit** — clear and start over, or refine and re-run with same inputs

---

## 6. Functional requirements

### F1 — BYOK authentication
- User enters Anthropic API key on first run, stored only in browser `localStorage`
- "Forget my key" button in settings
- Key validated with a sub-cent Haiku 4.5 ping before allowing audits
- Clear error states for: invalid key, no credit, rate-limited

### F2 — Inputs
- 1–6 image uploads, max 5MB each, total size capped at 20MB
- Feature context: text (min 50 chars to discourage low-quality inputs) or PDF (parsed to text client-side; max 20 pages)
- Platform: Responsive Web required for v1; mobile options visible but disabled

### F3 — Audit execution
- Single Claude Sonnet 4.6 vision call with images + heuristic library system prompt
- System prompt is **prompt-cached** (default 5-min TTL) to reduce cost on repeat audits — the heuristic library + examples + voice spec are the cacheable static portion
- **Non-streaming for v1.** Audits run <15s with prompt caching; the loading state shows a skeleton scaffold of the results view. Streaming may return in v1.5 if observed latency makes it worth the parsing complexity.
- Output is **structured JSON** via Anthropic **tool-use with `input_schema`** (see §8) — the SDK validates the schema and retries malformed responses once

### F4 — Results
- Findings grouped by category, sorted by severity within group
- Each finding renders the referenced screen thumbnail next to the text
- Findings can be marked thumbs-up / thumbs-down (stored in localStorage; aggregated to telemetry without finding text content)
- "Dismiss this finding" option for false positives — dismissed findings hidden but kept in export with a `dismissed: true` flag

### F5 — Exports
- **Copy as Markdown** — formatted, copy-paste ready for Notion, Linear, Slack
- **Download as PDF** — branded report, includes thumbnails, generated client-side
- **Download as JSON** — full structured findings, for devs who want to script against it

### F6 — Tool-level states
StateSense itself must not skip its own unhappy paths. The audit-the-auditor list:
- No internet
- Invalid / expired / no-credit API key
- Anthropic API error or timeout
- File too large / wrong format / corrupt PDF / image-only PDF (no extractable text)
- Empty results (genuinely nothing to flag)
- Rate-limited
- localStorage unavailable (private browsing)

---

## 7. The heuristic library (product IP)

This is the most important asset in the codebase. It is a structured taxonomy of failure modes a designer should consider, with each heuristic encoding *what to look for*, *what good looks like*, and *what bad looks like*.

### Library shape (v1.2.0)

**65 heuristics across 21 categories, 3 scopes** (53 screen · 6 flow · 6 intent), all `platforms: ["web"]`. Full taxonomy in `heuristics/SUMMARY.md`.

### Heuristic schema (v1.2.0)

Each heuristic is structured as:

```json
{
  "id": "loading.optimistic-rollback",
  "category": "loading-latency",
  "scope": "screen",
  "applies_when": ["has-optimistic-actions"],
  "platforms": ["web"],
  "title": "Designed failure state for optimistic UI updates",
  "trigger": "A user action immediately updates the UI before the server confirms…",
  "check": "Has the designer included a frame showing what the UI looks like when the optimistic update fails?",
  "good_example": "…",
  "bad_example": "…",
  "default_severity": "critical",
  "default_finding_type": "gap"
}
```

Full schema and field meanings live in `heuristics/README.md`. The library is hand-authored; the LLM applies heuristics — it doesn't invent them.

### Quality gate (week 1 milestone)

Before any UI is built, the heuristic library + prompt are validated by running them against 5 sample design flows (mix of well-known apps and personal past projects). Findings are graded for:
- **Specificity**: does the finding cite a specific element or area, not generic advice?
- **Accuracy**: is the gap real, or did the model hallucinate something the screen already shows?
- **Actionability**: can a designer act on it in one design session?

Target: ≥70% of findings rated specific + accurate + actionable. If the gate fails, prompt and library are iterated before UI work begins.

---

## 8. Output schema

The model is instructed to return JSON in this shape (validated client-side; malformed responses retried once):

```json
{
  "audit_id": "uuid-v4",
  "platform": "web",
  "context_tags_detected": ["has-forms", "has-async-content", "has-collections", "flow-multistep", "prd-states-features"],
  "summary": "Brief overall summary of design coverage",
  "coverage_score": 72,
  "findings": [
    {
      "id": "uuid-v4",
      "scope": "screen | flow | intent",
      "finding_type": "gap | recommendation | question",
      "severity": "critical | important | nice-to-have",
      "heuristic_id": "empty.first-time-vs-cleared",
      "screen_refs": [2],
      "element_anchor": "the cart screen on Screen 2",
      "title": "Cart screen has no first-time empty state",
      "description": "Screen 2 shows the cart with items, but there is no design for the user's first visit (no items yet vs. items removed by user — these need different copy and CTAs).",
      "suggestion": "Add a distinct empty state for first-time users with onboarding copy ('Add your first item') vs. emptied-state ('Your cart is empty — continue shopping')."
    }
  ],
  "skipped_heuristics": [
    { "heuristic_id": "concurrency.stale-data-edit", "reason": "No editable content present in uploaded screens" }
  ]
}
```

### Strict required fields (every finding)

These fields are **required** on every finding. The model is invoked via Anthropic **tool-use with a JSON `input_schema`** — the SDK validates the schema and retries malformed responses once. Without `element_anchor` and `screen_refs`, no finding can be emitted, eliminating vague output.

| Field | Required | Notes |
|---|---|---|
| `id` | ✓ | UUID v4, unique per finding |
| `scope` | ✓ | `screen` / `flow` / `intent` |
| `finding_type` | ✓ | `gap` / `recommendation` / `question` |
| `severity` | ✓ | `critical` / `important` / `nice-to-have` |
| `heuristic_id` | ✓ | Must match an entry in `heuristics.json` |
| `screen_refs` | ✓ | Array of screen numbers. Can be empty for intent findings about PRD-level concerns |
| `element_anchor` | ✓ | Specific element being referenced, 5–15 words, quoting visible copy when possible |
| `title` | ✓ | ≤8 words, ≤80 chars |
| `description` | ✓ | 1–2 short sentences, ≤30 words |
| `suggestion` | ✓ | 1 sentence, concrete, ≤20 words |

`category` is derived by the CLI from `heuristic_id` (the slug before the `.`) — not requested from the model.

### Three principles enforced via the prompt

- **Anchor or skip**: every finding must include a valid `element_anchor` and at least one `screen_ref` (or quote the PRD for intent findings). The strict schema enforces this — the model can't emit a finding without anchors.
- **Honor finding type**: voice matches type — `gap` uses imperative ("Add X"); `recommendation` uses "Consider X"; `question` uses "Is there a reason X?". The model may adjust a heuristic's default type if context warrants.
- **Skipped heuristics are surfaced**: the user sees which heuristics didn't apply and why — honesty over false confidence.

### Three scopes

| Scope | What it analyzes | Activates when |
|---|---|---|
| `screen` | A single screen in isolation | Always |
| `flow` | Multiple screens as a sequence | ≥2 screens uploaded |
| `intent` | Design vs. PRD/context | A PRD or context is uploaded |

Results UI groups findings by scope first (PRD alignment → Flow → Screens), with tier as a label within each group.

### Few-shot examples for the model

At audit time, `heuristics/examples.json` provides one example finding per heuristic id. These are loaded with the system prompt so the model has a voice reference for each heuristic — not as a template to copy, but as a shape and specificity benchmark.

---

## 9. Technical architecture

### Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | One deployment, free tier, great AI-codegen support |
| Hosting | Vercel | Free tier ample for v1; near-zero ops |
| UI | Tailwind + shadcn/ui | Designer-friendly, AI-codegen-friendly, fast |
| LLM | Anthropic Claude Sonnet 4.6 | Vision + reasoning at sensible cost; prompt caching support |
| LLM SDK | `@anthropic-ai/sdk` | Official, prompt caching first-class |
| PDF parsing | `pdfjs-dist` | Client-side; no PDFs ever leave the browser before Anthropic call |
| PDF export | `@react-pdf/renderer` | Client-side rendering of the report |
| Analytics | Cloudflare Web Analytics (free, cookieless) | Aggregate page views + audit completion events; no content captured; no cookie banner needed |
| Auth | None (BYOK = identity) | Zero infra, zero cost |
| Database | None (`localStorage` only) | Zero infra, zero cost |

### Request flow

1. Browser collects screens (base64) + parsed PDF text + user's API key
2. Browser calls a thin Next.js API route (`/api/audit`) — exists only to keep the API call shape consistent and to attach the cached system prompt
3. API route proxies to Anthropic with **tool-use** (`input_schema`) + **prompt caching** enabled on the heuristic library system prompt
4. Response returned to browser (non-streaming for v1)
5. Browser parses, validates JSON, renders findings

### Cost model

- **StateSense pays:** $0 (Vercel free tier, Cloudflare Web Analytics free, no DB)
- **User pays:** Anthropic API costs against their own key
- **Per audit cost (estimate):** ~$0.05–$0.20 depending on screen count, with prompt caching bringing this down ~80% on repeat audits in the same session

---

## 10. Privacy & data handling

The privacy story is part of the product, not an afterthought.

### What we promise
- **Screens are sent to Anthropic for analysis only.** Anthropic's API does not use API inputs to train models.
- **Screens are never stored on StateSense servers.** They are transmitted in a single request and discarded.
- **Your API key never leaves your browser** except as the auth header on the call to Anthropic.
- **No content telemetry.** We track aggregate counts (e.g. "audit completed") and thumbs up/down ratios, never finding text or screens.

### Plain-language version (for the UI)
> Your screens are sent to Anthropic for analysis, never stored by us, and never used to train any model. Your API key stays in your browser.

### Where this is shown
- API key entry screen
- Footer of every page
- About / FAQ page

---

## 11. Success metrics

### Activation
- % of landing-page visitors who complete first audit (target: 15%)
- Time from landing to first audit completion (target: <5 min)

### Quality
- Average thumbs-up rate on findings (target: ≥70%)
- % of audits where the user exports findings (proxy for "found this useful enough to take it somewhere")

### Retention
- Audits per returning user per week
- 7-day return rate

### Cost
- StateSense recurring cost (target: $0)

Metrics captured via Cloudflare Web Analytics custom events. No content, no PII, no cookies.

---

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| **Heuristic library quality is weak → findings feel generic → no one comes back** | Quality gate at end of week 1 against 5 sample flows; UI work blocked until pass |
| **Model hallucinations damage credibility on first impression** | Prompt enforces "anchor or skip"; surface skipped categories instead of inventing findings |
| **BYOK friction kills activation** | Clear "what / why / where" explainer; a 5-screen demo audit on the landing page using a sample flow so users see value before key entry |
| **3-week timeline slips** | Hard cuts in priority order: drop heuristic-focus selector, drop dismiss action, drop streaming, drop PDF export (markdown stays). Landing page can be ugly. |
| **Anthropic API or pricing changes mid-build** | Pin SDK version; abstract the model name to one config constant |
| **Privacy promise breaks on a quiet edge** (e.g. a logging library that captures payloads) | Keep server route minimal; no logging libraries with default body capture; pre-launch privacy review of every dependency |

---

## 13. Timeline

No fixed calendar — sequence, not dates. Phases gated by the quality milestone.

### Phase 1 — Heuristic library + prompt + quality gate (current)
- ✅ Author heuristic library v1.2.0 (65 heuristics, 21 categories, 3 scopes, web-only)
- ✅ Author per-heuristic few-shot examples + finding-voice spec (with concision rules)
- Design v1 system prompt (anchor-or-skip; tool-use JSON output)
- Build a CLI script that runs an audit against image + text inputs
- Collect 5 sample design flows in `samples/`
- Run quality gate; iterate until ≥70% findings rated specific + accurate + actionable
- **Exit criterion: prompt + library produce useful findings on test flows.** No UI work begins until this passes.

### Phase 2 — Core app
- Next.js scaffold, Tailwind + shadcn setup, Vercel deploy of empty shell
- API key entry + localStorage handling + Haiku 4.5 validation ping
- Audit page: platform selector, screen upload, feature context input, heuristic-focus selector
- API route with tool-use + prompt caching wired
- Results view (non-streaming for v1): findings grouped by scope → severity
- Tool-level error states (no key, bad key, API error, etc.)

### Phase 3 — Polish, exports, launch
- Markdown / PDF / JSON export
- Landing page with sample audit
- Privacy / FAQ / About page
- 5–10 friendly-user tests; iterate on copy and findings rendering
- Cloudflare Web Analytics integration
- Final privacy dependency review
- **🚀 Launch** when phase 3 ships.

### Hard cuts (in order, if scope creeps)
1. Heuristic-focus selector (default to "All")
2. "Dismiss finding" action
3. PDF export (markdown + JSON ship)
4. Landing-page sample audit (replace with static screenshots)

---

## 14. Open questions

- **Sample audit on landing page** — do we hardcode a real audit's output as a static asset, or run a live audit against pre-uploaded screens using a StateSense-provided API key (with strict daily limit)? Live is more compelling but adds the only $-cost component to the architecture.
- **Heuristic library format** — JSON file in repo (simplest), or a Notion/Airtable-backed library Theo can edit without deploying? JSON is the v1 default; revisit if iteration speed becomes the bottleneck.
- **Re-run with same inputs** — should we cache the previous audit result client-side and let users compare runs? Cheap to add if useful; defer unless asked for during user tests.

---

## 15. Future (post-launch, if traction)

- iOS + Android heuristic libraries (selector activates)
- Figma plugin (likely v2 distribution play — meets designers in their workflow)
- Hosted free tier (StateSense pays for first N audits to remove BYOK friction)
- Native Notion / Linear / Jira export (build the most-requested first)
- Custom heuristics — let teams add their own checks
- Shareable audit links (with explicit opt-in storage)
- Team / org accounts
- Comparison mode: re-run after design changes, diff the findings
