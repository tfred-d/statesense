import type { AuditResult, Finding, Severity } from "./types.ts";

const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  important: "Important",
  "nice-to-have": "Nice to have"
};

const typeLabel = {
  gap: "Gap",
  recommendation: "Recommendation",
  question: "Question"
} as const;

const severityOrder: Record<Severity, number> = {
  critical: 0,
  important: 1,
  "nice-to-have": 2
};

const scopeLabel = {
  screen: "Screen findings",
  flow: "Flow findings",
  intent: "PRD alignment"
} as const;

function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return a.heuristic_id.localeCompare(b.heuristic_id);
  });
}

export function exportMarkdown(result: AuditResult): string {
  const lines: string[] = [];

  lines.push("# StateSense audit");
  lines.push("");
  lines.push(`**Coverage score:** ${result.coverage_score}/100`);
  lines.push(`**Context tags:** ${result.context_tags_detected.join(", ") || "—"}`);
  lines.push("");
  lines.push(result.summary);
  lines.push("");

  for (const scope of ["intent", "flow", "screen"] as const) {
    const subset = result.findings.filter((f) => f.scope === scope);
    if (subset.length === 0) continue;

    lines.push(`## ${scopeLabel[scope]}`);
    lines.push("");

    for (const f of sortFindings(subset)) {
      const screens =
        f.screen_refs.length > 0
          ? `Screen ${f.screen_refs.join(", ")}`
          : "PRD-level";
      lines.push(
        `### ${f.title} — *${typeLabel[f.finding_type]} · ${severityLabel[f.severity]} · ${screens}*`
      );
      lines.push("");
      lines.push(f.description);
      lines.push("");
      lines.push(`**Suggested:** ${f.suggestion}`);
      lines.push("");
    }
  }

  if (result.skipped_heuristics.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Heuristics skipped");
    lines.push("");
    for (const s of result.skipped_heuristics) {
      lines.push(`- \`${s.heuristic_id}\` — ${s.reason}`);
    }
  }

  return lines.join("\n");
}
