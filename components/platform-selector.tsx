"use client";

import { Monitor, Smartphone } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  value: "web";
  onChange: (v: "web") => void;
}

export function PlatformSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label>Platform</Label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onChange("web")}
          className={cn(
            "relative flex flex-col items-center justify-center gap-1.5 rounded-md border p-4 text-sm transition-colors",
            value === "web"
              ? "border-primary bg-secondary/40"
              : "border-input hover:bg-secondary/20"
          )}
        >
          <Monitor className="h-5 w-5" strokeWidth={1.75} />
          <span>Responsive Web</span>
        </button>

        <button
          type="button"
          disabled
          className="relative flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground opacity-60"
        >
          <span className="absolute right-1.5 top-1.5 rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
            Soon
          </span>
          <Smartphone className="h-5 w-5" strokeWidth={1.75} />
          <span>iOS</span>
        </button>

        <button
          type="button"
          disabled
          className="relative flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground opacity-60"
        >
          <span className="absolute right-1.5 top-1.5 rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
            Soon
          </span>
          <Smartphone className="h-5 w-5" strokeWidth={1.75} />
          <span>Android</span>
        </button>
      </div>
    </div>
  );
}
