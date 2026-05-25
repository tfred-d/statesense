"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, capitalize } from "@/lib/utils";
import { setThumb, getThumbs } from "@/lib/storage";
import type { Finding } from "@/lib/types";

interface Props {
  finding: Finding;
  initialThumb?: "up" | "down" | null;
}

export function FindingCard({ finding, initialThumb }: Props) {
  const [thumb, setThumbState] = useState<"up" | "down" | null>(initialThumb ?? null);

  function handleThumb(value: "up" | "down") {
    const next = thumb === value ? null : value;
    setThumbState(next);
    setThumb(finding.id, next);
  }

  const screenLabel =
    finding.screen_refs.length > 0
      ? finding.screen_refs.length === 1
        ? `Screen ${finding.screen_refs[0]}`
        : `Screens ${finding.screen_refs.join(", ")}`
      : "PRD-level";

  return (
    <article className="py-5 first:pt-0 last:pb-0">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="font-semibold leading-tight">{finding.title}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={finding.finding_type}>{capitalize(finding.finding_type)}</Badge>
            <Badge
              variant={
                finding.severity === "critical"
                  ? "critical"
                  : finding.severity === "important"
                    ? "important"
                    : "nice"
              }
            >
              {finding.severity === "nice-to-have" ? "Nice to have" : capitalize(finding.severity)}
            </Badge>
            <span className="text-xs text-muted-foreground">{screenLabel}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs italic text-muted-foreground">{finding.element_anchor}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label="Useful"
            aria-pressed={thumb === "up"}
            onClick={() => handleThumb("up")}
            className={cn(
              "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              thumb === "up" && "bg-green-100 text-green-700 hover:bg-green-100"
            )}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Not useful"
            aria-pressed={thumb === "down"}
            onClick={() => handleThumb("down")}
            className={cn(
              "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              thumb === "down" && "bg-red-100 text-red-700 hover:bg-red-100"
            )}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <p className="mt-3 text-sm leading-relaxed">{finding.description}</p>

      <p className="mt-2 text-sm leading-relaxed">
        <span className="font-medium">Suggested:</span>{" "}
        <span className="text-muted-foreground">{finding.suggestion}</span>
      </p>
    </article>
  );
}

export function loadInitialThumb(findingId: string): "up" | "down" | null {
  if (typeof window === "undefined") return null;
  return getThumbs()[findingId] ?? null;
}
