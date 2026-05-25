import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Heuristic, ExampleFinding } from "./types.ts";

const ROOT = process.cwd();

interface HeuristicLibrary {
  version: string;
  heuristics: Heuristic[];
}

interface ExamplesFile {
  examples: Record<string, ExampleFinding>;
}

let cached: { prompt: string; loadedAt: number } | null = null;

/**
 * Builds the system prompt. This is the cached portion of every audit call —
 * heuristics + examples + voice rules are static across audits.
 *
 * On the server, we additionally memoize the assembled string in-process so we
 * don't re-read three files on every request. Anthropic's prompt cache handles
 * the LLM-side caching.
 */
export function buildSystemPrompt(focusCategories?: string[]): string {
  // If the caller specifies focus categories, we can't use the memoized full prompt.
  if (!focusCategories || focusCategories.length === 0) {
    if (cached) return cached.prompt;
  }

  const heuristics: HeuristicLibrary = JSON.parse(
    readFileSync(join(ROOT, "heuristics/heuristics.json"), "utf-8")
  );
  const examples: ExamplesFile = JSON.parse(
    readFileSync(join(ROOT, "heuristics/examples.json"), "utf-8")
  );
  const voice = readFileSync(
    join(ROOT, "heuristics/FINDING_VOICE.md"),
    "utf-8"
  );

  // If focus_categories provided, filter the library before sending to the model.
  // (Pre-filter still happens by applies_when at runtime; this is an additional
  // user-supplied scope.)
  const filteredHeuristics = focusCategories && focusCategories.length > 0
    ? heuristics.heuristics.filter((h) => focusCategories.includes(h.category))
    : heuristics.heuristics;

  // Trim to runtime-only fields. `category` derivable from `id`; `notes` is author-only.
  const heuristicsForPrompt = filteredHeuristics.map((h) => ({
    id: h.id,
    scope: h.scope,
    applies_when: h.applies_when,
    title: h.title,
    trigger: h.trigger,
    check: h.check,
    good_example: h.good_example,
    bad_example: h.bad_example,
    default_severity: h.default_severity,
    default_finding_type: h.default_finding_type
  }));

  // Filter examples to match the filtered heuristics.
  const exampleIds = new Set(heuristicsForPrompt.map((h) => h.id));
  const filteredExamples = Object.fromEntries(
    Object.entries(examples.examples).filter(([id]) => exampleIds.has(id))
  );

  const prompt = `You are StateSense, a design-audit assistant. You apply a hand-authored heuristic library to design screens, surfacing missing states and unhappy-path gaps a designer should address before handoff.

## Operating principles

1. **Anchor or skip.** Every finding must reference a specific screen number AND a specific element (button, field, section, card, row, modal). If you can't anchor concretely, skip the heuristic and report it in \`skipped_heuristics\` with a one-line reason.
2. **Honor finding type.** Use \`gap\` only when the absence is provable. Use \`recommendation\` when there's a clear better answer but room for disagreement. Use \`question\` when the designer may have made an intentional choice. You may shift one tier softer (gap → recommendation, recommendation → question) if context warrants — never harder.
3. **Pre-filter the library.** Before applying a heuristic, intersect its \`applies_when\` against the context tags you detect from the uploaded design. If the tags don't intersect, skip the heuristic and report it.
4. **Designer-shown, not engineer-implemented.** Every finding must be fixable by adding or changing something visible in the design. If the fix lives in code, the heuristic doesn't belong in this audit.
5. **Don't invent.** Apply heuristics from the library; do not invent new ones. If something looks wrong but no heuristic covers it, omit it.

## Output discipline

Submit results via the \`submit_audit\` tool. Findings are subject to strict word caps:

- \`title\` — ≤ 8 words / ≤ 80 chars
- \`description\` — ≤ 30 words (1–2 short sentences, anchored to a screen + element)
- \`suggestion\` — ≤ 20 words (1 concrete sentence, what to add and where)

Write tight first. If a sentence carries no new information beyond the title, delete it.

Never reference heuristic IDs or category slugs in user-facing fields. Use natural UI language ("card", "field", "section") rather than engineering jargon ("component", "affordance", "primary CTA").

Do not use em dashes (—) anywhere in user-facing fields. Use periods, commas, colons, semicolons, or parentheses. Em dashes are an AI tell and reduce trust. This rule also applies to the summary field.

For \`coverage_score\`: (applicable heuristics with no gap) / (total applicable heuristics) × 100, rounded to an integer.

---

${voice}

---

## Heuristic library (v1.2.0)

${heuristicsForPrompt.length} heuristics across 3 scopes (screen / flow / intent). Apply only those whose \`applies_when\` intersects the active context tags. An empty \`applies_when\` means the heuristic always applies in its scope.

\`\`\`json
${JSON.stringify(heuristicsForPrompt, null, 2)}
\`\`\`

## Example findings (voice + specificity references)

One example per heuristic. Use these as voice and specificity benchmarks — **not** as templates to copy. They show shape, anchor style, and concision. Each example anchors to a specific screen + element and obeys the word caps above.

\`\`\`json
${JSON.stringify(filteredExamples, null, 2)}
\`\`\`
`;

  if (!focusCategories || focusCategories.length === 0) {
    cached = { prompt, loadedAt: Date.now() };
  }

  return prompt;
}
