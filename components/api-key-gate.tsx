"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, LogOut, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  getApiKey,
  setApiKey,
  clearApiKey,
  isStorageAvailable,
  looksLikeAnthropicKey
} from "@/lib/storage";
import { validateKey } from "@/lib/key-validation";
import { ErrorDisplay } from "@/components/error-display";
import type { AppError } from "@/lib/types";

interface Props {
  /** Called with the key once it's verified and stored. */
  onReady: (key: string) => void;
}

export function ApiKeyGate({ onReady }: Props) {
  const [storageOk, setStorageOk] = useState(true);
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [reveal, setReveal] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    const ok = isStorageAvailable();
    setStorageOk(ok);
    if (ok) {
      const k = getApiKey();
      setStoredKey(k);
      if (k) onReady(k);
    }
  }, [onReady]);

  if (!storageOk) {
    return (
      <ErrorDisplay
        error={{
          kind: "no-storage",
          message: "Browser storage is unavailable.",
          detail:
            "StateSense stores your API key in localStorage so we never see it. Private browsing or strict storage settings block this. Open StateSense in a regular browser window to continue."
        }}
      />
    );
  }

  async function handleSubmit() {
    const trimmed = input.trim();
    if (!looksLikeAnthropicKey(trimmed)) {
      setError({
        kind: "invalid-key",
        message: "That doesn't look like an Anthropic API key.",
        detail: "Anthropic keys start with sk-ant-. Paste the full key from console.anthropic.com."
      });
      return;
    }

    setError(null);
    setValidating(true);
    const result = await validateKey(trimmed);
    setValidating(false);

    if (!result.ok) {
      setError(result.error ?? null);
      return;
    }

    const stored = setApiKey(trimmed);
    if (!stored) {
      setError({
        kind: "no-storage",
        message: "Couldn't save your key.",
        detail: "Local storage might be full or disabled. Free some space and try again."
      });
      return;
    }
    setStoredKey(trimmed);
    onReady(trimmed);
  }

  function handleForget() {
    clearApiKey();
    setStoredKey(null);
    setInput("");
  }

  if (storedKey) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border bg-secondary/30 px-3 py-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <span>API key loaded from your browser</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleForget}>
          <LogOut className="h-3.5 w-3.5" /> Forget my key
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound className="h-5 w-5" /> Add your Anthropic API key
        </CardTitle>
        <CardDescription>
          StateSense uses Anthropic Claude to analyze your designs. You supply your own key —
          it&apos;s stored only in your browser and never logged on our side.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">API key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={reveal ? "text" : "password"}
                placeholder="sk-ant-..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setReveal((r) => !r)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={reveal ? "Hide key" : "Show key"}
              >
                {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={handleSubmit} disabled={validating || input.trim().length === 0}>
              {validating ? "Verifying…" : "Verify & save"}
            </Button>
          </div>
        </div>

        {error && <ErrorDisplay error={error} compact />}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" size="sm" className="px-0">
              Why a key? Where do I get one?
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>BYOK — bring your own key</DialogTitle>
              <DialogDescription>
                Why we ask for it, what we do with it, and where to find one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p>
                <strong>What it&apos;s for:</strong> StateSense calls Anthropic Claude to read your
                screens and check them against our heuristic library. The call runs against{" "}
                <em>your</em> account so we pay no inference cost — that&apos;s how StateSense
                stays free.
              </p>
              <p>
                <strong>What we do with it:</strong> Your key passes through our server only to
                attach the analysis prompt. We don&apos;t log it, don&apos;t store it on our side,
                and don&apos;t use it for anything other than the one audit you trigger. It lives
                in <code className="rounded bg-muted px-1">localStorage</code> on your machine.
              </p>
              <p>
                <strong>Where to get one:</strong>{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline hover:text-primary"
                >
                  console.anthropic.com/settings/keys <ExternalLink className="h-3 w-3" />
                </a>
                . Sign up, add a few dollars of credit (audits cost ~$0.05–$0.20 each), copy the
                key, and paste it here.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
