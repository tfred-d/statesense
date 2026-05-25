"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Mirrors the categories array in heuristics.json. Hard-cut candidate #1: default
// is "All" — power users can scope.
const ALL_CATEGORIES = [
  { slug: "loading-latency", label: "Loading & latency" },
  { slug: "empty-states", label: "Empty states" },
  { slug: "error-states", label: "Error states" },
  { slug: "auth-permissions", label: "Auth & permissions" },
  { slug: "validation", label: "Validation" },
  { slug: "connectivity", label: "Connectivity" },
  { slug: "data-variability", label: "Data variability" },
  { slug: "concurrency", label: "Concurrency" },
  { slug: "recovery", label: "Recovery" },
  { slug: "accessibility-states", label: "Accessibility states" },
  { slug: "edge-counts", label: "Edge counts" },
  { slug: "action-states", label: "Action states" },
  { slug: "information-hierarchy", label: "Information hierarchy" },
  { slug: "affordance-clarity", label: "Affordance clarity" },
  { slug: "visual-consistency", label: "Visual consistency" },
  { slug: "content-completeness", label: "Content completeness" },
  { slug: "cognitive-load", label: "Cognitive load" },
  { slug: "mode-and-context", label: "Mode & context" },
  { slug: "layout-integrity", label: "Layout integrity" },
  { slug: "flow-coherence", label: "Flow coherence" },
  { slug: "prd-alignment", label: "PRD alignment" }
];

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
}

export function FocusSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const isAll = value.length === 0;

  function toggle(slug: string) {
    if (value.includes(slug)) {
      onChange(value.filter((s) => s !== slug));
    } else {
      onChange([...value, slug]);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <Label>Focus (optional)</Label>
        <span className="text-xs text-muted-foreground">
          {isAll ? "All categories" : `${value.length} categor${value.length === 1 ? "y" : "ies"}`}
        </span>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Filter className="h-3.5 w-3.5" />
            {isAll ? "All categories (default)" : `Scoping to ${value.length}`}
            {!isAll && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear focus"
                className="ml-auto inline-flex items-center text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Scope this audit</DialogTitle>
            <DialogDescription>
              Pick the categories you want findings from. Leave empty for all.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
            {ALL_CATEGORIES.map((c) => {
              const active = value.includes(c.slug);
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => toggle(c.slug)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "border-primary bg-secondary/40"
                      : "border-input hover:bg-secondary/20"
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
