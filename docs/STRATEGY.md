# StateSense — Strategy & v2 direction

Written 2026-05-27, at the close of the v1 build. Captures a strategic question Theo raised and the reframe it produced, so the thinking isn't lost before v2.

---

## The question that prompted this

> Many designers no longer design every screen in Figma. They describe what they want to Claude (or v0 / Lovable / Bolt), and the coding agent builds the UI — and those agents already factor in a lot of edge cases. So what's the value of a tool that audits designs for missing states?

It's the right question to ask, because it tests the core thesis StateSense was built on: *a curated heuristic library is more valuable than a generic prompt to the same model* (see DECISIONS.md, 2026-05-04, "Heuristic library is the product's defensible IP").

---

## The honest read

### Where the concern is valid

For **screen-level** state coverage, it's partly true. When an agent generates a UI, it tends to emit "complete-looking" components — a loading skeleton, a basic empty state, some error handling — because that's what its training rewards. So a subset of StateSense's screen-scope heuristics overlaps with what the agent already produces. That subset loses some edge.

### Where it doesn't hold — disaggregated by our three scopes

- **Screen scope** — partially absorbed by coding agents. Weakest position.
- **Flow scope** — *not* absorbed. Agents build screen-by-screen / component-by-component. They don't reason about state carrying across screens, back/cancel paths, or missing intermediate steps. Whole-journey coherence is structurally hard for a tool generating one view at a time.
- **Intent / PRD scope** — *not* absorbed, and arguably grows. "Does the built UI match the spec? Are all stated features present? Does it contradict the PRD?" An agent optimizes for "make something that runs," not "conform to this document."

### The deeper shift

The real change isn't "edge cases are handled now." It's that **generation volume goes up and human review goes down.** A designer hand-building states in Figma at least *saw* each one. When an agent emits 2,000 lines in one shot, nobody sees what got silently skipped — and the agent never says "I added a loading state but skipped the offline and stale-data states." There is no audit trail of omissions.

As generation gets cheaper and more trusted-by-default, **verification becomes the bottleneck.** A systematic, opinionated checker is *more* useful in that world, not less. The job didn't disappear; the consumer changed — from "the engineer at handoff" to "production / real users."

### The moat question (the one that actually matters)

The threat isn't coding agents. It's that "audit this UI for missing states" can *also* be asked of the same model inline: *"what edge cases did you skip?"* So the durable value has to be exactly the original bet: **a curated, structured, consistently-applied heuristic library** beats a one-off prompt that varies every run and misses things unpredictably.

This question doesn't kill that bet — **it is the test of it.** The cheapest, highest-value experiment before investing in v2:

> Run the same flow through StateSense **and** through a naive "find the gaps" prompt to the same model. Compare. If our 65 heuristics produce sharper, more complete, more consistent results, we have a product. If they don't, we have a feature.

Do that comparison first. It decides everything below.

---

## What to reconsider for v2: the packaging, not the job

The product's *job* (surface missing unhappy-path states — systematically, anchored, opinionated) holds up. The most vulnerable piece is the *packaging*: "a standalone webapp you upload Figma screens to." The durable asset is the library; it can live in several form factors.

Three repositionings, roughly in order of how well they meet the emerging workflow:

1. **Embed in the agent loop (highest potential).** A Claude skill / MCP server that auto-runs the heuristic audit on generated output, inside the same session that built the UI. Meets the workflow where it's going instead of asking people to leave it. This is likely the real v2.

2. **Shift-left spec tool.** Feed it the PRD *first*; it returns the states the prompt needs to cover *before* generation. It improves the prompt, not just the output. Complements #1.

3. **Verification layer for shipped/AI-built UIs.** Same audit, but the artifact is screenshots of the running generated app and the "handoff" is to production. Mostly a copy/positioning change ("before you ship" instead of "before handoff") — cheapest to try, lowest ceiling.

---

## Concrete next steps (when the project resumes)

1. **Run the moat comparison** (StateSense vs. naive prompt, same flow). Gate everything on the result.
2. If it passes: **prototype the MCP/skill form factor** (#1). The whole pipeline already lives in `lib/` (`system-prompt.ts`, `audit-schema.ts`) — it's well-positioned to be exposed as a tool, not just a webapp.
3. Revisit the landing/positioning copy toward "before you ship," regardless of form factor.
4. Keep investing in the library — it's the asset every form factor depends on.

The webapp we built is a fine v1 surface and a real testbed for the library. v2 is about meeting designers inside the AI workflow rather than beside it.
