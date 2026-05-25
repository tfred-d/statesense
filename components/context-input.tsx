"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Loader2, Mic, MicOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractPdfText, pdfError } from "@/lib/pdf";
import { cn } from "@/lib/utils";
import type { AppError } from "@/lib/types";
import { ErrorDisplay } from "./error-display";

export const CONTEXT_MIN_CHARS = 20;

interface Props {
  value: string;
  onChange: (v: string) => void;
}

// Minimal browser Speech Recognition surface — feature-detected, optional.
type SpeechRecognitionLike = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((e: {
        resultIndex: number;
        results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
      }) => void)
    | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

function getSpeechRecognitionCtor(): { new (): SpeechRecognitionLike } | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: { new (): SpeechRecognitionLike };
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function voiceErrorMessage(code: string | undefined): string {
  switch (code) {
    case "not-allowed":
    case "permission-denied":
      return "Microphone access was denied. Enable it in your browser settings.";
    case "no-speech":
      return "Didn't catch anything. Try speaking again, closer to the mic.";
    case "audio-capture":
      return "No microphone detected on this device.";
    case "network":
      return "Network error during voice recognition. Check your connection.";
    case "service-not-allowed":
      return "Voice recognition isn't available right now.";
    case "aborted":
      return ""; // user-initiated stop; not an error to display
    default:
      return code ? `Voice input failed (${code}).` : "Voice input failed.";
  }
}

export function ContextInput({ value, onChange }: Props) {
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [recording, setRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseTextRef = useRef<string>("");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVoiceSupported(getSpeechRecognitionCtor() !== null);
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  async function handlePdf(file: File) {
    if (file.type !== "application/pdf") {
      setError({
        kind: "wrong-format",
        message: "That isn't a PDF",
        detail: "Use a PDF file, or type your description into the box."
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

  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop();
      return;
    }

    setVoiceError(null);

    const SR = getSpeechRecognitionCtor();
    if (!SR) {
      setVoiceError("Voice input isn't supported in this browser.");
      return;
    }

    try {
      const r = new SR();
      r.continuous = true;
      r.interimResults = true;
      r.lang = "en-US";

      baseTextRef.current = value;
      let finalChunk = "";

      r.onstart = () => {
        setRecording(true);
      };

      r.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          if (result.isFinal) {
            finalChunk += transcript;
            if (!finalChunk.endsWith(" ")) finalChunk += " ";
          } else {
            interim += transcript;
          }
        }
        const base = baseTextRef.current;
        const sep = base && !base.endsWith(" ") && !base.endsWith("\n") ? " " : "";
        onChange((base + sep + finalChunk + interim).trim());
      };

      r.onerror = (e) => {
        const msg = voiceErrorMessage(e.error);
        if (msg) setVoiceError(msg);
        setRecording(false);
      };

      r.onend = () => {
        setRecording(false);
      };

      recognitionRef.current = r;
      r.start();
    } catch (err) {
      console.error("Speech recognition init failed:", err);
      setVoiceError(
        err instanceof Error ? err.message : "Couldn't start voice input."
      );
      setRecording(false);
    }
  }

  const tooShort = value.trim().length > 0 && value.trim().length < CONTEXT_MIN_CHARS;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <Label htmlFor="context">Feature context</Label>
        <span className="text-xs text-muted-foreground">
          {value.trim().length === 0
            ? "Tell us what we're looking at"
            : `${value.trim().length} chars`}
        </span>
      </div>

      <Textarea
        id="context"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="A short description works. A PRD works. Even one line works. For example: 'A signup flow for first-time users, email and password, no social.' Context makes PRD-alignment findings much sharper."
        className="min-h-[140px]"
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <input
          ref={pdfInputRef}
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
          onClick={() => pdfInputRef.current?.click()}
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

        {voiceSupported && (
          <Button
            type="button"
            variant={recording ? "default" : "outline"}
            size="sm"
            onClick={toggleRecording}
            className={cn(recording && "bg-red-600 hover:bg-red-700 text-white")}
            aria-pressed={recording}
          >
            {recording ? (
              <>
                <MicOff className="h-3.5 w-3.5" /> Stop
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" /> Voice
              </>
            )}
          </Button>
        )}

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

      {voiceError && (
        <p className="text-xs text-amber-600">{voiceError}</p>
      )}

      {tooShort && (
        <p className="text-xs text-amber-600">
          Add at least a sentence so the audit knows what it&apos;s evaluating.
        </p>
      )}

      {error && <ErrorDisplay error={error} compact />}
    </div>
  );
}
