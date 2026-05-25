"use client";

import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { AuditResult, Finding, Severity, Scope } from "./types.ts";

const severityOrder: Record<Severity, number> = {
  critical: 0,
  important: 1,
  "nice-to-have": 2
};

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
    fontSize: 14,
    fontWeight: 700,
    marginTop: 20,
    marginBottom: 10,
    borderBottom: 1,
    borderColor: "#ddd",
    paddingBottom: 4
  },
  card: {
    marginBottom: 14,
    padding: 12,
    border: 1,
    borderColor: "#eaeaea",
    borderRadius: 4
  },
  cardTitle: { fontSize: 12, fontWeight: 700, marginBottom: 4 },
  cardMeta: { fontSize: 9, color: "#666", marginBottom: 6 },
  cardDesc: { fontSize: 10, lineHeight: 1.5, marginBottom: 6 },
  cardSuggest: { fontSize: 10, lineHeight: 1.5, color: "#333" },
  skipped: { marginTop: 16 },
  skippedItem: { fontSize: 9, color: "#666", marginBottom: 2 }
});

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

function AuditDocument({ result }: { result: AuditResult }) {
  const scopes: Scope[] = ["intent", "flow", "screen"];
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>StateSense audit</Text>
        <Text style={styles.meta}>Coverage score: {result.coverage_score}/100</Text>
        <Text style={styles.meta}>
          Context tags: {result.context_tags_detected.join(", ") || "—"}
        </Text>
        <Text style={styles.summary}>{result.summary}</Text>

        {scopes.map((scope) => {
          const subset = result.findings.filter((f) => f.scope === scope);
          if (subset.length === 0) return null;
          return (
            <View key={scope} wrap={false}>
              <Text style={styles.h2}>{scopeLabel[scope]}</Text>
              {sortFindings(subset).map((f) => (
                <View key={f.id} style={styles.card} wrap={false}>
                  <Text style={styles.cardTitle}>{f.title}</Text>
                  <Text style={styles.cardMeta}>
                    {tierLabel[f.finding_type]} · {f.severity} ·{" "}
                    {f.screen_refs.length > 0
                      ? `Screen ${f.screen_refs.join(", ")}`
                      : "PRD-level"}
                  </Text>
                  <Text style={styles.cardDesc}>{f.description}</Text>
                  <Text style={styles.cardSuggest}>
                    Suggested: {f.suggestion}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}

        {result.skipped_heuristics.length > 0 && (
          <View style={styles.skipped} wrap={false}>
            <Text style={styles.h2}>Heuristics skipped</Text>
            {result.skipped_heuristics.map((s) => (
              <Text key={s.heuristic_id} style={styles.skippedItem}>
                {s.heuristic_id} — {s.reason}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function exportPdf(result: AuditResult): Promise<Blob> {
  return pdf(<AuditDocument result={result} />).toBlob();
}
