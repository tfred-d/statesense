# Heuristic library — summary

**One-line view of every heuristic for fast review.** Full text in `heuristics.json`. Schema and principles in `README.md`.

Each entry: `id` · finding type · severity · one-line summary.

> Manually mirrored from `heuristics.json`. Regenerate when JSON changes substantively.

**v1.2.0** · 65 heuristics · 3 scopes · 21 categories · all `platforms: ["web"]`

**By scope:** 53 screen · 6 flow · 6 intent
**By finding type:** 42 gap · 12 recommendation · 11 question
**By severity:** 8 critical · 49 important · 8 nice-to-have

---

# SCREEN scope (53)

Applies to a single uploaded screen.

## Loading & latency (5)

- **`loading.skeleton-vs-spinner`** · gap · important — Add a skeleton frame approximating the eventual content layout.
- **`loading.optimistic-rollback`** · gap · critical — Add the failure-state frame for optimistic updates (reverted visual + error feedback + retry).
- **`loading.long-operation-progress`** · gap · important — Design a progress UI (bar, %, time) and cancel affordance for operations over ~2s.
- **`loading.background-refresh-indicator`** · recommendation · nice-to-have — Consider a visible 'updating…' indicator or 'new data available' affordance.
- **`loading.action-acknowledgment`** · gap · important — Add the in-flight state of primary buttons (disabled, inline spinner, label change).

## Empty states (4)

- **`empty.first-time-vs-cleared`** · gap · important — Add two distinct empty states: first-time vs. user-emptied.
- **`empty.filtered-no-results`** · gap · important — Add a distinct empty state for filtered/searched lists with a 'clear filters' affordance.
- **`empty.search-no-results`** · gap · important — Add a no-results state that echoes the search term with 'did you mean' suggestions.
- **`empty.permission-restricted`** · gap · important — Add a distinct state for 'you don't have access' vs. 'no content exists'.

## Error states (4)

- **`error.recovery-path-present`** · gap · critical — Add explicit CTAs (retry, edit, support) to every error state.
- **`error.scope-matches-cause`** · recommendation · important — Design errors at the right scope (field / form / page / component).
- **`error.differentiate-failure-modes`** · gap · important — Design distinct states for offline / server-down / validation / permission errors.
- **`error.preserve-user-input`** · gap · critical — Mock the error state with form fields still populated, not blank.

## Auth & permissions (4)

- **`auth.session-expired-mid-action`** · gap · critical — Mock the in-context re-auth modal AND the post-reauth state showing work preserved.
- **`auth.protected-screen-logged-out`** · gap · important — Mock what a logged-out user sees on a protected URL.
- **`auth.unallowed-action-visible`** · question · important — Is there a designed treatment for actions the user can see but can't perform?
- **`auth.reauth-for-sensitive-action`** · recommendation · important — Consider a re-auth gate (password / 2FA) before destructive actions.

## Validation (4)

- **`validation.server-rejection-after-client-pass`** · gap · important — Mock the post-submit state for server-only rejections.
- **`validation.format-hints-pre-error`** · recommendation · important — Consider visible format hints in the field's default state, not only in error.
- **`validation.async-availability`** · gap · important — Mock loading / available / unavailable states for fields requiring server checks.
- **`validation.required-vs-optional-signal`** · gap · important — Distinguish required from optional fields visually (asterisks, 'Optional' tags, legend).

## Connectivity (4)

- **`connectivity.offline-mode`** · gap · important — Mock the offline state — banner, queued indicators, what still works.
- **`connectivity.slow-network`** · recommendation · nice-to-have — Consider an 'online but slow' state distinct from a regular load.
- **`connectivity.request-timeout`** · gap · important — Mock the long-running timeout state with [Keep waiting] [Retry] [Cancel].
- **`connectivity.retry-ux`** · gap · important — Add an explicit retry button in failure states.

## Data variability (4)

- **`data.long-text-overflow`** · gap · important — Mock at least one example with realistic long text to demonstrate overflow.
- **`data.null-or-missing-fields`** · gap · important — Mock a variant with optional fields empty/null.
- **`data.large-numbers`** · recommendation · nice-to-have — Consider mocking with a large value ('2.5M') to specify formatting.
- **`data.i18n-text-expansion`** · recommendation · nice-to-have — If localization is in scope, include expanded-label and/or RTL variants.

## Concurrency (2)

- **`concurrency.stale-data-edit`** · gap · important — Mock the conflict-resolution UI for save attempts on stale data.
- **`concurrency.action-while-loading`** · gap · important — Mock the disabled state of actions while dependent data is loading.

## Recovery (3)

