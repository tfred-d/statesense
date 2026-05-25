# Heuristic library

The hand-authored library of UX/technical checks StateSense applies to designs. **This is the project's defensible IP — invest disproportionately here.**

## Status

- Schema: **locked** as of 2026-05-24 (v1.2.0).
- Library: **65 heuristics** across 21 categories, 3 scopes, all `platforms: ["web"]`. Live in `heuristics.json`.
- Quick-scan: `SUMMARY.md`.
- Output voice spec: `FINDING_VOICE.md`.
- Per-heuristic example findings (few-shot references): `examples.json`.
- Quality gate: **not yet run.** Sample design flows still need to be collected in `samples/`.

## File layout

| File | Purpose | Edit cadence |
|---|---|---|
| `heuristics.json` | Library definitions (one entry per heuristic) | Rarely — additions or schema changes |
| `examples.json` | One example finding per heuristic, keyed by id | Iterate freely; voice refinements live here |
| `SUMMARY.md` | One-line view of every heuristic | Regenerate after JSON changes |
| `FINDING_VOICE.md` | Output language rules for the audit prompt | Living spec; refined as quality gate teaches us |
| `README.md` | Schema, principles, and this layout | Update when structure changes |

Examples are split into their own file so `heuristics.json` doesn't grow every time we tune voice, and so edits to either file stay small.

## Schema (locked, v1.2.0)

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
  "default_finding_type": "gap",
  "notes": "Optional, author-only — not sent to the model."
}
```

### Field meanings

| Field | Purpose |
|---|---|
| `id` | `category.short-name`, dot-separated, unique |
| `category` | Slug, must be one of the categories list in the JSON |
| `scope` | `screen` / `flow` / `intent` — what level the heuristic operates at |
| `applies_when` | Array of context tags. Empty array = always applies. Used for pre-filtering. |
| `platforms` | `["web"]` for v1; mobile tags add when those libraries come online |
| `title` | Short human-readable name |
| `trigger` | **When does this heuristic apply?** The precondition |
| `check` | **What is the gap being looked for?** The question asked of the design |
| `good_example` | A concrete pattern that handles the situation correctly |
| `bad_example` | A concrete pattern that exemplifies the failure |
| `default_severity` | `critical` / `important` / `nice-to-have` |
| `default_finding_type` | `gap` (directive) / `recommendation` / `question` — voice of the finding. Model may adjust per finding. |
| `notes` | Optional author context — not sent to model |

## Scopes

| Scope | Activates when | Heuristic count |
|---|---|---|
| `screen` | Always (≥1 screen uploaded) | 53 |
| `flow` | ≥2 screens uploaded forming a sequence | 6 |
| `intent` | A PRD or context is uploaded | 6 |

The three scopes degrade gracefully. One screen + no PRD = only screen-scope fires. Multi-screen flow + PRD = all three. The model is given heuristics from active scopes only.

## Finding types

| Type | Voice | When |
|---|---|---|
| `gap` | "Add X." "Mock Y." "Design the Z state." | The state/element is provably absent. Most state-coverage findings. |
| `recommendation` | "Consider X." "We recommend Y." | A clear better answer in most cases, but legitimate room for disagreement. |
| `question` | "Is there a reason X isn't shown?" "What's the intent behind Y?" | Subjective or context-dependent — the designer may have made an intentional choice. |

The model is instructed to honor the default type but adjust if context warrants (e.g., a directive heuristic might phrase as a question on an edge case).

## Applies-when vocabulary

Tags for `applies_when`:

**Screen properties:** `has-forms`, `has-auth`, `has-collections`, `has-search-or-filter`, `has-async-content`, `has-destructive-actions`, `has-optimistic-actions`, `has-long-form-editing`, `has-user-content`, `has-detail-view`, `has-primary-cta`, `has-numeric-content`, `has-mobile-breakpoint`

**Flow context:** `flow-multistep`, `flow-with-state-carry`

**PRD context:** `prd-states-features`, `prd-states-goals`, `prd-states-constraints`, `prd-describes-journey`, `prd-mentions-user-types`

A heuristic with empty `applies_when: []` always applies in its scope.

At audit time, the system intersects the heuristic's `applies_when` with the active context tags (declared by user or detected by model). Heuristics that match get included in the audit; those that don't are skipped without consuming reasoning tokens.

## Categories (v1.2.0)

| # | Category | Count | Scope |
|---|---|---|---|
| 1 | loading-latency | 5 | screen |
| 2 | empty-states | 4 | screen |
| 3 | error-states | 4 | screen |
| 4 | auth-permissions | 4 | screen |
| 5 | validation | 4 | screen |
| 6 | connectivity | 4 | screen |
| 7 | data-variability | 4 | screen |
| 8 | concurrency | 2 | screen |
| 9 | recovery | 3 | screen |
| 10 | accessibility-states | 2 | screen |
| 11 | edge-counts | 3 | screen |
| 12 | action-states | 3 | screen |
| 13 | information-hierarchy | 3 | screen |
| 14 | affordance-clarity | 1 | screen |
| 15 | visual-consistency | 2 | screen |
| 16 | content-completeness | 2 | screen |
| 17 | cognitive-load | 1 | screen |
| 18 | mode-and-context | 1 | screen |
| 19 | layout-integrity | 1 | screen |
| 20 | flow-coherence | 6 | flow |
| 21 | prd-alignment | 6 | intent |

**Total: 65.** Quality > quantity. Uneven distribution is intentional.

## Authoring principles

- **Designer-shown, not engineer-implemented.** Every finding must be actionable by adding or changing something visible in the design.
- **Tier matches certainty.** Use `gap` only when the absence is provable; use `question` when the designer may have made an intentional choice.
- **Anchor or skip.** The model is instructed to skip a heuristic if it cannot anchor the finding to a specific screen, flow, or PRD claim.
- **Good and bad examples are required.** "Designer shipped a frame for this state" (good) vs. "Designer didn't ship a frame — engineering improvises" (bad).
- **Split trigger from check.** Trigger is the precondition; check is the question. Authors who mix them write vague heuristics.
- **Use `applies_when` to keep the model focused.** A heuristic with broad `applies_when` will fire on every audit — only mark something broad when it truly applies broadly.

## Quality gate (blocks phase-2 UI work)

Before any UI is built, this library + the system prompt must achieve **≥70% findings rated specific + accurate + actionable** on 5 sample design flows in `samples/`. If the gate fails, iterate.
