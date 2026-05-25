"use client";

import { useState, useRef } from "react";
import { FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractPdfText, pdfError } from "@/lib/pdf";
import type { AppError } from "@/lib/types";
import { ErrorDisplay } from "./error-display";

const MIN_CHARS = 50;

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function ContextInput({ value, onChange }: Props) {
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handlePdf(file: File) {
    if (file.type !== "application/pdf") {
      setError({
        kind: "wrong-format",
        message: "That isn't a PDF",
        detail: "Use a PDF file, or paste your description into the text box instead."
      });
      return;
    }
    setError(null);
    setParsing(true);
    try {
      const { text } = await extractPdfText(file);
      if (text.trim().length === 0) {
        setError(pdfError("pdf-no-text"));
      } else {
        onChange(text);
        setFileName(file.name);
      }
    } catch (e) {
      console.error(e);
      setError(pdfError("corrupt-pdf"));
    } finally {
      setParsing(false);
    }
  }

  const tooShort = value.trim().length > 0 && value.trim().length < MIN_CHARS;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <Label htmlFor="context">Feature context (optional)</Label>
        <span className="text-xs text-muted-foreground">
          {value.trim().length === 0
            ? "Add a PRD or description to unlock PRD-alignment findings"
            : `${value.trim().length} chars`}
        </span>
      </div>

      <Textarea
        id="context"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a short feature description or PRD. e.g. 'A signup flow for first-time users. Email + password, no social. Must work on mobile.'"
        className="min-h-[140px]"
      />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handlePdf(f);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={parsing}
        >
          {parsing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Parsing PDF…
            </>
          ) : (
            <>
              <FileText className="h-3.5 w-3.5" /> Upload a PDF
            </>
          )}
        </Button>
        {fileName && (
          <span className="inline-flex items-center gap-1">
            Parsed from {fileName}
            <button
              type="button"
              onClick={() => {
                setFileName(null);
                onChange("");
              }}
              aria-label="Clear parsed PDF"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </div>

      {tooShort && (
        <p className="text-xs text-amber-600">
          Add a few more characters — short descriptions produce thin PRD-alignment findings.
        </p>
      )}

      {error && <ErrorDisplay error={error} compact />}
    </div>
  );
}
