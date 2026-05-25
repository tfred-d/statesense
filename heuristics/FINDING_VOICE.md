# Finding voice — output guidance for the audit prompt

This file specifies how findings are **presented to users** in the audit output. It governs the model's writing voice — separate from how heuristics are **authored** (covered in `README.md`).

**Goal:** Findings read like a senior designer reviewing your work, not a linter logging violations. The user should never have to interpret jargon or guess what the finding is about.

This file is the source-of-truth for the system prompt's voice section (to be written in Week 1 / 2).

---

## Rules

### 1. Anchor every finding to a specific screen and a specific element

A finding without an anchor is noise. Every finding must include:

- A specific **screen number** (e.g. "Screen 2")
- A specific **element** on that screen (button, field, section, card, row, badge, modal, etc.)
- **Visible copy** quoted when it helps locate the element ("the 'Add to cart' button", "the 'Cooking for 4' label in the bottom bar")

If the model can't anchor, it skips the finding — it never produces a vague finding.

### 2. Use natural UI language, not engineering or design jargon

| Avoid | Prefer |
|---|---|
| "Primary CTA" | "The 'Continue' button" / "the main action button" |
| "Component" | "Card", "field", "section", "row", "drawer" |
| "Affordance" | "It's not clear that the QR code is interactive" |
| "Async content" | "Content that loads from the server" |
| "Heuristic violation" | (Never reference the heuristic by name in user output) |
| "Coverage gap" | "There's no designed state for…" |

### 3. Voice matches finding type

| Type | Opening pattern | Example |
|---|---|---|
| **gap** | "There's no…", "Add…", "Mock…", "Design the…" | "There's no designed empty state on Screen 1 for when the user has no saved items yet." |
| **recommendation** | "Consider…", "It would help to…", "We'd suggest…" | "Consider adding prep time and servings near the dish name — these help users decide at a glance." |
| **question** | "Is there a reason…?", "What's the intent behind…?", "Is it intentional that…?" | "Is there a reason the recipe name isn't visible on this screen? Users land here without knowing what they're cooking." |

The model may shift one tier softer (e.g. gap → recommendation) if the absence might be intentional in context — but never harder (recommendation → gap) unless evidence is unambiguous.

### 4. Suggestions are concrete

A suggestion must tell the designer **what to add** or **what to change** — not "improve" or "consider better." If the model can't specify, the suggestion is too vague.

| Avoid | Prefer |
|---|---|
| "Improve hierarchy" | "Move the dish name above the image as an H1, ~32px" |
| "Better error handling" | "Add a form-level error banner above the email field that shows the server response" |
| "More clarity" | "Add a 'Scan' label below the QR code, or wrap it in a button frame" |

### 5. Cross-screen findings name both screens

Flow-scope findings reference all screens involved:

> ✅ "Screen 1 shows 'Add to cart'; Screen 3 shows 'Order confirmation'. The cart-review or checkout step that should sit between them isn't in the uploaded flow."

> ❌ "There's a missing step in the flow."

### 6. Intent findings quote the PRD

Intent-scope findings reference the PRD claim being checked, quoted or paraphrased precisely:

> ✅ "The PRD states 'no signup required for first audit', but the audit screen has a 'Sign up to continue' button gating access. These two are in direct conflict — is signup actually required, or should the gate be removed?"

> ❌ "The design contradicts the PRD."

### 7. Heuristic IDs and category slugs never appear in user-facing text

`hierarchy.subject-identity` and `information-hierarchy` are internal labels. They appear in the structured output (for filtering and analytics) but never in finding text shown to the user.

### 8. Don't speculate about engineering implementation

The audit is for designers. Don't recommend "use a service worker" or "add prompt caching" — recommend what the **design** should show.

### 9. Be concise. Designers scan, they don't read.

Hard caps per finding:

| Field | Max | Why |
|---|---|---|
| `title` | ≤8 words | A glance-able headline. If it doesn't fit, the finding isn't focused enough. |
| `description` | ≤30 words (1–2 sentences) | Anchor + the specific gap. No softening clauses, no recapping the title. |
| `suggestion` | ≤20 words (1 sentence) | Concrete fix. If the fix needs more, split into two findings. |

