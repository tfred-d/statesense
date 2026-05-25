import type { Metadata } from "next";
import { AuditPageShell } from "@/components/audit-page-shell";

export const metadata: Metadata = {
  title: "Run an audit · StateSense",
  description:
    "Upload your screens, add context, and audit your design against StateSense's curated heuristics."
};

export default function AuditPage() {
  return (
    <div className="container max-w-3xl py-10">
      <AuditPageShell />
    </div>
  );
}
