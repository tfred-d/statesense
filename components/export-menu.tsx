"use client";

import { useState } from "react";
import { Check, Copy, FileJson, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportMarkdown } from "@/lib/export-markdown";
import type { AuditResult, Finding } from "@/lib/types";

interface Props {
  result: AuditResult;
}

/** JSON shape that goes out to users. Mirrors the markdown content.
 *  Strips internal IDs, heuristic_id, and context tags. */
function publicJson(result: AuditResult): object {
  const findings = result.findings.map((f: Finding) => ({
    scope: f.scope,
    finding_type: f.finding_type,
    severity: f.severity,
    screen_refs: f.screen_refs,
    element_anchor: f.element_anchor,
    title: f.title,
    description: f.description,
    suggestion: f.suggestion
  }));

  const counts = {
    gaps: findings.filter((f) => f.finding_type === "gap").length,
    recommendations: findings.filter((f) => f.finding_type === "recommendation").length,
    questions: findings.filter((f) => f.finding_type === "question").length
  };

  return { summary: result.summary, counts, findings };
}

export function ExportMenu({ result }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyMd() {
    const md = exportMarkdown(result);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(publicJson(result), null, 2)], {
      type: "application/json"
    });
    download(blob, "statesense-audit.json");
  }

  // Browser print-to-PDF. Print styles hide the chrome (header, footer,
  // buttons, thumbnails) so the saved PDF is just the findings.
  function savePdf() {
    window.print();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={copyMd}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy as Markdown"}
      </Button>
      <Button variant="outline" size="sm" onClick={savePdf}>
        <Printer className="h-3.5 w-3.5" /> Save as PDF
      </Button>
      <Button variant="outline" size="sm" onClick={downloadJson}>
        <FileJson className="h-3.5 w-3.5" /> Download JSON
      </Button>
    </div>
  );
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
