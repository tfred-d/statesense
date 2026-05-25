// Canonical types for StateSense. Imported by both the Next.js app and the CLI.
// Source of truth: PRD §8.

export type Scope = "screen" | "flow" | "intent";
export type FindingType = "gap" | "recommendation" | "question";
export type Severity = "critical" | "important" | "nice-to-have";
export type Platform = "web";

export interface Finding {
  id: string;
  scope: Scope;
  finding_type: FindingType;
  severity: Severity;
  heuristic_id: string;
  screen_refs: number[];
  element_anchor: string;
  title: string;
  description: string;
  suggestion: string;
}

export interface SkippedHeuristic {
  heuristic_id: string;
  reason: string;
}

export interface AuditResult {
  audit_id: string;
  platform: Platform;
  context_tags_detected: string[];
  summary: string;
  coverage_score: number;
  findings: Finding[];
  skipped_heuristics: SkippedHeuristic[];
}

export interface Heuristic {
  id: string;
  category: string;
  scope: Scope;
  applies_when: string[];
  platforms: Platform[];
  title: string;
  trigger: string;
  check: string;
  good_example: string;
  bad_example: string;
  default_severity: Severity;
  default_finding_type: FindingType;
  notes?: string;
}

export interface ExampleFinding {
  title: string;
  description: string;
  suggestion: string;
}

export interface ScreenInput {
  /** 0-indexed screen number */
  index: number;
  /** Original filename, used as a hint to the model */
  name: string;
  /** Base64 image data (no data: URL prefix) */
  data: string;
  /** MIME type */
  media_type: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
}

export interface AuditRequest {
  screens: ScreenInput[];
  context: string | null;
  platform: Platform;
  /** Optional category slugs to scope the audit. Empty / undefined = all. */
  focus_categories?: string[];
}

/** Possible app-level error states the UI must render. PRD §F6. */
export type ErrorKind =
  | "no-internet"
  | "no-key"
  | "invalid-key"
  | "no-credit"
  | "rate-limited"
  | "anthropic-error"
  | "file-too-large"
  | "wrong-format"
  | "corrupt-pdf"
  | "pdf-no-text"
  | "empty-results"
  | "no-storage"
  | "unknown";

export interface AppError {
  kind: ErrorKind;
  message: string;
  detail?: string;
}
