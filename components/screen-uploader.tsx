"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn, formatBytes } from "@/lib/utils";
import type { ScreenInput, AppError } from "@/lib/types";
import { ErrorDisplay } from "./error-display";

const MAX_FILES = 6;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per PRD §F2
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"] as const;

interface Props {
  value: ScreenInput[];
  onChange: (v: ScreenInput[]) => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

export function ScreenUploader({ value, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);
      const accepted: ScreenInput[] = [];

      for (const file of Array.from(files)) {
        if (value.length + accepted.length >= MAX_FILES) {
          setError({
            kind: "file-too-large",
            message: `Maximum ${MAX_FILES} screens`,
            detail: "Remove a screen before adding more."
          });
          break;
        }
        if (!ACCEPTED.includes(file.type as (typeof ACCEPTED)[number])) {
          setError({
            kind: "wrong-format",
            message: `${file.name} isn't a supported format`,
            detail: "Use PNG, JPG, or WEBP."
          });
          continue;
        }
        if (file.size > MAX_BYTES) {
          setError({
            kind: "file-too-large",
            message: `${file.name} is larger than 5 MB`,
            detail: `${formatBytes(file.size)} exceeds the per-image limit. Try compressing it.`
          });
          continue;
        }
        const data = await fileToBase64(file);
        accepted.push({
          index: value.length + accepted.length,
          name: file.name,
          data,
          media_type: file.type as ScreenInput["media_type"]
        });
      }

      if (accepted.length > 0) {
        const merged = [...value, ...accepted].map((s, i) => ({ ...s, index: i }));
        onChange(merged);
      }
    },
    [value, onChange]
  );

  function remove(index: number) {
    const next = value.filter((_, i) => i !== index).map((s, i) => ({ ...s, index: i }));
    onChange(next);
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next.map((s, i) => ({ ...s, index: i })));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <Label>Screens ({value.length}/{MAX_FILES})</Label>
        <span className="text-xs text-muted-foreground">PNG, JPG, or WEBP · 5 MB max each</span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-md border-2 border-dashed border-input p-6 text-center transition-colors",
          dragging && "uploader-active",
          value.length === 0 && "py-12"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            // Reset so the same file can be re-selected after removal.
            e.target.value = "";
          }}
        />
        <ImagePlus className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Drop screens here, or{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Order matters — screens are numbered as uploaded
        </p>
      </div>

      {error && <ErrorDisplay error={error} compact />}

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((s, i) => (
            <li
              key={`${s.name}-${i}`}
              className="flex items-center gap-3 rounded-md border bg-card p-2"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  aria-label="Move up"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                >
                  <GripVertical className="h-3 w-3 rotate-90" />
                </button>
              </div>
              <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center rounded bg-secondary text-xs font-semibold text-muted-foreground">
                {i}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.media_type.replace("image/", "").toUpperCase()}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove screen"
                onClick={() => remove(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
