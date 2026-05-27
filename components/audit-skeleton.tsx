"use client";

import { useEffect, useState } from "react";

// Timed phase labels shown while the audit runs. NOTE: these are simulated,
// not live progress — the audit is a single API call, so we can't read true
// intermediate state. The phases map loosely to what's actually happening and
// keep the wait from feeling frozen.
const PHASES = [
  "Reading your screens",
  "Detecting context and flow",
  "Applying the heuristic library",
  "Writing findings",
  "Almost there"
];

export function AuditSkeleton() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhase((p) => Math.min(p + 1, PHASES.length - 1));
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-2.5 text-sm font-medium">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span>{PHASES[phase]}…</span>
      </div>

      <div className="space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="skeleton h-3 w-2/3" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-4">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Analyzing your screens against the heuristic library. This usually takes 15 to 45 seconds,
        longer for dense screens.
      </p>
    </div>
  );
}
