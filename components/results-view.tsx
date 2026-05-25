"use client";

import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import { FindingCard, loadInitialThumb } from "./finding-card";
import { SkippedList } from "./skipped-list";
import { CoveragePill } from "./coverage-pill";
import { ExportMenu } from "./export-menu";
import { getDismissed, setDismissed as persistDismissed } from "@/lib/storage";
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
  const [dismissed, setDismissed] = useState<Set<string>>(() => getDismissed());

  function dismiss(id: string) {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    persistDismissed(next);
  }

  function undismiss(id: string) {
    const next = new Set(dismissed);
    next.delete(id);
    setDismissed(next);
    persistDismissed(next);
  }

  const visible = useMemo(
    () => result.findings.filter((f) => !dismissed.has(f.id)),
    [result.findings, dismissed]
  );

  const totalCounts = useMemo(() => {
    const gaps = visible.filter((f) => f.finding_type === "gap").length;
    const recs = visible.filter((f) => f.finding_type === "recommendation").length;
    const qs = visible.filter((f) => f.finding_type === "question").length;
    return { gaps, recs, qs };
  }, [visible]);

  if (result.findings.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border bg-card p-8 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">No findings — your design covers the applicable heuristics.</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Honest result. Skipped heuristics below.
          </p>
        </div>
        <SkippedList items={result.skipped_heuristics} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <CoveragePill score={result.coverage_score} />
          <span className="text-xs text-muted-foreground">
            {totalCounts.gaps} gaps · {totalCounts.recs} recommendations · {totalCounts.qs} questions
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
        <ExportMenu result={result} />
      </header>

      {/* Grouped findings */}
      {SCOPE_ORDER.map((scope) => {
        const subset = visible.filter((f) => f.scope === scope);
        if (subset.length === 0) return null;
        return (
          <section key={scope} className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">
              {SCOPE_LABEL[scope]}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({subset.length})
              </span>
            </h2>
            <div className="space-y-3">
              {sortFindings(subset).map((f) => (
                <FindingCard
                  key={f.id}
                  finding={f}
                  initialThumb={loadInitialThumb(f.id)}
                  onDismiss={() => dismiss(f.id)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Dismissed list */}
      {dismissed.size > 0 && (
        <section className="space-y-2 rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{dismissed.size} dismissed</p>
          <ul className="space-y-1">
            {result.findings
              .filter((f) => dismissed.has(f.id))
              .map((f) => (
                <li key={f.id} className="flex items-center gap-2">
                  <span className="truncate">{f.title}</span>
                  <button
                    type="button"
                    onClick={() => undismiss(f.id)}
                    className="text-primary hover:underline"
                  >
                    Restore
                  </button>
                </li>
              ))}
          </ul>
        </section>
      )}

      <SkippedList items={result.skipped_heuristics} />
    </div>
  );
}
