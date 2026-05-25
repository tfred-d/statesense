"use client";

// Holds the apiKey state so the header button and the form share a single source.

import { useState } from "react";
import { AuditForm } from "./audit-form";
import { ApiKeyGate } from "./api-key-gate";

export function AuditPageShell() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New audit</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload 1–6 screens, tell us what we&apos;re looking at, and run the audit.
            Screens stay in your browser until they&apos;re sent to Anthropic for analysis.
          </p>
        </div>
        <div className="shrink-0">
          <ApiKeyGate onReady={setApiKey} />
        </div>
      </header>

      <AuditForm apiKey={apiKey} />
    </>
  );
}
