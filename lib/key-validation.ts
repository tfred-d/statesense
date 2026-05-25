// Client → server key validation. The server calls Anthropic Haiku 4.5 with the
// supplied key, returns a 200 if it's valid or a structured error code otherwise.

import type { AppError } from "./types.ts";

export interface ValidationResult {
  ok: boolean;
  error?: AppError;
}

export async function validateKey(apiKey: string): Promise<ValidationResult> {
  try {
    const res = await fetch("/api/validate-key", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Anthropic-Key": apiKey }
    });

    if (res.ok) return { ok: true };

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      detail?: string;
    };

    const kindMap: Record<string, AppError["kind"]> = {
      "invalid-key": "invalid-key",
      "no-credit": "no-credit",
      "rate-limited": "rate-limited",
      "anthropic-error": "anthropic-error"
    };

    return {
      ok: false,
      error: {
        kind: kindMap[data.error ?? "anthropic-error"] ?? "anthropic-error",
        message: messageFor(data.error ?? "anthropic-error"),
        detail: data.detail
      }
    };
  } catch (err) {
    return {
      ok: false,
      error: {
        kind: "no-internet",
        message: "Couldn't reach our server.",
        detail: err instanceof Error ? err.message : "Check your connection."
      }
    };
  }
}

function messageFor(kind: string): string {
  switch (kind) {
    case "invalid-key":
      return "That API key isn't valid.";
    case "no-credit":
      return "This API key has no remaining credit.";
    case "rate-limited":
      return "Too many requests right now. Wait a moment and try again.";
    default:
      return "We couldn't verify the key with Anthropic.";
  }
}