- **`recovery.undo-destructive`** · recommendation · important — Consider an undo toast after destructive actions, in addition to (or instead of) confirm.
- **`recovery.confirm-irreversible`** · gap · critical — Mock proportional confirmation (type the email, re-auth) for irreversible actions.
- **`recovery.autosave-indicator`** · gap · important — Add a visible save-state indicator ('Saved', 'Saving…', 'Unsaved changes').

## Accessibility states (2)

- **`a11y.error-not-color-only`** · gap · important — Use color + icon + text for errors — never color alone.
- **`a11y.touch-target-size`** · gap · important — At mobile breakpoint, ensure tap targets are 44×44px+ with separation.

## Edge counts (3)

- **`counts.singular-vs-plural`** · gap · nice-to-have — Mock copy variants for singular and plural counts.
- **`counts.too-many`** · gap · important — Mock variants with very large counts (99+, paginated lists).
- **`counts.one-item-affordance`** · gap · important — Mock the layout with exactly one item.

## Action states (3)

- **`actions.success-confirmation`** · gap · important — Mock what the user sees AFTER the action succeeds.
- **`actions.disabled-primary`** · gap · important — Mock the disabled state of primary CTAs with the enabling prerequisite shown.
- **`actions.selected-active`** · gap · important — Mock the selected/active state of items in lists, sidebars, tabs.

## Information hierarchy (3) — new in v1.2.0

- **`hierarchy.subject-identity`** · question · important — Is the content's primary identifier (name/title) prominently visible?
- **`hierarchy.primary-action-dominance`** · question · important — Is exactly one action visually dominant as THE primary action?
- **`hierarchy.above-the-fold-value`** · recommendation · important — Does the first viewport deliver the screen's primary value (identity, key info, primary action)?

## Affordance clarity (1) — new in v1.2.0

- **`affordance.interactive-looks-interactive`** · question · important — Do interactive elements have a visible signal of interactivity?

## Visual consistency (2) — new in v1.2.0

- **`consistency.same-type-same-treatment`** · gap · important — Are all instances of the same element type treated identically?
- **`consistency.typography-and-spacing`** · question · nice-to-have — Is the typographic scale and spacing system applied consistently?

## Content completeness (2) — new in v1.2.0

- **`content.evaluation-metadata`** · recommendation · important — Consider showing metadata users need to evaluate the content (time, ratings, etc.).
- **`content.trust-signals`** · question · nice-to-have — Is there a designed signal of trustworthiness (rating, attribution, badge)?

## Cognitive load (1) — new in v1.2.0

- **`cognitive.density-and-scannability`** · question · nice-to-have — Is visual density appropriate for the user's task?

## Mode and context (1) — new in v1.2.0

- **`mode.current-mode-visible`** · question · important — Is the current mode/context visibly indicated?

## Layout integrity (1) — new in v1.2.0

- **`layout.element-overlap-integrity`** · gap · important — Do elements unintentionally overlap or clip (floating bars over content, etc.)?

---

# FLOW scope (6) — new in v1.2.0

Applies across multiple screens. Activates when ≥2 screens are uploaded.

## Flow coherence (6)

- **`flow.continuity-between-steps`** · gap · important — Identify missing steps between screens that disrupt flow continuity.
- **`flow.navigation-back-cancel`** · gap · important — Add visible back / cancel affordances at every step.
- **`flow.state-preservation-cross-screen`** · gap · important — Show user input/selection visibly persisting on subsequent screens.
- **`flow.visual-system-consistency`** · question · important — Are typography/spacing/components consistent across all flow screens?
- **`flow.entry-and-exit-states`** · recommendation · important — Consider designing clear entry trigger and completion/exit states.
- **`flow.progress-indication`** · gap · important — Show the user's position in the flow at every step (counter, progress bar, named step).

---

# INTENT scope (6) — new in v1.2.0

Compares the design against the PRD or context provided. Activates when a PRD/context is uploaded.

## PRD alignment (6)

- **`intent.stated-features-present`** · gap · critical — Identify PRD-stated features with no corresponding designed element.
- **`intent.design-contradicts-prd`** · gap · critical — Surface places where the design contradicts explicit PRD claims.
- **`intent.stated-goals-served`** · recommendation · important — Consider whether the design supports stated user goals.
- **`intent.primary-journey-complete`** · question · important — Is the entire PRD-described user journey represented?
- **`intent.stated-constraints-respected`** · gap · critical — Identify PRD-stated constraints (mobile, a11y, etc.) not visibly demonstrated.
- **`intent.user-types-served`** · question · important — Are all PRD-mentioned user types/roles addressed by the design?

---

## How to review

Scan top-to-bottom in ~5 minutes. For each entry:
- Does the one-line summary match how you'd describe it as a staff designer?
- Is the **finding type** (gap / recommendation / question) right for the level of certainty?
- Is the **severity** appropriate?
- Anything missing in the scope?

Edits / cuts / additions: list `id`s with notes, and I'll update the JSON.
