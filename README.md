# StateSense

Diagnostic tool that audits app designs for missing states and unhappy-path gaps. A designer uploads a few screens plus a feature description; StateSense returns a structured, screen-anchored checklist of what's missing — based on a curated library of UX and technical heuristics.

## Status

Pre-launch · moving at the maintainer's pace (no fixed ship date)

## Where things live

| File / folder | Purpose |
|---|---|
| `CLAUDE.md` | Project rules and working agreement (auto-loaded by Claude Code) |
| `STATE.md` | Current state — read this first when picking up |
| `PROGRESS.md` | Week-by-week timeline and task tracker |
| `DECISIONS.md` | Chronological log of architectural and product decisions |
| `docs/PRD.md` | Full product requirements document |
| `docs/outline.md` | Original idea sketch (kept for history) |
| `heuristics/` | The heuristic library — project IP |
| `samples/` | Sample design flows for week-1 quality validation |

## Stack

Next.js 15 (App Router) on Vercel · Tailwind + shadcn-style UI · Anthropic Claude Sonnet 4.6 (audit) + Haiku 4.5 (key validation) · pdfjs-dist · @react-pdf/renderer · Cloudflare Web Analytics (cookieless).

BYOK — users supply their own Anthropic API key. No server-side storage.

## Running locally

```bash
npm install

# Only the CLI uses ANTHROPIC_API_KEY; the web app gets the key from the
# browser at runtime. NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN can stay empty in dev.
cp .env.example .env

# Web app — http://localhost:3000
npm run dev

# CLI quality-gate audit against a sample flow folder
npm run audit -- samples/linear
npm run audit -- samples/resend
```
