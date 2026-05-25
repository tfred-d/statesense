import type { Metadata } from "next";
import { AuditForm } from "@/components/audit-form";

export const metadata: Metadata = {
  title: "Run an audit · StateSense",
  description:
    "Upload your screens, add context, and audit your design against 65 UX heuristics."
};

export default function AuditPage() {
  return (
    <div className="container max-w-3xl py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New audit</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload 1–6 screens, optionally add a PRD or feature description, and run the audit.
          Screens stay in your browser until they&apos;re sent to Anthropic for analysis.
        </p>
      </header>
      <AuditForm />
    </div>
  );
}
