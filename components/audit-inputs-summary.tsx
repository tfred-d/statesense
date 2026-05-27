"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ScreenInput } from "@/lib/types";

interface Props {
  screens: ScreenInput[];
  context: string;
}

/** Compact reminder of what was audited, shown above the results. Hidden in
 *  print so the saved PDF stays focused on the findings. */
export function AuditInputsSummary({ screens, context }: Props) {
  const [showContext, setShowContext] = useState(false);
  const trimmed = context.trim();

  return (
    <section className="rounded-lg border bg-secondary/20 p-4 print:hidden">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Audited
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        {screens.map((s, i) => (
          <figure key={i} className="space-y-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:${s.media_type};base64,${s.data}`}
              alt={`Screen ${i}`}
              className="h-16 w-auto rounded border bg-card object-cover"
            />
            <figcaption className="text-center text-[10px] text-muted-foreground">
              Screen {i}
            </figcaption>
          </figure>
        ))}
      </div>

      {trimmed && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowContext((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            aria-expanded={showContext}
          >
            {showContext ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            Context you provided
          </button>
          {showContext && (
            <p className="mt-2 whitespace-pre-wrap rounded-md bg-card p-3 text-xs leading-relaxed text-muted-foreground">
              {trimmed}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
