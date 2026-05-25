"use client";

import { useMemo } from "react";
import { Inbox } from "lucide-react";
import { FindingCard, loadInitialThumb } from "./finding-card";
import { ExportMenu } from "./export-menu";
import type { AuditResult, Finding, Scope, Severity } from "@/lib/types";

interface Props {
  result: AuditResult;
}

const SCOPE_ORDER: Scope[] = ["intent", "flow", "screen"];
const SCOPE_LABEL: Record<Scope, string> = {
  intent: "PRD alignment",
  flow: "Flow findings",
  screen: "Screen findings"
};

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  important: 1,
  "nice-to-have": 2
};

function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    if (SEVERITY_ORDER[a.severity] !== SEVERITY_ORDER[b.severity]) {
      return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    }
    return a.heuristic_id.localeCompare(b.heuristic_id);
  });
}

export function ResultsView({ result }: Props) {
  const counts = useMemo(() => {
    const gaps = result.findings.filter((f) => f.finding_type === "gap").length;
    const recs = result.findings.filter((f) => f.finding_type === "recommendation").length;
    const qs = result.findings.filter((f) => f.finding_type === "question").length;
    return { gaps, recs, qs };
  }, [result.findings]);

  if (result.findings.length === 0) {
    return (
      <div className="rounded-md border bg-card p-8 text-center">
        <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="mt-3 font-semibold">No findings. Your design covers the applicable heuristics.</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Honest result. Nothing to flag.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {counts.gaps} gap{counts.gaps === 1 ? "" : "s"} ·{" "}
          {counts.recs} recommendation{counts.recs === 1 ? "" : "s"} ·{" "}
          {counts.qs} question{counts.qs === 1 ? "" : "s"}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
        <ExportMenu result={result} />
      </header>

      {SCOPE_ORDER.map((scope) => {
        const subset = result.findings.filter((f) => f.scope === scope);
        if (subset.length === 0) return null;
        return (
          <section key={scope}>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {SCOPE_LABEL[scope]}{" "}
              <span className="ml-1 font-medium normal-case tracking-normal">
                ({subset.length})
              </span>
            </h2>
            <div className="divide-y divide-border">
              {sortFindings(subset).map((f) => (
                <FindingCard
                  key={f.id}
                  finding={f}
                  initialThumb={loadInitialThumb(f.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
