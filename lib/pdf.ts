// Client-side PDF → text extraction via pdfjs-dist.
// Used by the context input. No PDF ever leaves the browser before we attach
// the extracted text to the audit request.

import type { AppError } from "./types.ts";

const MAX_PAGES = 20; // PRD §F2

interface ExtractResult {
  text: string;
  pageCount: number;
}

export async function extractPdfText(file: File): Promise<ExtractResult> {
  // Dynamic import — pdfjs-dist is hefty, only load when needed.
  const pdfjs = await import("pdfjs-dist");

  // Worker setup — use the bundled worker file from pdfjs.
  // Setting `workerSrc` to the import URL avoids needing a separate worker route.
  pdfjs.GlobalWorkerOptions.workerSrc = (
    await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
  ).default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;

  const pages = Math.min(doc.numPages, MAX_PAGES);
  let text = "";

  for (let p = 1; p <= pages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean)
      .join(" ");
    text += pageText + "\n\n";
  }

  return { text: text.trim(), pageCount: doc.numPages };
}

export function pdfError(kind: "corrupt-pdf" | "pdf-no-text"): AppError {
  if (kind === "corrupt-pdf") {
    return {
      kind: "corrupt-pdf",
      message: "We couldn't read that PDF.",
      detail:
        "The file may be password-protected or corrupted. Try exporting a fresh copy from the source app."
    };
  }
  return {
    kind: "pdf-no-text",
    message: "That PDF has no extractable text.",
    detail:
      "It looks like a scanned or image-based PDF. Type or paste your feature description instead."
  };
}
