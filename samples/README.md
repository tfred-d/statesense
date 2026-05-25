# Sample design flows

5 design flows used to validate the heuristic library + system prompt before building any UI. This is the week-1 quality gate (see `PROGRESS.md`).

## Folder structure (one folder per flow)

```
samples/
  <flow-name>/
    *.png                # 1–6 image files (PNG/JPG/WEBP) — flat OR in a screens/ subfolder
    context.md           # the feature description / PRD given to the audit (optional)
    expected_findings.md # hand-judged ground-truth list of gaps
    actual_findings.json # output from running the audit (filled during testing)
    rating.md            # per-finding rating: specific? accurate? actionable?
```

The CLI globs for image files in the flow folder directly, or in a `screens/` subfolder if one exists. Pick whichever stays tidy.

## Flows planned

1. _TBD — pick a real-ish flow with at least one obvious unhappy-path gap_
2. _TBD_
3. _TBD_
4. _TBD_
5. _TBD_

Aim for variety: an auth flow, a data-heavy list/feed, a form-with-validation, a payment or transaction flow, a content creation flow. Mix in a flow that's already strong (low-finding case) and one that's intentionally thin (many-findings case) — the model should produce honest results in both.

## How quality is judged

For each finding the audit produces, rate:

- **Specific** — references a concrete element / area on a specific screen (not "consider adding a loading state")
- **Accurate** — the gap is real (not contradicted by something already shown in the design)
- **Actionable** — a designer could address it in one focused design session

A finding passes only if all three are true. The gate requires **≥70% pass rate across all findings from all 5 flows**.

If the gate fails, iterate on the heuristic library and/or system prompt and re-run. UI work does not begin until the gate passes.
