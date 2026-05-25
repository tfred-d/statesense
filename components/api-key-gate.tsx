"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck, LogOut, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  /** Called whenever the stored key changes — on mount, after verify, after forget. */
  onReady: (key: string | null) => void;
}

/**
 * Button + modal for managing the user's Anthropic key.
 * - Always visible as a small button in the page header.
 * - Click opens a dialog with either the entry form (no key yet) or a
 *   summary + forget button (key set).
 * - Calls `onReady` with the current key (or null) so the parent form knows
 *   whether the Run button should be enabled.
 */
export function ApiKeyGate({ onReady }: Props) {
  const [storageOk, setStorageOk] = useState(true);
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [reveal, setReveal] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [justVerified, setJustVerified] = useState(false);

  useEffect(() => {
    const ok = isStorageAvailable();
    setStorageOk(ok);
    if (ok) {
      const k = getApiKey();
      setStoredKey(k);
      onReady(k);
    } else {
      onReady(null);
    }
  }, [onReady]);

  if (!storageOk) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        Browser storage is unavailable — open StateSense in a regular window.
      </div>
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
        detail: "Local storage might be full or disabled."
      });
      return;
    }

    setStoredKey(trimmed);
    onReady(trimmed);
    setJustVerified(true);
    // Auto-close after the user sees the success state.
    setTimeout(() => {
      setOpen(false);
      setJustVerified(false);
    }, 1100);
  }

  function handleForget() {
    clearApiKey();
    setStoredKey(null);
    setInput("");
    setError(null);
    onReady(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setError(null);
          setInput("");
          setReveal(false);
          setJustVerified(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant={storedKey ? "outline" : "default"} size="sm">
          {storedKey ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
              <span>Key set</span>
            </>
          ) : (
            <>
              <KeyRound className="h-3.5 w-3.5" />
              <span>Add API key</span>
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Anthropic API key
          </DialogTitle>
          <DialogDescription>
            Stored only in your browser. Never logged on our side.
          </DialogDescription>
        </DialogHeader>

        {storedKey ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md border bg-secondary/30 p-3 text-sm">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-green-600" />
              <div className="space-y-0.5">
                <p className="font-medium">Your key is loaded.</p>
                <p className="text-xs text-muted-foreground">
                  {storedKey.slice(0, 10)}…{storedKey.slice(-4)} — saved in this browser only.
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={handleForget}>
                <LogOut className="h-3.5 w-3.5" /> Forget my key
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Paste your key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={reveal ? "text" : "password"}
                  placeholder="sk-ant-..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
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
              <p className="text-xs text-muted-foreground">
                Don&apos;t have one?{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
                >
                  Get one from Anthropic <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            {error && <ErrorDisplay error={error} compact />}

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={validating || input.trim().length === 0 || justVerified}
              >
                {justVerified ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Verified
                  </>
                ) : validating ? (
                  "Verifying…"
                ) : (
                  "Verify & save"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
