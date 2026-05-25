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
            "flex flex-col items-center gap-1 rounded-md border p-3 text-sm transition-colors",
            value === "web"
              ? "border-primary bg-secondary/40"
              : "border-input hover:bg-secondary/20"
          )}
        >
          <Monitor className="h-5 w-5" />
          <span>Responsive Web</span>
        </button>
        <button
          type="button"
          disabled
          className="flex flex-col items-center gap-1 rounded-md border border-dashed border-input p-3 text-sm text-muted-foreground opacity-60"
        >
          <Smartphone className="h-5 w-5" />
          <span>iOS</span>
          <span className="text-[10px] uppercase tracking-wide">Coming soon</span>
        </button>
        <button
          type="button"
          disabled
          className="flex flex-col items-center gap-1 rounded-md border border-dashed border-input p-3 text-sm text-muted-foreground opacity-60"
        >
          <Smartphone className="h-5 w-5" />
          <span>Android</span>
          <span className="text-[10px] uppercase tracking-wide">Coming soon</span>
        </button>
      </div>
    </div>
  );
}
