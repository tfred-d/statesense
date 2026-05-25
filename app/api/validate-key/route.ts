import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { classifyAnthropicError } from "@/lib/anthropic-errors";

// Tiny Haiku ping to verify a BYOK key works.
// Per the locked decision: Haiku 4.5 here, NOT Sonnet — costs a fraction of a cent.

const VALIDATION_MODEL = "claude-haiku-4-5";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const apiKey = request.headers.get("X-Anthropic-Key");
  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    return NextResponse.json(
      { error: "invalid-key", message: "Missing or malformed API key" },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    await client.messages.create({
      model: VALIDATION_MODEL,
      max_tokens: 10,
      messages: [{ role: "user", content: "hi" }]
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const classified = classifyAnthropicError(err);
    const httpStatus =
      classified.kind === "invalid-key" || classified.kind === "no-credit"
        ? 401
        : classified.kind === "rate-limited"
          ? 429
          : 502;
    return NextResponse.json(
      { error: classified.kind, message: classified.message, detail: classified.detail },
      { status: httpStatus }
    );
  }
}
