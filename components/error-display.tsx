"use client";

import { AlertTriangle, WifiOff, KeyRound, CreditCard, Timer, FileX, Inbox, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppError, ErrorKind } from "@/lib/types";

const iconFor: Record<ErrorKind, React.ComponentType<{ className?: string }>> = {
  "no-internet": WifiOff,
  "no-key": KeyRound,
  "invalid-key": KeyRound,
  "no-credit": CreditCard,
  "rate-limited": Timer,
  "anthropic-error": AlertCircle,
  "file-too-large": FileX,
  "wrong-format": FileX,
  "corrupt-pdf": FileX,
  "pdf-no-text": FileX,
  "empty-results": Inbox,
  "no-storage": AlertTriangle,
  unknown: AlertCircle
};

interface Props {
  error: AppError;
  compact?: boolean;
  className?: string;
}

export function ErrorDisplay({ error, compact, className }: Props) {
  const Icon = iconFor[error.kind] ?? AlertCircle;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/5 text-sm",
        compact ? "px-3 py-2" : "p-4",
        className
      )}
    >
      <Icon className={cn("text-destructive flex-shrink-0", compact ? "h-4 w-4 mt-0.5" : "h-5 w-5 mt-0.5")} />
      <div className="space-y-1">
        <p className="font-medium text-destructive">{error.message}</p>
        {error.detail && <p className="text-muted-foreground">{error.detail}</p>}
      </div>
    </div>
  );
}