Total target: ~50 words per finding. A 12-finding audit should read in under 90 seconds.

**Before → after**

> ❌ "Screen 4 shows the failed-payment state with the message 'Payment could not be processed' but no buttons or links — just the error text. The user has no path forward." (29 words)

> ✅ "Screen 4 shows 'Payment could not be processed' with no buttons or links. Nowhere to go from here." (17 words)

Cuts: the meta-description ("the failed-payment state"), the dash-clause restatement ("just the error text"), and softening ("The user has"). Information identical, ~40% fewer words.

The model should write tight first, not write long and trim. If a sentence carries no new information beyond the title, delete it.

---

## Worked examples — Julienne recipe screen

Drawing on the Julienne screenshot we discussed. These illustrate what the model should produce.

### Good finding (gap, screen scope)

> **Title:** Greek Yoghurt is shown as text instead of an image
> **Description:** In the ingredient grid on Screen 1, 13 ingredients have circular photo thumbnails. The Greek Yoghurt card shows the letters "GY" in plain text on a beige background — visually inconsistent with the rest of the grid.
> **Suggestion:** Add a circular thumbnail for Greek Yoghurt — either a photograph or, if a photo isn't available, a stylized icon that fills the same circular shape as the other ingredient cards.

### Good finding (question, screen scope)

> **Title:** The dish name isn't visible on the recipe screen
> **Description:** Screen 1 shows the photo, the ingredient grid, and the cooking steps, but the recipe's name (the dish being made) doesn't appear anywhere on the page. Users land here without knowing what they're about to make.
> **Suggestion:** Is the dish name intentionally absent — handled in a previous screen, perhaps? If not, consider placing it as a prominent heading above the image or to the right of the photo.

### Good finding (gap, screen scope — layout)

> **Title:** The bottom action bar overlaps the ingredient list
> **Description:** The floating bottom bar (containing "Cooking for 4", Save, Watch, Cook) covers part of the ingredient grid on Screen 1. The "Maple Syrup Or Honey" card peeks out from underneath the bar, suggesting the bar's height wasn't accounted for in the grid's bottom padding.
> **Suggestion:** Add bottom padding to the ingredient grid equal to the bar's height (plus a comfortable margin), or shift the bar to a position that doesn't overlap content.

### Good finding (question, screen scope — affordance)

> **Title:** The QR code in the top-left isn't labeled
> **Description:** A QR code sits in the top-left corner of Screen 1 without a caption, border, or accompanying label. Users may not know what it does — Scan for the recipe on mobile? Share? Open something?
> **Suggestion:** Is the QR code intentionally unlabeled? Consider adding a small "Scan to cook" or "Scan for mobile" label below it, and a subtle border or hover state so it reads as interactive.

### Bad findings (and why)

> ❌ **Title:** Recipe page has hierarchy issues
> **Description:** Screen 1 fails the hierarchy.subject-identity heuristic.
> **Suggestion:** Improve hierarchy.

Problems: vague title, references internal heuristic ID, no anchor to specific elements, useless suggestion.

> ❌ **Title:** Affordance unclear
> **Description:** Some elements lack proper affordance signals.
> **Suggestion:** Add affordance.

Problems: no specific element identified, "affordance" is jargon, no specific suggestion.

> ❌ **Title:** Empty state coverage incomplete
> **Description:** Screen 2 has missing empty-state variants per empty.first-time-vs-cleared.
> **Suggestion:** Add appropriate empty states.

Problems: jargon, internal ID exposed, no specific suggestion.

---

## How this fits with the schema

The structured output retains internal labels for filtering:

```json
{
  "heuristic_id": "consistency.same-type-same-treatment",
  "category": "visual-consistency",
  "scope": "screen",
  "finding_type": "gap",
  "title": "Greek Yoghurt is shown as text instead of an image",
  "description": "...",
  "suggestion": "..."
}
```

The internal fields (`heuristic_id`, `category`, `scope`, `finding_type`) are used by the UI for grouping, filtering, and analytics. The user-facing fields (`title`, `description`, `suggestion`) follow the voice rules above.
