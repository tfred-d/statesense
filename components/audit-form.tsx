"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlatformSelector } from "./platform-selector";
import { ScreenUploader } from "./screen-uploader";
import { ContextInput, CONTEXT_MIN_CHARS } from "./context-input";
import { AuditSkeleton } from "./audit-skeleton";
import { ResultsView } from "./results-view";
import { ErrorDisplay } from "./error-display";
import type { AppError, AuditRequest, AuditResult, Platform, ScreenInput } from "@/lib/types";

type RunState =
  | { phase: "form" }
  | { phase: "running" }
  | { phase: "result"; result: AuditResult }
  | { phase: "error"; error: AppError };

interface Props {
  /** API key controlled by the parent (AuditPageShell). Null until user adds one. */
  apiKey: string | null;
}

export function AuditForm({ apiKey }: Props) {
  const [platform, setPlatform] = useState<Platform>("web");
  const [screens, setScreens] = useState<ScreenInput[]>([]);
  const [context, setContext] = useState("");
  const [state, setState] = useState<RunState>({ phase: "form" });

  const contextOk = context.trim().length >= CONTEXT_MIN_CHARS;
  const canRun = !!apiKey && screens.length > 0 && contextOk;

  async function runAudit() {
    if (!canRun || !apiKey) return;

    setState({ phase: "running" });

    const payload: AuditRequest = {
      screens,
      context: context.trim() || null,
      platform
    };

    try {
      if (!navigator.onLine) {
        setState({
          phase: "error",
          error: {
            kind: "no-internet",
            message: "You're offline.",
            detail: "Reconnect and try again."
          }
        });
        return;
      }

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Anthropic-Key": apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
          detail?: string;
        };
        setState({
          phase: "error",
          error: {
            kind: (data.error as AppError["kind"]) ?? "anthropic-error",
            message: data.message ?? "The audit failed.",
            detail: data.detail
          }
        });
        return;
      }

      const data = (await res.json()) as { result: AuditResult };
      setState({ phase: "result", result: data.result });
    } catch (err) {
      setState({
        phase: "error",
        error: {
          kind: "no-internet",
          message: "Couldn't reach the server.",
          detail: err instanceof Error ? err.message : "Check your connection."
        }
      });
    }
  }

  function resetForm() {
    setState({ phase: "form" });
  }

  if (state.phase === "running") {
    return <AuditSkeleton />;
  }

  if (state.phase === "result") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Audit results</h2>
          <Button variant="outline" size="sm" onClick={resetForm}>
            New audit
          </Button>
        </div>
        <ResultsView result={state.result} />
      </div>
    );
  }

  const disabledReason = !apiKey
    ? "Add your Anthropic key above to run an audit."
    : screens.length === 0
      ? "Upload at least one screen."
      : !contextOk
        ? "Add a sentence of context — what are we looking at?"
        : null;

  return (
    <div className="space-y-6">
      {state.phase === "error" && (
        <>
          <ErrorDisplay error={state.error} />
          <Separator />
        </>
      )}

      <PlatformSelector value={platform} onChange={setPlatform} />
      <ScreenUploader value={screens} onChange={setScreens} />
      <ContextInput value={context} onChange={setContext} />

      <div className="flex flex-col items-end gap-2">
        <Button onClick={runAudit} disabled={!canRun}>
          <Play className="h-4 w-4" /> Run audit
        </Button>
        {disabledReason && (
          <p className="text-xs text-muted-foreground">{disabledReason}</p>
        )}
      </div>
    </div>
  );
}
