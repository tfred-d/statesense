#!/usr/bin/env tsx
/**
 * StateSense quality-gate CLI.
 *
 * Usage:
 *   npm run audit -- samples/linear
 *   npm run audit -- samples/resend
 *
 * Loads the screens from <flow-dir>, optionally reads context.md, runs the audit
 * against Anthropic Sonnet 4.6 with tool-use + prompt caching, and writes the
 * result to <flow-dir>/actual_findings.json.
 *
 * Shares prompt + schema with the Next.js API route via lib/.
 */

import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { buildSystemPrompt } from "../lib/system-prompt.ts";
import { AUDIT_TOOL } from "../lib/audit-schema.ts";
import type { AuditResult, ScreenInput } from "../lib/types.ts";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 8192;

function usage(): never {
  console.error("Usage: npm run audit -- <flow-dir>");
  console.error("Example: npm run audit -- samples/linear");
  process.exit(1);
}

function loadScreens(dir: string): (ScreenInput & { filename: string })[] {
  const screensSub = join(dir, "screens");
  const sourceDir = existsSync(screensSub) ? screensSub : dir;

  const files = readdirSync(sourceDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort();

  if (files.length === 0) {
    throw new Error(`No images found in ${sourceDir}. Expected PNG/JPG/WEBP files.`);
  }
  if (files.length > 6) {
    console.warn(`⚠ Found ${files.length} images. PRD caps at 6; using all anyway.`);
  }

  return files.map((f, i) => {
    const ext = extname(f).toLowerCase().replace(".", "");
    const mediaType = (ext === "jpg" ? "jpeg" : ext) as "png" | "jpeg" | "webp" | "gif";
    return {
      index: i,
      name: f,
      filename: f,
      media_type: `image/${mediaType}` as ScreenInput["media_type"],
      data: readFileSync(join(sourceDir, f)).toString("base64")
    };
  });
}

function loadContext(dir: string): string | null {
  const path = join(dir, "context.md");
  if (!existsSync(path)) return null;
  const text = readFileSync(path, "utf-8").trim();
  return text.length > 0 ? text : null;
}

async function main(): Promise<void> {
  const flowDir = process.argv[2];
  if (!flowDir) usage();
  if (!existsSync(flowDir)) {
    console.error(`Directory not found: ${flowDir}`);
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  console.log(`→ Auditing ${flowDir}`);

  const screens = loadScreens(flowDir);
  const context = loadContext(flowDir);

  console.log(`  Screens: ${screens.map((s) => s.filename).join(", ")}`);
  console.log(
    `  Context: ${context ? `${context.split("\n").length} lines` : "(none — intent-scope skipped)"}`
  );

  const systemPrompt = buildSystemPrompt();
  const client = new Anthropic();

  const userContent: Anthropic.Messages.ContentBlockParam[] = [];
  screens.forEach((s, i) => {
    userContent.push({ type: "text", text: `Screen ${i}: ${s.filename}` });
    userContent.push({
      type: "image",
      source: { type: "base64", media_type: s.media_type, data: s.data }
    });
  });

  if (context) {
    userContent.push({
      type: "text",
      text: `## Feature context (uploaded PRD / description)\n\n${context}`
    });
  }

  userContent.push({
    type: "text",
    text: `## Audit this flow.

Step 1 — Detect context tags from the uploaded design. Pick from screen properties, flow context, and${
      context ? " PRD context" : " — no PRD provided, so skip intent-scope entirely"
    }. The full vocabulary lives in the heuristic library's applies_when_vocabulary.

Step 2 — Pre-filter heuristics by intersecting each heuristic's applies_when against the detected tags. A heuristic with empty applies_when always applies in its scope.

Step 3 — For each applicable heuristic, produce a finding ONLY if you can anchor it to a specific screen + element. Otherwise, list it in skipped_heuristics with a one-line reason.

Step 4 — Submit the result via the submit_audit tool. Honor the word caps.`
  });

  console.log("→ Calling Anthropic (Sonnet 4.6) with tool-use + prompt cache…");
  const start = Date.now();

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

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    console.error("✗ Model didn't call submit_audit. Raw response:");
    console.error(JSON.stringify(response.content, null, 2));
    process.exit(1);
  }

  const result = toolUse.input as AuditResult;

  const outPath = join(flowDir, "actual_findings.json");
  writeFileSync(outPath, JSON.stringify(result, null, 2));

  const u = response.usage;
  const gaps = result.findings.filter((f) => f.finding_type === "gap").length;
  const recs = result.findings.filter((f) => f.finding_type === "recommendation").length;
  const qs = result.findings.filter((f) => f.finding_type === "question").length;

  console.log("");
  console.log(`✓ Audit complete in ${elapsed}s`);
  console.log(`  Tokens: input ${u.input_tokens}, output ${u.output_tokens}`);
  if (u.cache_creation_input_tokens) {
    console.log(`  Cache write: ${u.cache_creation_input_tokens} tokens`);
  }
  if (u.cache_read_input_tokens) {
    console.log(`  Cache hit: ${u.cache_read_input_tokens} tokens`);
  }
  console.log(
    `  Findings: ${result.findings.length} (${gaps} gaps, ${recs} recs, ${qs} questions)`
  );
  console.log(`  Skipped: ${result.skipped_heuristics.length} heuristics`);
  console.log(`  Coverage score: ${result.coverage_score}`);
  console.log(`  Written to: ${outPath}`);
}

main().catch((err: unknown) => {
  const e = err as { message?: string; error?: unknown };
  console.error("✗ Audit failed:", e.message ?? err);
  if (e.error) console.error(JSON.stringify(e.error, null, 2));
  process.exit(1);
});
