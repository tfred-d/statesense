import type Anthropic from "@anthropic-ai/sdk";

/**
 * Anthropic tool-use input_schema for the audit. The SDK validates the model's
 * tool input against this schema. PRD §8 is the source of truth — keep aligned.
 */
export const AUDIT_TOOL = {
  name: "submit_audit",
  description:
    "Submit the structured audit result. Every finding must include element_anchor and at least one screen_ref (or quote the PRD for intent findings). Honor the word caps on title, description, suggestion.",
  input_schema: {
    type: "object",
    required: [
      "audit_id",
      "platform",
      "context_tags_detected",
      "summary",
      "coverage_score",
      "findings",
      "skipped_heuristics"
    ],
    properties: {
      audit_id: {
        type: "string",
        description: "UUID v4 unique to this audit"
      },
      platform: { type: "string", enum: ["web"] },
      context_tags_detected: {
        type: "array",
        items: { type: "string" },
        description:
          "Context tags detected in the uploaded screens and/or PRD. Drawn from the applies_when_vocabulary in heuristics.json."
      },
      summary: {
        type: "string",
        description: "Brief overall summary of design coverage. 1–3 sentences."
      },
      coverage_score: {
        type: "number",
        minimum: 0,
        maximum: 100,
        description:
          "Heuristic ratio: (applicable heuristics with no gap) / (total applicable heuristics) × 100."
      },
      findings: {
        type: "array",
        items: {
          type: "object",
          required: [
            "id",
            "scope",
            "finding_type",
            "severity",
            "heuristic_id",
            "screen_refs",
            "element_anchor",
            "title",
            "description",
            "suggestion"
          ],
          properties: {
            id: { type: "string", description: "UUID v4 unique per finding" },
            scope: { type: "string", enum: ["screen", "flow", "intent"] },
            finding_type: {
              type: "string",
              enum: ["gap", "recommendation", "question"]
            },
            severity: {
              type: "string",
              enum: ["critical", "important", "nice-to-have"]
            },
            heuristic_id: {
              type: "string",
              description: "Must match an entry in heuristics.json"
            },
            screen_refs: {
              type: "array",
              items: { type: "integer", minimum: 0 },
              description:
                "Screen numbers (0-indexed). Empty only for intent findings about PRD-level concerns with no screen anchor."
            },
            element_anchor: {
              type: "string",
              description:
                "Specific element being referenced, 5–15 words, quoting visible copy when possible."
            },
            title: {
              type: "string",
              maxLength: 80,
              description: "Headline, ≤ 8 words / ≤ 80 chars."
            },
            description: {
              type: "string",
              description: "1–2 short sentences, ≤ 30 words. Anchor + the specific gap."
            },
            suggestion: {
              type: "string",
              description: "1 concrete sentence, ≤ 20 words. What to add and where."
            }
          }
        }
      },
      skipped_heuristics: {
        type: "array",
        items: {
          type: "object",
          required: ["heuristic_id", "reason"],
          properties: {
            heuristic_id: { type: "string" },
            reason: {
              type: "string",
              description:
                "One short line: why this heuristic didn't apply to the uploaded design."
            }
          }
        }
      }
    }
  }
} as const satisfies Anthropic.Messages.Tool;
