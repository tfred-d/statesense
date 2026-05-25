"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkippedHeuristic } from "@/lib/types";

interface Props {
  items: SkippedHeuristic[];
}

export function SkippedList({ items }: Props) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <section className="rounded-md border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-4 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-medium">Heuristics skipped</p>
          <p className="text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "heuristic didn't" : "heuristics didn't"} apply
            here. Honesty over false confidence.
          </p>
        </div>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      <div className={cn("border-t border-border", !open && "hidden")}>
        <ul className="divide-y divide-border">
          {items.map((s) => (
            <li key={s.heuristic_id} className="grid grid-cols-[200px_1fr] gap-3 p-3 text-xs">
              <code className="text-muted-foreground">{s.heuristic_id}</code>
              <span>{s.reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
