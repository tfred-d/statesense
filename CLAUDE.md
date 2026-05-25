# StateSense — Project Rules

This file is auto-loaded into every Claude Code session for this project. Keep it short and high-signal. Update it when decisions change a rule (and log the rationale in `DECISIONS.md`).

## What StateSense is

A free, browser-based diagnostic tool that audits app designs for missing states and unhappy-path gaps. BYOK (users supply their own Anthropic API key). Full spec in `docs/PRD.md`.

## When starting a session

Read in this order:
1. **CLAUDE.md** (this file)
2. **STATE.md** — where the project is right now
3. **PROGRESS.md** — what's done, what's next
4. **DECISIONS.md** — recent calls and why
5. `docs/PRD.md` — only when you need full spec detail

## Hard rules

### Cost
- **Zero recurring cost.** Vercel free tier, Cloudflare Web Analytics (free, cookieless), Anthropic via BYOK only.
- If a recommendation introduces ongoing cost, flag it and stop before implementing.

### Privacy
- **No server-side storage** of user content (screens, PRDs, findings).
- API keys live in the user's `localStorage` only — never logged, never sent to StateSense servers.
- **No content telemetry** — aggregate counts only (page views, audit completions, thumbs up/down ratios). Never finding text, never screen content.

### Tech stack (locked for v1)
- Next.js 15 (App Router) on Vercel
- Tailwind + shadcn/ui
- Anthropic SDK (`@anthropic-ai/sdk`) with prompt caching
- Claude Sonnet 4.6 for the audit call
- `pdfjs-dist` for client-side PDF parsing
- `@react-pdf/renderer` for client-side PDF export
- `localStorage` only — no database

Don't introduce new frameworks or libraries without flagging it as a decision and updating `DECISIONS.md`.

### Scope
- v1 = **Responsive Web only**. iOS / Android visible in selector, disabled.
- Hard-cuts list (PRD §13, mirrored in `PROGRESS.md`) is the order of triage if scope creeps.
- Don't add features beyond v1 scope without explicit approval, even if "easy."

### Heuristic library quality
- The hand-authored heuristic library is the product IP. Invest in it.
- Findings must **anchor to a specific screen or skip** — never invent.
- Quality gate (≥70% specific + accurate + actionable on 5 sample flows) **blocks UI work** in phase 2.

## Working agreement

- Theo is a staff product designer with limited dev experience. Don't assume framework familiarity in explanations; briefly explain *what* a piece does and *why* it's the right fit.
- Trust Theo's product instincts. Push back on technical scope, not product direction, unless asked.
- For changes that affect **architecture, scope, or stack**: pause and confirm before implementing.
- For changes within scope (writing heuristics, building UI per PRD): proceed.
- Treat this as a real product going to real users — not a demo.

## State-file update workflow

To minimize per-turn token cost, state-file updates are **deferred and batched**, not done every turn.

- **During a session**: only write the artifact (heuristics, code, mockups, etc.). Do not touch STATE / PROGRESS / DECISIONS mid-flight.
- **At end of session** (when wrapping up a unit of work): a single batched sweep:
  - Update `STATE.md` with where we are and the next concrete action
  - Tick relevant items in `PROGRESS.md`
  - Prepend a new entry to `DECISIONS.md` **only if** a real architectural/scope/stack/product call was made (not for wording iterations)
  - Update `PRD.md` if a meaningful spec change was made
- **Skip eager verification**: don't `ls` after `mkdir`, don't re-read files just written, don't re-validate JSON unless something complex happened. Trust the tools.
- **Skip when not relevant**: if the session was pure discussion without artifact production, the sweep can be empty.
