"use client";

import { useState } from "react";
import { Check, Copy, Download, FileJson, FileText, FileType2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportMarkdown } from "@/lib/export-markdown";
import { exportPdf } from "@/lib/export-pdf";
import type { AuditResult } from "@/lib/types";

interface Props {
  result: AuditResult;
}

export function ExportMenu({ result }: Props) {
  const [copied, setCopied] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  async function copyMd() {
    const md = exportMarkdown(result);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json"
    });
    download(blob, `statesense-${result.audit_id.slice(0, 8)}.json`);
  }

  async function downloadPdf() {
    setPdfBusy(true);
    try {
      const blob = await exportPdf(result);
      download(blob, `statesense-${result.audit_id.slice(0, 8)}.pdf`);
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={copyMd}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy as Markdown"}
      </Button>
      <Button variant="outline" size="sm" onClick={downloadPdf} disabled={pdfBusy}>
        <FileType2 className="h-3.5 w-3.5" />
        {pdfBusy ? "Generating…" : "Download PDF"}
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
