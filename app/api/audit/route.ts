import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { AUDIT_TOOL } from "@/lib/audit-schema";
import { classifyAnthropicError } from "@/lib/anthropic-errors";
import type { AuditRequest, AuditResult } from "@/lib/types";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 8192;

// Node runtime is required: we use process.cwd() to read the heuristic files.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const apiKey = request.headers.get("X-Anthropic-Key");
  if (!apiKey) {
    return NextResponse.json({ error: "no-key", message: "Missing API key" }, { status: 400 });
  }

  let body: AuditRequest;
  try {
    body = (await request.json()) as AuditRequest;
  } catch {
    return NextResponse.json({ error: "bad-request", message: "Invalid JSON" }, { status: 400 });
  }

  if (!body.screens || body.screens.length === 0) {
    return NextResponse.json(
      { error: "bad-request", message: "No screens provided" },
      { status: 400 }
    );
  }
  if (body.screens.length > 6) {
    return NextResponse.json(
      { error: "bad-request", message: "Maximum 6 screens" },
      { status: 400 }
    );
  }

  const systemPrompt = buildSystemPrompt(body.focus_categories);
  const client = new Anthropic({ apiKey });

  // Build the user message: numbered screens, then context, then instruction.
  const userContent: Anthropic.Messages.ContentBlockParam[] = [];
  body.screens.forEach((s, i) => {
    userContent.push({ type: "text", text: `Screen ${i}: ${s.name}` });
    userContent.push({
      type: "image",
      source: { type: "base64", media_type: s.media_type, data: s.data }
    });
  });

  if (body.context && body.context.trim().length > 0) {
    userContent.push({
      type: "text",
      text: `## Feature context (uploaded PRD / description)\n\n${body.context.trim()}`
    });
  }

  userContent.push({
    type: "text",
    text: `## Audit this flow.

Step 1 — Detect context tags from the uploaded design. Pick from screen properties, flow context, ${
      body.context ? "and PRD context" : "skip intent-scope since no PRD is provided"
    }. Full vocabulary in the heuristic library's applies_when_vocabulary.

Step 2 — Pre-filter heuristics by intersecting each heuristic's applies_when against the detected tags. A heuristic with empty applies_when always applies in its scope.

Step 3 — For each applicable heuristic, produce a finding ONLY if you can anchor it to a specific screen + element. Otherwise, list it in skipped_heuristics with a one-line reason.

Step 4 — Submit the result via the submit_audit tool. Honor the word caps. Don't group — the consumer groups by scope and severity.`
  });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }
      ],
      tools: [AUDIT_TOOL],
      tool_choice: { type: "tool", name: "submit_audit" },
      messages: [{ role: "user", content: userContent }]
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json(
        {
          error: "anthropic-error",
          message: "Model didn't return a structured result. Try again."
        },
        { status: 502 }
      );
    }

    const result = toolUse.input as AuditResult;

    return NextResponse.json({
      result,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? 0,
        cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0
      }
    });
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
