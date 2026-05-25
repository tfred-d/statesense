"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApiKeyGate } from "./api-key-gate";
import { PlatformSelector } from "./platform-selector";
import { ScreenUploader } from "./screen-uploader";
import { ContextInput } from "./context-input";
import { FocusSelector } from "./focus-selector";
import { AuditSkeleton } from "./audit-skeleton";
import { ResultsView } from "./results-view";
import { ErrorDisplay } from "./error-display";
import type { AppError, AuditRequest, AuditResult, Platform, ScreenInput } from "@/lib/types";

type RunState =
  | { phase: "form" }
  | { phase: "running" }
  | { phase: "result"; result: AuditResult }
  | { phase: "error"; error: AppError };

export function AuditForm() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>("web");
  const [screens, setScreens] = useState<ScreenInput[]>([]);
  const [context, setContext] = useState("");
  const [focusCategories, setFocusCategories] = useState<string[]>([]);
  const [state, setState] = useState<RunState>({ phase: "form" });

  async function runAudit() {
    if (!apiKey) return;
    if (screens.length === 0) {
      setState({
        phase: "error",
        error: {
          kind: "wrong-format",
          message: "Add at least one screen.",
          detail: "Drag or browse PNG / JPG / WEBP files into the upload area."
        }
      });
      return;
    }

    setState({ phase: "running" });

    const payload: AuditRequest = {
      screens,
      context: context.trim() || null,
      platform,
      focus_categories: focusCategories.length > 0 ? focusCategories : undefined
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

      if (!data.result || data.result.findings.length === 0) {
        // Empty result is valid (design is clean) but we surface it so the user knows.
        // ResultsView renders the empty-state UI itself.
      }

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

  return (
    <div className="space-y-6">
      <ApiKeyGate onReady={setApiKey} />

      {!apiKey ? null : state.phase === "running" ? (
        <AuditSkeleton />
      ) : state.phase === "result" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Audit results</h2>
            <Button variant="outline" size="sm" onClick={resetForm}>
              New audit
            </Button>
          </div>
          <ResultsView result={state.result} />
        </div>
      ) : (
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
          <FocusSelector value={focusCategories} onChange={setFocusCategories} />

          <div className="flex justify-end">
            <Button onClick={runAudit} disabled={screens.length === 0}>
              <Play className="h-4 w-4" /> Run audit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
