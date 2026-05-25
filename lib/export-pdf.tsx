"use client";

// Lazy-loaded PDF export. We dynamically import @react-pdf/renderer the first
// time a user clicks "Download PDF" so the ~500 KB library doesn't ship in the
// initial bundle. Next.js also needs transpilePackages set for this lib —
// configured in next.config.ts.

import type { AuditResult, Finding, Severity, Scope } from "./types";

const severityOrder: Record<Severity, number> = {
  critical: 0,
  important: 1,
  "nice-to-have": 2
};

const scopeLabel: Record<Scope, string> = {
  screen: "Screen findings",
  flow: "Flow findings",
  intent: "PRD alignment"
};

const tierLabel = {
  gap: "Gap",
  recommendation: "Recommendation",
  question: "Question"
} as const;

function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return a.heuristic_id.localeCompare(b.heuristic_id);
  });
}

export async function exportPdf(result: AuditResult): Promise<Blob> {
  // Dynamic import keeps the PDF library out of the initial JS bundle and
  // avoids any SSR issues with @react-pdf's CommonJS internals.
  const { Document, Page, StyleSheet, Text, View, pdf } = await import(
    "@react-pdf/renderer"
  );
  const React = await import("react");

  const styles = StyleSheet.create({
    page: {
      padding: 48,
      fontSize: 11,
      fontFamily: "Helvetica",
      color: "#111"
    },
    h1: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
    meta: { fontSize: 10, color: "#666", marginBottom: 4 },
    summary: { fontSize: 11, marginTop: 12, marginBottom: 16, lineHeight: 1.5 },
    h2: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1.2,
      marginTop: 18,
      marginBottom: 10,
      textTransform: "uppercase",
      color: "#666"
    },
    card: {
      marginBottom: 14,
      paddingBottom: 12,
      borderBottom: 1,
      borderColor: "#eaeaea"
    },
    cardTitle: { fontSize: 13, fontWeight: 700, marginBottom: 4 },
    cardMeta: { fontSize: 9, color: "#666", marginBottom: 6 },
    cardDesc: { fontSize: 10, lineHeight: 1.5, marginBottom: 6 },
    cardSuggest: { fontSize: 10, lineHeight: 1.5, color: "#333" }
  });

  const gaps = result.findings.filter((f) => f.finding_type === "gap").length;
  const recs = result.findings.filter((f) => f.finding_type === "recommendation").length;
  const qs = result.findings.filter((f) => f.finding_type === "question").length;
  const scopes: Scope[] = ["intent", "flow", "screen"];

  const doc = React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.h1 }, "StateSense audit"),
      React.createElement(
        Text,
        { style: styles.meta },
        `${gaps} gap${gaps === 1 ? "" : "s"} · ${recs} recommendation${recs === 1 ? "" : "s"} · ${qs} question${qs === 1 ? "" : "s"}`
      ),
      React.createElement(Text, { style: styles.summary }, result.summary),
      ...scopes.flatMap((scope) => {
        const subset = result.findings.filter((f) => f.scope === scope);
        if (subset.length === 0) return [];
        return [
          React.createElement(
            View,
            { key: scope, wrap: false },
            React.createElement(Text, { style: styles.h2 }, scopeLabel[scope]),
            ...sortFindings(subset).map((f) =>
              React.createElement(
                View,
                { key: f.id, style: styles.card, wrap: false },
                React.createElement(Text, { style: styles.cardTitle }, f.title),
                React.createElement(
                  Text,
                  { style: styles.cardMeta },
                  `${tierLabel[f.finding_type]} · ${f.severity} · ${
                    f.screen_refs.length > 0
                      ? `Screen ${f.screen_refs.join(", ")}`
                      : "PRD-level"
                  }`
                ),
                React.createElement(Text, { style: styles.cardDesc }, f.description),
                React.createElement(
                  Text,
                  { style: styles.cardSuggest },
                  `Suggested: ${f.suggestion}`
                )
              )
            )
          )
        ];
      })
    )
  );

  return pdf(doc).toBlob();
}
