// Maps raw Anthropic SDK errors → app-level error kinds so the UI can render
// the right state per PRD §F6.

import type { AppError, ErrorKind } from "./types.ts";

interface AnthropicErrorShape {
  status?: number;
  error?: { type?: string; message?: string };
  message?: string;
}

export function classifyAnthropicError(err: unknown): AppError {
  const e = err as AnthropicErrorShape;
  const status = e?.status;
  const type = e?.error?.type;
  const message = e?.error?.message ?? e?.message ?? "Unknown error";

  let kind: ErrorKind = "anthropic-error";
  let display = "Anthropic returned an error.";

  if (status === 401 || type === "authentication_error") {
    kind = "invalid-key";
    display = "Your API key isn't valid.";
  } else if (status === 403 && /credit|balance/i.test(message)) {
    kind = "no-credit";
    display = "This API key has no remaining credit.";
  } else if (status === 429 || type === "rate_limit_error") {
    kind = "rate-limited";
    display = "Too many requests. Wait a moment and try again.";
  } else if (status && status >= 500) {
    kind = "anthropic-error";
    display = "Anthropic is having trouble right now. Try again in a minute.";
  }

  return { kind, message: display, detail: message };
}
