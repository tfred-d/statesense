"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, capitalize } from "@/lib/utils";
import { setThumb, getThumbs } from "@/lib/storage";
import type { Finding } from "@/lib/types";

interface Props {
  finding: Finding;
  onDismiss: () => void;
  initialThumb?: "up" | "down" | null;
}

export function FindingCard({ finding, onDismiss, initialThumb }: Props) {
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
    <article
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        finding.finding_type === "gap" && "border-l-4 border-l-gap",
        finding.finding_type === "recommendation" && "border-l-4 border-l-recommendation",
        finding.finding_type === "question" && "border-l-4 border-l-question"
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-tight">{finding.title}</h3>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss finding"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
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
        <span className="text-xs text-muted-foreground italic">{finding.element_anchor}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed">{finding.description}</p>

      <p className="mt-2 text-sm leading-relaxed">
        <span className="font-medium">Suggested:</span> {finding.suggestion}
      </p>

      <footer className="mt-3 flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Useful"
          aria-pressed={thumb === "up"}
          className={cn(thumb === "up" && "text-green-600")}
          onClick={() => handleThumb("up")}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Not useful"
          aria-pressed={thumb === "down"}
          className={cn(thumb === "down" && "text-red-600")}
          onClick={() => handleThumb("down")}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
      </footer>
    </article>
  );
}

export function loadInitialThumb(findingId: string): "up" | "down" | null {
  if (typeof window === "undefined") return null;
  return getThumbs()[findingId] ?? null;
}
